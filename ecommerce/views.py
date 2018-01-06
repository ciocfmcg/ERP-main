from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string, get_template
from django.template import RequestContext , Context
from django.conf import settings as globalSettings
from django.core.mail import send_mail , EmailMessage
from django.core import serializers
from django.http import HttpResponse ,StreamingHttpResponse
from django.utils import timezone
from django.db.models import Min , Sum , Avg
import mimetypes
import hashlib, datetime, random
from datetime import timedelta , date
from monthdelta import monthdelta
from time import time
import pytz
import math
import json

from StringIO import StringIO
import math
import requests
# related to the invoice generator
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle, Image
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
# from .helper import *
from API.permissions import *
from HR.models import accountsKey

from django.core import serializers
from django.http import JsonResponse

def getBookingAmount(o):
    bookingHrs = o.end-o.start
    bookingHrs = math.ceil((bookingHrs.total_seconds())/(3600))
    return o.quantity*int(o.rate)*bookingHrs , bookingHrs

def sendSMS(o , to ):
    name = o.offer.item.title[:18]
    st = o.start
    et = o.end
    am , hrs= getBookingAmount(o)
    if o.status == 'new':
        msg = 'Booking details: \n Ride : %s \n From: %s \n To: %s \n Amount: %s INR\n Hours: %s' %(name , st.strftime('%a, %d. %b %y, %I:%M%p') , et.strftime('%a, %d. %b %y, %I:%M%p') , am , hrs)
    else:
        msg = 'Booking Modefied: \n Ride : %s \n From: %s \n To: %s \n Status: %s\n Hours: %s' %(name , st.strftime('%a, %d. %b %y, %I:%M%p') , et.strftime('%a, %d. %b %y, %I:%M%p') , o.status , hrs)

    if to == 'customer':
        mob = customerProfile.objects.get(user = o.user).mobile
    else:
        s = o.offer.service
        mob = s.mobile
        msg += '\nCustomer:%s\nPaid:%s' %(o.user.first_name , 'Yes')
    r = requests.get( 'http://193.105.74.159/api/v3/sendsms/plain?user=kapsystem&password=kap@user&sender=KAPNFO&SMSText=%s&type=longsms&GSM=91%s' %(msg ,mob))

def sendEmail(o , to):
    """
    input : offer objects
    output : None
    """

    it =  o.offer.item
    name = it.title[:18]
    st = o.start
    et = o.end
    am , hrs= getBookingAmount(o)
    u = o.user
    s = o.offer.service
    if to == 'customer':
        if o.status == 'new':
            topMsg = 'We are pleased to provide you the following details on your booking with us.'
        else:
            topMsg = 'The status of your booking with is now : %s.' %(o.status)
        toEmail = u.email
        link = '/#/account/orders'
    else:
        if o.status == 'new':
            topMsg = 'A new booking has been made against your offer. The details are as follows.'
        else:
            topMsg = 'The status of the below booking is now : %s.' %(o.status)
        link = '/ERP/#/businessManagement/ecommerce/orders'
        toEmail = s.user.email
    orderCtx = {
        'message' : topMsg,
        'id' : o.pk,
        'product' : name,
        'startTime' : st,
        'endTime' : et,
        'totalCost' : am,
        'totalHrs' : hrs,
    }

    ctx = {
        'logoUrl' : 'http://design.ubuntu.com/wp-content/uploads/ubuntu-logo32.png',
        'heading' : 'Thank you!',
        'recieverName' : u.first_name,
        'message': get_template('app.ecommerce.email.order.html').render(orderCtx),
        'linkUrl': 'goryd.in' + link,
        'linkText' : 'View Online',
        'sendersAddress' : 'Street 101 , State, City 100001',
        'sendersPhone' : '129087',
        'linkedinUrl' : 'linkedin.com',
        'fbUrl' : 'facebook.com',
        'twitterUrl' : 'twitter.com',
    }

    # Send email with activation key
    email_subject = '[Ecommerce] Booking Details for Order ID: %s' % (o.pk)
    email_body = get_template('app.ecommerce.email.html').render(ctx)
    msg = EmailMessage(email_subject, email_body, to= [toEmail] , from_email= 'pkyisky@gmail.com' )
    msg.content_subtype = 'html'
    msg.send()


class insightApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        user = self.request.user
        if 'offering' in self.request.GET:
            s = service.objects.get(user = user)
            offr = offering.objects.get(pk = self.request.GET['offering'] , service = s)
            ordrs = order.objects.filter(offer = offr) # total orders for this offer
            td = timezone.now() # today
            ordrsLastMonth = ordrs.filter(end__range=[td - timedelta(days = 30) , td]) # orders recieved in the past one month
            lastMonthRevenue = 0
            for o in ordrsLastMonth:
                a , _  = getBookingAmount(o)
                lastMonthRevenue += a
            allOfrs = offering.objects.filter(item = offr.item)
            lowestRate = allOfrs.aggregate(Min('rate'))
            content = {'totalBookings' : ordrs.count() ,
                'lastMonthBooking' : ordrsLastMonth.count(),
                'lastMonthRevenue' : lastMonthRevenue,
                'vendors' : allOfrs.count(),
                'lowestRate' : lowestRate}
            return Response(content, status=status.HTTP_200_OK)
        if 'listing' in self.request.GET:
            l = listing.objects.get(pk = self.request.GET['listing'])
            if self.request.GET['mode'] == 'operations':
                allOfrs = offering.objects.filter(item = l) # all offers
                lowestRate = allOfrs.aggregate(Min('rate'))
                ordrs = order.objects.filter(offer__in = allOfrs) # all orders
                td = timezone.now() # today
                ordrsLastMonth = ordrs.filter(end__range=[td - timedelta(days = 30) , td]) # orders recieved in the past one month
                lastMonthRevenue = 0
                for o in ordrsLastMonth:
                    a , _  = getBookingAmount(o)
                    lastMonthRevenue += a
                    content = {'totalBookings' : ordrs.count() ,
                    'lastMonthBooking' : ordrsLastMonth.count(),
                    'lastMonthRevenue' : lastMonthRevenue,
                    'vendors' : allOfrs.count(),
                    'inStock' : allOfrs.aggregate(Sum('inStock')),
                    'lowestRate' : lowestRate}
                    return Response(content, status=status.HTTP_200_OK)
            elif self.request.GET['mode'] == 'public':
                rs = review.objects.filter(item = l)
                content = {
                'averageRating' : rs.aggregate(Avg('rating')),
                'counts' : [
                    rs.filter(rating = 5).count() ,
                    rs.filter(rating = 4).count() ,
                    rs.filter(rating = 3).count() ,
                    rs.filter(rating = 2).count() ,
                    rs.filter(rating = 1).count() ,
                    ],
                }
                return Response(content, status=status.HTTP_200_OK)
        return Response({'NO_STARTING_POINT' : 'you have not provided any object for analysis'} , status=status.HTTP_400_BAD_REQUEST)


class requestConfirmationApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        u = self.request.user
        if 'order' in request.GET and  'mode' in request.GET and 'to' in request.GET:
            o = order.objects.get(pk = request.GET['order'] , user = u)
            m = request.GET['mode']
            to = request.GET['to']
            if  m == 'sms':
                sendSMS(o , to )
            elif m == 'email':
                sendEmail(o , to )
            return Response({'OK' , 'OK'}, status=status.HTTP_200_OK)
        else:
            return Response({'NO_ORDER_ID_OR_MODE_OR_TO_SPECIFIED' : 'you have not provided order ID'} , status=status.HTTP_400_BAD_REQUEST)

class earningsApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        user = self.request.user
        s = service.objects.get(user = user)
        os = offering.objects.filter(service = s)
        td = timezone.now() # today
        # print td.month
        # weeks starts on monday and ends on sunday
        enddate = td - timedelta((td.weekday() + 1) % 7) # last week's sunday
        startdate = enddate - timedelta(days=6) # last week's monday
        cxo = order.objects.filter(offer__in = os , status='canceledByVendor' , end__range= [enddate , td]).count() # current weeks cancelled orders
        cco = order.objects.filter(offer__in = os , status='completed' , end__range= [enddate , td]).count() # current weeks cancelled orders
        acol = order.objects.filter(offer__in = os , status='complete' , end__range= [startdate , enddate]).order_by('-created') # all completed orders in last week
        lastWeekEarnings = 0
        for o in acol:
            a , _ = getBookingAmount(o)
            lastWeekEarnings += a
        # for last to last week
        enddate = enddate - timedelta(weeks=1) # last week's sunday
        startdate = startdate - timedelta(weeks=1) # last week's monday
        acol = order.objects.filter(offer__in = os , status='complete' , end__range= [startdate , enddate]).order_by('-created') # all completed orders in last week
        last2LastWeekEarnings = 0
        for o in acol:
            a , _ = getBookingAmount(o)
            last2LastWeekEarnings += a

        monthWiseBookings = []
        monthWiseRevenue = []
        months = []
        for i in range(0,12):
            acol = order.objects.filter(offer__in = os , status='complete' , end__range= [enddate - monthdelta(1) , enddate]).order_by('-created') # all completed orders in last week
            enddate = enddate - monthdelta(1)
            months.append(enddate.strftime('%b'))
            ta = 0
            for o in acol:
                a , _ = getBookingAmount(o)
                ta += a
            monthWiseRevenue.append(ta)
            monthWiseBookings.append(acol.count())
        print monthWiseRevenue
        print monthWiseBookings

        tco = order.objects.filter(offer__in = os , status='complete') # total completed orders so far
        ipo = order.objects.filter(offer__in = os , status='inProgress') # inProgress orders
        expectedThisWeek = 0
        for o in ipo:
            a , _ = getBookingAmount(o)
            expectedThisWeek += a
        totalRevenue = 0
        for o in tco:
            a , _ = getBookingAmount(o)
            totalRevenue += a
        content = {'last2LastWeekEarnings' : last2LastWeekEarnings ,
            'lastWeekEarnings' : lastWeekEarnings ,
            'completeLastWeek': acol.count(),
            'totalCompletedOrders' : tco.count() ,
            'inProgressOrders' : ipo.count() ,
            'cancelledThisWeek' : cxo ,
            'completeThisWeek' : cco ,
            'expectedThisWeek' : expectedThisWeek,
            'monthWiseBookings' : monthWiseBookings,
            'monthWiseRevenue' : monthWiseRevenue,
            'totalRevenue' : totalRevenue,
            'months' : months}
        return Response(content, status=status.HTTP_200_OK)

def ecommerceHome(request):
    if globalSettings.ECOMMERCE_APP['ui'] == 'rental':
        return render(request , 'ngEcommerce.rental.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN})
    elif globalSettings.ECOMMERCE_APP['ui'] == 'food':
        return render(request , 'ngEcommerce.food.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN})


def genInvoice(c , o, ofr , it, se): # canvas , order , offer , item , service
    c.setFont("Times-Roman" , 20)
    c.drawCentredString(2*cm, 27*cm,"Brand")
    c.line(1*cm , 26*cm ,20*cm,26*cm )
    c.drawImage(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'logo.png') , 3*cm , 26.2*cm , 2*cm, 2*cm)
    c.setFont("Times-Roman" , 12)
    c.drawString(5*cm, 27.35*cm , "Contact us : 1800 1234 5678 | care@ecommerce.com")
    styles=getSampleStyleSheet()
    sead = se.address # service provide address
    serAddress = '<p><font size=14>%s.</font><font size=10>  34, %s , %s, %s, Pin : %s</font></p>' %(se.name , sead.street , sead.city , sead.state , sead.pincode)
    p = Paragraph( serAddress , styles['Normal'])
    p.wrapOn(c, 15*cm, 1*cm)
    p.drawOn(c, 5*cm, 26.3*cm)
    c.setDash(6,3)
    c.rect(14.4*cm, 27.2*cm, 5.5*cm, 0.6*cm )
    c.drawString(14.5*cm, 27.35*cm , "Invoice # DEL-%s" %(o.pk))
    pSrc = '''
        <font size=10>
            <strong>Order ID: OD%s</strong><br/><br/>
            <strong>Order Date : </strong> %s <br/>
            <strong>Invoice Date : </strong> %s <br/>
            <strong>VAT/TIN : </strong> %s <br/>
            <strong>CST# : </strong> %s <br/>
        </font>
    ''' % (o.pk , o.created.date() , o.created.date() , se.tin , se.tin)
    p = Paragraph( pSrc , styles['Normal'])
    p.wrapOn(c, 6*cm, 5*cm)
    p.drawOn(c, 1*cm, 22.4*cm)
    custAdd = o.address # customer address
    cust = o.user
    pSrc = '''
        <font size=10>
            <strong>Billing Address</strong><br/><br/>
            %s %s<br/>
            %s,<br/>
            %s Pin : %s,<br/>
            %s<br/>
            Phone : %s <br/>
        </font>
    ''' % (cust.first_name , cust.last_name , custAdd.street ,custAdd.city , custAdd.pincode , custAdd.state , o.mobile )
    p = Paragraph( pSrc , styles['Normal'])
    p.wrapOn(c, 6*cm, 5*cm)
    p.drawOn(c, 7.5*cm, 22*cm)
    pSrc = '''
        <font size=10>
            <strong>Shipping Address</strong><br/><br/>
            %s %s<br/>
            %s,<br/>
            %s Pin : %s,<br/>
            %s<br/>
            Phone : %s <br/>
        </font>
    ''' % (cust.first_name , cust.last_name , custAdd.street ,custAdd.city , custAdd.pincode , custAdd.state , o.mobile )
    p = Paragraph( pSrc , styles['Normal'])
    p.wrapOn(c, 6*cm, 5*cm)
    p.drawOn(c, 14*cm, 22*cm)
    c.setDash()
    pHeadProd = Paragraph('<strong>Product</strong>' , styles['Normal'])
    pHeadDetails = Paragraph('<strong>Details</strong>' , styles['Normal'])
    pHeadQty = Paragraph('<strong>Qty</strong>' , styles['Normal'])
    pHeadPrice = Paragraph('<strong>Price</strong>' , styles['Normal'])
    pHeadTax = Paragraph('<strong>Tax</strong>' , styles['Normal'])
    pHeadTotal = Paragraph('<strong>Total</strong>' , styles['Normal'])

    bookingTotal , bookingHrs = getBookingAmount(o)

    pSrc = ''''<strong>%s</strong><br/>(5.00%sCST) <br/><strong>Start : </strong> %s <br/>
        <strong>End : </strong> %s <br/><strong>Booking Hours : </strong> %s Hours <br/>
        ''' %(it.description[0:40] , '%' , o.start.strftime('%Y-%m-%d , %H:%M %p'), o.end.strftime('%Y-%m-%d , %H:%M %p'), bookingHrs)
    pBodyProd = Paragraph('%s <strong>VB%s</strong>' %(it.title , it.pk) , styles['Normal'])
    pBodyTitle = Paragraph( pSrc , styles['Normal'])
    pBodyQty = Paragraph('%s' % (o.quantity) , styles['Normal'])
    pBodyPrice = Paragraph('<strong> %s </strong>/ Hr' % (ofr.rate) , styles['Normal'])

    tax = 0.05*bookingTotal
    pBodyTax = Paragraph('%s' % (tax) , styles['Normal'])
    pBodyTotal = Paragraph('%s' %(bookingTotal) , styles['Normal'])

    pFooterQty = Paragraph('%s' % (o.quantity) , styles['Normal'])
    pFooterTax = Paragraph('%s' %(tax) , styles['Normal'])
    pFooterTotal = Paragraph('%s' % (bookingTotal) , styles['Normal'])
    pFooterGrandTotal = Paragraph('%s' % (bookingTotal) , styles['Normal'])

    data = [[ pHeadProd, pHeadDetails, pHeadPrice , pHeadQty, pHeadTax , pHeadTotal],
            [pBodyProd, pBodyTitle, pBodyPrice, pBodyQty, pBodyTax , pBodyTotal],
            ['', '', '', pFooterQty, pFooterTax , pFooterTotal],
            ['', '', '', 'Grand Total', '' , pFooterGrandTotal]]
    t=Table(data)
    ts = TableStyle([('ALIGN',(1,1),(-2,-2),'RIGHT'),
                ('SPAN',(-3,-1),(-2,-1)),
                ('LINEABOVE',(0,0),(-1,0),0.25,colors.gray),
                ('LINEABOVE',(0,1),(-1,1),0.25,colors.gray),
                ('LINEABOVE',(-3,-2),(-1,-2),0.25,colors.gray),
                ('LINEABOVE',(0,-1),(-1,-1),0.25,colors.gray),
                ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
            ])
    t.setStyle(ts)
    t._argW[0] = 3*cm
    t._argW[1] = 8*cm
    t._argW[2] = 2*cm
    t._argW[3] = 2*cm
    t._argW[4] = 2*cm
    t._argW[5] = 2*cm
    t.wrapOn(c, 19*cm, 6*cm)
    t.drawOn(c, 1*cm, 18*cm)

class printInvoiceApi(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        if 'id' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        o = order.objects.get(id = request.GET['id'])
        ofr = o.offer
        it = ofr.item
        se = ofr.service

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="invoice.pdf"'

        c = canvas.Canvas(response , pagesize=A4)
        pageWidth, pageHeight = A4
        genInvoice(c , o, ofr , it, se)
        c.showPage()
        c.save()
        return response

class offeringAvailabilityApi(APIView): # checks for availabilty of an offer in a time period
    renderer_classes = (JSONRenderer,)
    def get(self, request , format = None):
        utc=pytz.UTC
        if request.GET['mode']=='time':
            try:
                s = datetime.datetime.strptime(request.GET['start'], '%Y-%m-%dT%H:%M:%S.%fZ')
            except:
                s = datetime.datetime.strptime(request.GET['start'], '%Y-%m-%dT%H:%M:%SZ')
            s = s.replace(tzinfo=utc)
            try:
                e = datetime.datetime.strptime(request.GET['end'], '%Y-%m-%dT%H:%M:%S.%fZ')
            except:
                e = datetime.datetime.strptime(request.GET['end'], '%Y-%m-%dT%H:%M:%SZ')
            e = e.replace(tzinfo=utc)
            booked = 0
            for o in order.objects.filter(offer=int(request.GET['offering'])):
                if o.start <e and o.start>s:
                    booked += 1
                if o.end <e and o.end>s:
                    booked += 1
            print offering.objects.get(pk = request.GET['offering']).inStock
            if booked < offering.objects.get(pk = request.GET['offering']).inStock:
                available = True
            else:
                available = False
            content = {'available' : available}
        return Response(content , status = status.HTTP_200_OK)

class locationAutoCompleteApi(APIView): # suggest places for a query
    permission_classes = (permissions.AllowAny ,)
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        query = request.GET['query']
        r = requests.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&language=in&key=AIzaSyDqZoDeSwSbtfkFawD-VoO7nx2WLD3mCgU&input=' + query)
        return Response(r.json(),status = status.HTTP_200_OK)
    # def post(self , request , format = None):
    #     print request.FILES
    #     print "get : ", request.GET
    #     print "data : ", request.data
    #     print "post : ", request.POST
    #     return Response( {}, status = status.HTTP_200_OK)

class locationDetailsApi(APIView): # returns location details such as lattitude and longitude for a given location id
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def get(self , request , format = None):
        id = request.GET['id']
        print id
        r = requests.get('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyDqZoDeSwSbtfkFawD-VoO7nx2WLD3mCgU&placeid=' + id)
        return Response(r.json(),status = status.HTTP_200_OK)


class supportApi(APIView): # on the support tab of the accounts page , the users have a form with subject and body input , they can use that to send a main to the support team
    def post(self , request , format = None):
        subject = request.data['subject']
        body = request.data['body']
        user = self.request.user

        send_mail(subject, body, 'ciocpky@gmail.com', # support email , it should be something like support@ecommerce.com
        [user.email , 'help@ecommerce.com'], fail_silently=False) # here the email is an array of email address
        return Response(status = status.HTTP_200_OK)

class fieldViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = field.objects.all()
    serializer_class = fieldSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class genericTypeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin, )
    queryset = genericType.objects.all()
    serializer_class = genericTypeSerializer

class genericProductViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = genericProduct.objects.all()
    serializer_class = genericProductSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']


class genericProductLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly , )
    queryset = genericProduct.objects.all()
    serializer_class = genericProductLiteSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class mediaViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = media.objects.all()
    serializer_class = mediaSerializer

class listingSearchViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, )
    queryset = listing.objects.all()
    serializer_class = listingLiteSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']
    def list(self , request, *args, **kwargs):
        u = self.request.user



        if 'lat' in self.request.GET and 'lon' in self.request.GET:
            if globalSettings.ECOMMERCE_APP['ui'] == 'food':
                minDist = 10000000 # distance array
                sa = service.objects.all() # service array
                srvc = None
                for s in sa:
                    p1 = {'lat' : s.address.lat , 'lon' : s.address.lon}
                    p2 = {'lat' : self.request.GET['lat'] , 'lon' : self.request.GET['lon'] }
                    d = geoDistance(p1 , p2)
                    if d is not None and d<100000 and d<minDist:
                        minDist = d
                        srvc = s
                la = list() # listings array
                if srvc is None:
                    content = {'mode' : 'Sorry but we do not serve this locality yet'}
                    raise NotAcceptable(detail=content )
                else:
                    for l in listing.objects.filter(providerOptions__in = offering.objects.filter(service =srvc) , parentType__id=int(request.GET['category'])):
                        if l not in la:
                            la.append(l)

            else:
                da = [] # distance array
                sa = service.objects.all() # service array
                for s in sa:
                    p1 = {'lat' : s.address.lat , 'lon' : s.address.lon}
                    p2 = {'lat' : self.request.GET['lat'] , 'lon' : self.request.GET['lon'] }
                    d = geoDistance(p1 , p2)
                    if d is not None and d<100000:
                        da.append(d)
                la = list() # listings array
                for k in sorted(range(len(da)), key=lambda k: da[k]):
                    for l in listing.objects.filter(providerOptions__in = offering.objects.filter(service = sa[k])):
                        if l not in la:
                            la.append(l)
            serializer = listingLiteSerializer(la , many = True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            content = {'mode' : 'No location data specified'}
            raise NotAcceptable(detail=content )

class listingLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, )
    serializer_class = listingLiteSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']
    def get_queryset(self):
        # u = self.request.user
        # has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        if 'mode' in  self.request.GET:
            if self.request.GET['mode'] == 'vendor':
                s = service.objects.get(user = u)
                items = offering.objects.filter( service = s).values_list('item' , flat = True)
                return listing.objects.exclude(pk__in = items)
            elif self.request.GET['mode'] == 'suggest':
                return listing.objects.all()[:5]
        else:
            return listing.objects.all()


def geoDistance(p1 , p2):
    """
    Returns the location distance between two position p1 and p2 p1.lat/lon is the lat lon of the location p1
    """
    if p1['lat'] is None:
        return None
    lat1 = float(p1['lat'])*math.pi/180
    lon1 = float(p1['lon'])*math.pi/180
    lat2 = float(p2['lat'])*math.pi/180
    lon2 = float(p2['lon'])*math.pi/180
    R = 6371000
    psy1 = lat1
    psy2 = lat2
    deltaPsy = (lat2-lat1)
    deltaLambda = (lon2-lon1)
    a = math.sin(deltaPsy/2) * math.sin(deltaPsy/2) + math.cos(psy1) * math.cos(psy2) *  math.sin(deltaLambda/2) * math.sin(deltaLambda/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    d = R * c
    return d


class listingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = listingSerializer
    queryset = listing.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

    def list(self , request, *args, **kwargs):
        u = self.request.user
        if 'lat' in self.request.GET and 'lon' in self.request.GET:
            da = [] # distance array
            sa = service.objects.all() # service array
            for s in sa:
                p1 = {'lat' : s.address.lat , 'lon' : s.address.lon}
                p2 = {'lat' : self.request.GET['lat'] , 'lon' : self.request.GET['lon'] }
                d = geoDistance(p1 , p2)
                if d<30000:
                    da.append(d)
            la = list() # listings array
            for k in sorted(range(len(da)), key=lambda k: da[k]):
                for l in listing.objects.filter(providerOptions__in = offering.objects.filter(service = sa[k])):
                    if l not in la:
                        la.append(l)
            serializer = listingSerializer(la , many = True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'vendor':
                s = service.objects.get(user = u)
                items = offering.objects.filter( service = s).values_list('item' , flat = True)
                la = listing.objects.exclude(pk__in = items)
        else:
            la = listing.objects.all()
        serializer = listingSerializer(la , many = True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class orderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = orderSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']
    def get_queryset(self):
        u = self.request.user
        if 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'provider':
                has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.orders'])
                return order.objects.filter(offer__in = u.ecommerceOfferings.all())
            elif self.request.GET['mode'] == 'consumer':
                return order.objects.filter(user = u)
        else:
            content = {'mode' : 'No mode specified , please specified either of mode = provider or consumer'}
            raise PermissionDenied(detail=content)


class savedViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = savedSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']
    def get_queryset(self):
        u = self.request.user
        return saved.objects.filter(user = u)

class customerProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = customerProfileSerializer
    def get_queryset(self):
        u = self.request.user
        cp = customerProfile.objects.filter(user = u)
        if not cp.exists():
            a = address()
            a.save()
            cp = customerProfile(user = u , address = a)
            cp.save()
            return customerProfile.objects.filter(user = u)
        return cp

class choiceLabelViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin,)
    queryset = choiceLabel.objects.all()
    serializer_class = choiceLabelSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class choiceOptionViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin,)
    queryset = choiceOption.objects.all()
    serializer_class = choiceOptionSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name', 'parent']

class offeringViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = offering.objects.all().order_by('rate')
    serializer_class = offeringSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['item']

class offeringAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = offeringAdminSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['item']
    def get_queryset(self):
        u = self.request.user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.offerings'])
        return offering.objects.filter(user = u)


class feedbackViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = feedbackSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['mobile']
    def get_queryset(self):
        print "hey there"
        u = self.request.user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.feedbacks'])
        return feedback.objects.all()

class reviewViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , readOnly )
    serializer_class = reviewSerializer
    def get_queryset(self):
        if 'listing' in self.request.GET:
            print self.request.GET['variable1']
            print self.request.GET['variable2']
            return review.objects.filter(item = self.request.GET['listing'])
        else:
            u = self.request.user
            has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.reviews'])
            return review.objects.all()


class reviewLikeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = reviewLike.objects.all()
    serializer_class = reviewLikeSerializer

class offerBannerViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly, )
    serializer_class = offerBannerSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'configure':
                return offerBanner.objects.all()
        return offerBanner.objects.filter(active = True)
