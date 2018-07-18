from __future__ import unicode_literals
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
from django.db.models import Min , Sum , Avg , Q
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
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
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
import datetime
from API.permissions import *
from HR.models import accountsKey
from reportlab.graphics.barcode.qr import QrCodeWidget
from django.core import serializers
from django.http import JsonResponse
from django.db.models import F ,Value,CharField,Prefetch
import ast
from reportlab.graphics import barcode , renderPDF
from django.utils import timezone

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
from HR.models import profile
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.core.mail import send_mail, EmailMessage
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors, utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from PIL import Image
from dateutil.relativedelta import relativedelta
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode, renderPDF
from reportlab.graphics.shapes import *
import calendar as pythonCal
from ERP.models import service, appSettingsField
# Create your views here.

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN})

class SearchProductAPI(APIView):
    renderer_classes = (JSONRenderer,)
    # permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        if 'search' in self.request.GET:
            search = str(self.request.GET['search'])
            l = int(self.request.GET['limit'])
            print l , type(l)
            genericProd = list(genericProduct.objects.filter(name__icontains=search).values('pk','name').annotate(typ= Value('generic',output_field=CharField())))
            listProd = list(listing.objects.filter(product__name__icontains=search).values('pk').annotate(name=F('product__name') , typ= Value('list',output_field=CharField())))
            tosend = genericProd + listProd
            print tosend[0:l]
            return Response(tosend[0:l], status = status.HTTP_200_OK)

class PromoCheckAPI(APIView):
    renderer_classes = (JSONRenderer,)
    # permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        if 'name' in self.request.GET:
            print self.request.GET['name']
            promObj = Promocode.objects.filter(name = self.request.GET['name'])
            val = 0
            if len(promObj)>0:
                if timezone.now()<=promObj[0].endDate:
                    orderCount = Order.objects.filter(~Q(status='failed'),user=request.user,promoCode=self.request.GET['name']).count()
                    toReturn = 'Success' if orderCount<promObj[0].validTimes else 'Already Used'
                    val = promObj[0].discount if toReturn=='Success' else 0
                else:
                    toReturn = 'Promocode Has Expired'
            else:
                toReturn = 'Invalid Promocode'
            return Response({'msg':toReturn,'val':val}, status = status.HTTP_200_OK)



class CreateOrderAPI(APIView):
    renderer_classes = (JSONRenderer,)
    # permission_classes = (permissions.IsAuthenticated ,)
    def post(self , request , format = None):
        print request.data
        oQMp = []
        totalAmount = 0
        msg = 'Error'
        contactData=[]
        userCart = Cart.objects.filter(user=request.user)
        print userCart.count(),userCart
        for i in request.data['products']:
            pObj = listing.objects.get(pk = i['pk'])
            pp = pObj.product.price
            if pp > 0:
                a = pp - (pObj.product.discount*pp)/100
                b = a - (request.data['promoCodeDiscount']*a)/100
            else:
                b=0
            totalAmount += b * i['qty']
            print {'product':pObj,'qty':i['qty'],'totalAmount':int(round(pp))*i['qty'],'discountAmount':int(round(pp-b))*i['qty']}
            oQMObj = OrderQtyMap.objects.create(**{'product':pObj,'qty':i['qty'],'totalAmount':int(round(pp)),'discountAmount':int(round(pp-b))})
            oQMp.append(oQMObj)
        else:
            data = {
            'user':User.objects.get(pk=request.user.pk),
            'totalAmount' : round(totalAmount,2),
            'paymentMode' : str(request.data['modeOfPayment']),
            'modeOfShopping' : str(request.data['modeOfShopping']),
            'paidAmount' : str(request.data['paidAmount']),
            'landMark' : str(request.data['address']['landMark']),
            'street' : str(request.data['address']['street']),
            'city' : str(request.data['address']['city']),
            'state' : str(request.data['address']['state']),
            'pincode' : str(request.data['address']['pincode']),
            'country' : str(request.data['address']['country']),
            'mobileNo' : str(request.data['address']['mobile']),
            }
            if len(str(request.data['promoCode'])) > 0:
                data['promoCode'] = str(request.data['promoCode'])
            print data
            orderObj = Order.objects.create(**data)
            for i in oQMp:
                orderObj.orderQtyMap.add(i)
            orderObj.save()
            msg = 'Sucess'
            userCart.delete()
            # response = HttpResponse(content_type='application/pdf')
            # response['Content-Disposition'] = 'attachment; filename="order_invoice%s_%s_%s.pdf"' % (
            # orderObj.totalAmount, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, orderObj.pk)
            # genInvoice(response, orderObj, request)
            # f = open(os.path.join(globalSettings.BASE_DIR, 'media_root/order_invoice%s%s_%s.pdf' %
            #                   ( orderObj.totalAmount, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, orderObj.pk)), 'wb')
            # f.write(response.content)
            # f.close()
            value = []
            totalPrice = 0
            promoAmount = 0
            total=0
            price = 0
            grandTotal = 0
            promoObj = Promocode.objects.all()
            for p in promoObj:
                if str(p.name)==str(orderObj.promoCode):
                    promoAmount = p.discount
            print promoAmount
            a = '#'
            docID = str(a) + str(orderObj.pk)
            print docID,'aaaaaaaaaaaaaaaaaaaaabbbbbbbbb'
            for i in orderObj.orderQtyMap.all():
                price = i.product.product.price - (i.product.product.discount * i.product.product.price)/100
                price=round(price, 2)
                totalPrice=i.qty*price
                totalPrice=round(totalPrice, 2)
                total+=totalPrice
                total=round(total, 2)
                value.append({ "productName" : i.product.product.name,"qty" : i.qty , "amount" : totalPrice,"price":price})
            grandTotal=total-(promoAmount * total)/100
            grandTotal=round(grandTotal, 2)
            ctx = {
                'heading' : "Invoice Details",
                'recieverName' : orderObj.user.first_name  + " " +orderObj.user.last_name ,
                'linkUrl': 'cioc.co.in',
                'sendersAddress' : 'CIOC',
                # 'sendersPhone' : '122004',
                'grandTotal':grandTotal,
                'total': total,
                'value':value,
                'docID':docID,
                'data':orderObj,
                'promoAmount':promoAmount,
                'linkedinUrl' : 'https://www.linkedin.com/',
                'fbUrl' : 'https://facebook.com',
                'twitterUrl' : 'https://twitter.com',
            }
            print ctx
            email_body = get_template('app.ecommerce.emailDetail.html').render(ctx)
            # email_subject = "Order Details:"
            # msgBody = " Your Order has been placed and details are been attached"
            contactData.append(str(orderObj.user.email))
            print 'aaaaaaaaaaaaaaa'
            msg = EmailMessage("Order Details" , email_body, to= contactData  )
            msg.content_subtype = 'html'
            # a = str(f).split('media_root/')[1]
            # b = str(a).split("', mode")[0]
            # msg.attach_file(os.path.join(globalSettings.MEDIA_ROOT,str(b)))
            msg.send()
            return Response({}, status = status.HTTP_200_OK)


class fieldViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = field.objects.all()
    serializer_class = fieldSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class genericProductViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = genericProduct.objects.all()
    serializer_class = genericProductSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name','parent']

class mediaViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = media.objects.all()
    serializer_class = mediaSerializer


def getProducts(lst , node):
    lst = lst | listing.objects.filter(parentType = node)
    for child in node.children.all():
        lst = getProducts(lst , child)
    return lst

class listingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = listingSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parentType']

    def get_queryset(self):

        data = self.request.GET
        if 'recursive' in data:
            if data['recursive'] == '1':
                prnt = genericProduct.objects.get(id = data['parent'])
                toReturn = listing.objects.filter(parentType = prnt)
                for child in prnt.children.all():
                    toReturn = getProducts(toReturn , child)

                if 'minPrice' in data:
                    minPrice = data['minPrice']
                    maxPrice = data['maxPrice']
                    toReturn = toReturn.filter(product__price__lte = maxPrice , product__price__gte = minPrice)

                if 'fields' in data:
                    d = ast.literal_eval(data['fields'])
                    if len(d)!=0:
                        count = 0
                        for k,v in d.items():
                            if count == 0:
                                count += 1
                                if type(v)==list:
                                    for idx,c in enumerate(v):
                                        if idx == 0:
                                            qry1 = Q(specifications__icontains = '"name":"{0}","value":"{1}"'.format(k,c))
                                        else:
                                            qry1 = qry1 | Q(specifications__icontains = '"name":"{0}","value":"{1}"'.format(k,c))
                                    qry = qry1
                                else:
                                    # qry = Q(dfs__name=k,dfs__value=v)
                                    qry = Q(specifications__icontains = '"name":"{0}","value":"{1}"'.format(k,v))
                            else:
                                if type(v)==list:
                                    for idx,c in enumerate(v):
                                        if idx == 0:
                                            qry2 = Q(specifications__icontains = '"name":"{0}","value":"{1}"'.format(k,c))
                                        else:
                                            qry2 = qry2 | Q(specifications__icontains = '"name":"{0}","value":"{1}"'.format(k,c))
                                    qry = qry & qry2
                                else:
                                    # qry = qry & Q(dfs__name=k,dfs__value=v)
                                    qry = qry & Q(specifications__icontains = '"name":"{0}","value":"{1}"'.format(k,v))
                        print 'gggggggggggqqqqqqqqqqq',qry
                        toReturn = toReturn.filter(qry)
                        print 'filtered',toReturn
                        print len(toReturn)


                # for idx,c in enumerate(self.request.GET[]):
                #         if idx == 0:
                #             qry = Q(specifications__icontains = '"name":"place","value":"'+ cities[idx])
                #         else:
                #             qry = qry | Q(specifications__icontains = '"name":"place","value":"'+ cities[idx])

                # if 'city' in self.request.GET:
                #     cities = self.request.GET.getlist('city')
                #     cL = len(cities)
                #     for idx,c in enumerate(cities):
                #         if idx == 0:
                #             qry = Q(specifications__icontains = '"name":"place","value":"'+ cities[idx])
                #         else:
                #             qry = qry | Q(specifications__icontains = '"name":"place","value":"'+ cities[idx])

                    # toReturn = toReturn.filter(qry)
                return toReturn
        else:
            return listing.objects.all()

class listingLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, )
    serializer_class = listingLiteSerializer
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

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class offerBannerViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly, )
    serializer_class = offerBannerSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']
    def get_queryset(self):
        return offerBanner.objects.all()
        # return offerBanner.objects.filter(active = True)

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = CartSerializer
    queryset = Cart.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','typ']

class ActivitiesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = ActivitiesSerializer
    # queryset = Activities.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','typ','product']
    def get_queryset(self):
        a = Activities.objects.filter(user=self.request.user).order_by('-created')
        pPk = []
        aPk = []
        for i in a :
            if i.product:
                if i.product.pk not in pPk:
                    pPk.append(i.product.pk)
                    aPk.append(i.pk)
                else:
                    a = a.exclude(product=i.product)
        return Activities.objects.filter(pk__in=aPk).order_by('-created')

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','pincode']

class TrackingLogViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = TrackingLog.objects.all()
    serializer_class = TrackingLogSerializer

class OrderQtyMapViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = OrderQtyMap.objects.all()
    serializer_class = OrderQtyMapSerializer

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    # queryset = Order.objects.all()
    serializer_class = OrderSerializer
    def get_queryset(self):
        return Order.objects.filter( ~Q(status = 'failed')).order_by('-created')

class PromocodeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = Promocode.objects.all()
    serializer_class = PromocodeSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class FrequentlyQuestionsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    queryset = FrequentlyQuestions.objects.all()
    serializer_class = FrequentlyQuestionsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['ques']


class SendStatusAPI(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        emailAddr=[]
        request.data['value'],'aaaaaaaaaaaaaa'
        oq = OrderQtyMap.objects.filter(pk = request.data['value'])
        for i in oq:
            productId = i.pk
            productStatus = i.status
            productName = i.product.product.name
            qty = i.qty
        print str(productName)
        o = Order.objects.filter(orderQtyMap = productId)
        for j in o:
            orderId = j.pk
            emailAddr.append(j.user.email)
        # emailAddr.append(customer.email)
        email_subject = "Order Details:"
        if productStatus == 'created':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been placed"
        elif productStatus == 'packed':
            msgBody = "Your order status with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been packed"
        elif productStatus == 'shipped':
            msgBody = "Your order status with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been changed from packed to shipped"
        elif productStatus == 'inTransit':
            msgBody = "Your order status with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been changed from shipped to  in Transit"
        elif productStatus == 'reachedNearestHub':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has Reached to the nearest Hub"
        elif productStatus == 'outForDelivery':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" is Out for delivery"
        elif productStatus == 'delivered':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been Delivered to you"
        elif productStatus == 'cancelled':
            msgBody = "Your request to cancel the order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been accepted"
        elif productStatus == 'returned':
            msgBody ="Your request to return the order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been accepted"
        msg = EmailMessage(email_subject, msgBody,  to= emailAddr )
        msg.send()
        return Response({}, status = status.HTTP_200_OK)



themeColor = colors.HexColor('#227daa')

styles=getSampleStyleSheet()
styleN = styles['Normal']
styleH = styles['Heading1']


settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()


class FullPageImage(Flowable):
    def __init__(self , img):
        Flowable.__init__(self)
        self.image = img

    def draw(self):
        img = utils.ImageReader(self.image)

        iw, ih = img.getSize()
        aspect = ih / float(iw)
        width, self.height = PAGE_SIZE
        width -= 3.5*cm
        self.canv.drawImage(os.path.join(BASE_DIR , self.image) , -1 *MARGIN_SIZE + 1.5*cm , -1* self.height + 5*cm , width, aspect*width)

class expanseReportHead(Flowable):

    def __init__(self, request , contract):
        Flowable.__init__(self)
        self.req = request
        self.contract = contract
    #----------------------------------------------------------------------
    def draw(self):
        """
        draw the floable
        """
        now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
        docTitle = 'ORDER INVOICE'
        dateCreated=self.contract.created.strftime("%d-%m-%Y")
        passKey = '%s%s'%(str(self.req.user.date_joined.year) , self.req.user.pk) # also the user ID
        docID = '%s%s' %( now.year , self.contract.pk)


        pSrc = '''
        <font size=10>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
        <font size=8>
        <strong>Dated:</strong> %s<br/><br/>
        <strong>Invoice ID:</strong> %s<br/><br/>
        </font>
        ''' % ( docTitle  , dateCreated , docID)

        story = []
        head = Paragraph(pSrc , styleN)
        head.wrapOn(self.canv , 200*mm, 50*mm)
        head.drawOn(self.canv , 0*mm, -10*mm)

        # barcode_value = "1234567890"
        # barcode39 = barcode.createBarcodeDrawing('EAN13', value = barcode_value,barWidth=0.3*mm,barHeight=10*mm)
        #
        # barcode39.drawOn(self.canv,160*mm,0*mm)
        # self.canv.drawImage(os.path.join(BASE_DIR , 'logo.png') , 80*mm , 0*mm , 2*cm, 2*cm)

def addPageNumber(canvas, doc):
    """
    Add the page number
    """
    print doc.contract
    now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    passKey = '%s%s'%(str(doc.request.user.date_joined.year) , doc.request.user.pk) # also the user ID
    docID = '%s%s' %(now.year , doc.contract.pk)

    qrw = QrCodeWidget('http://cioc.co.in/documents?id=%s&passkey=%s&app=crmInvoice' %(docID , passKey))
    b = qrw.getBounds()

    w=b[2]-b[0]
    h=b[3]-b[1]

    d = Drawing(60,60,transform=[60./w,0,0,60./h,0,0])
    d.add(qrw)
    renderPDF.draw(d, canvas ,180*mm,270*mm)

    pass

    # page_num = canvas.getPageNumber()
    # text = "<font size='8'>Page #%s</font>" % page_num
    # p = Paragraph(text , styleN)
    # p.wrapOn(canvas , 50*mm , 10*mm)
    # p.drawOn(canvas , 100*mm , 10*mm)



class PageNumCanvas(canvas.Canvas):

    #----------------------------------------------------------------------
    def __init__(self, *args, **kwargs):
        """Constructor"""
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.pages = []

    #----------------------------------------------------------------------
    def showPage(self):
        """
        On a page break, add information to the list
        """
        self.pages.append(dict(self.__dict__))
        self._startPage()

    #----------------------------------------------------------------------
    def save(self):
        """
        Add the page number to each page (page x of y)
        """
        page_count = len(self.pages)

        for page in self.pages:
            self.__dict__.update(page)
            # self.draw_page_number(page_count)
            self.drawLetterHeadFooter()
            canvas.Canvas.showPage(self)

        canvas.Canvas.save(self)


    #----------------------------------------------------------------------
    def draw_page_number(self, page_count):
        """
        Add the page number
        """

        text = "<font size='8'>Page #%s of %s</font>" % (self._pageNumber , page_count)
        p = Paragraph(text , styleN)
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 100*mm , 10*mm)

    def drawLetterHeadFooter(self):
        self.setStrokeColor(themeColor)
        self.setFillColor(themeColor)
        self.rect(0,0,1500,70, fill=True)
        # print dir(self)
        compNameStyle = styleN.clone('footerCompanyName')
        compNameStyle.textColor = colors.white;

        p = Paragraph(settingsFields.get(name = 'companyName').value , compNameStyle)
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 85*mm  , 18*mm)

        p1 = Paragraph(settingsFields.get(name = 'companyAddress').value , compNameStyle)
        p1.wrapOn(self , 150*mm , 10*mm)
        p1.drawOn(self , 55*mm  , 10*mm)


        p2 = Paragraph( settingsFields.get(name = 'contactDetails').value, compNameStyle)
        p2.wrapOn(self , 200*mm , 10*mm)
        p2.drawOn(self , 40*mm  , 4*mm)

        from svglib.svglib import svg2rlg
        drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'cioc_icon.svg'))
        sx=sy=0.5
        drawing.width,drawing.height = drawing.minWidth()*sx, drawing.height*sy
        drawing.scale(sx,sy)
        #if you want to see the box around the image
        # drawing._showBoundary = True
        renderPDF.draw(drawing, self,10*mm  , self._pagesize[1]-20*mm)

        #width = self._pagesize[0]
        # page = "Page %s of %s" % (, page_count)
        # self.setFont("Helvetica", 9)
        # self.drawRightString(195*mm, 272*mm, page)

def genInvoice(response, contract, request):
    MARGIN_SIZE = 8 * mm
    PAGE_SIZE = A4

    # c = canvas.Canvas("hello.pdf")
    # c.drawString(9*cm, 19*cm, "Hello World!")

    pdf_doc = SimpleDocTemplate(response, pagesize=PAGE_SIZE,
                                leftMargin=MARGIN_SIZE, rightMargin=MARGIN_SIZE,
                                topMargin=4 * MARGIN_SIZE, bottomMargin=3 * MARGIN_SIZE)

    # data = [['', '', '', 'Grand Total', '' , pFooterGrandTotal]]
    pdf_doc.contract = contract
    pdf_doc.request = request


    tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
    tableHeaderStyle.textColor = colors.white
    tableHeaderStyle.fontSize = 7

    pHeadProd = Paragraph(
        '<strong>Product</strong>', tableHeaderStyle)
    pHeadPrice = Paragraph('<strong>Price</strong>', tableHeaderStyle)
    pHeadQuantity = Paragraph('<strong>Quantity</strong>', tableHeaderStyle)
    pHeadTPrice = Paragraph('<strong>Total Price</strong>', tableHeaderStyle)
    #
    # # bookingTotal , bookingHrs = getBookingAmount(o)
    #
    # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
    # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
    # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
    # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)
    #
    data = [[pHeadProd, pHeadPrice, pHeadQuantity, pHeadTPrice]]
    #
    # totalQuant = 0
    # totalTax = 0
    totaldiscount = 0
    total = 0
    totalprice = 0
    promoAmount = 0
    discount = 0
    tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    tableBodyStyle.fontSize = 7
    promoObj = Promocode.objects.all()
    for p in promoObj:
        if str(p.name)==str(contract.promoCode):
            promoAmount = p.discount
    for i in contract.orderQtyMap.all():
        print i
        if str(i.status)!='cancelled':
            print i.product.product.name, i.product.product.discount, i.product.product.price
            price = i.product.product.price - (i.product.product.discount * i.product.product.price)/100
            price=round(price, 2)
            totalprice = i.qty*price
            totalprice=round(totalprice, 2)
            total+=totalprice
            total=round(total, 2)
            pBodyProd = Paragraph(str(i.product.product.name), tableBodyStyle)
            pBodyPrice = Paragraph(str(price), tableBodyStyle)
            pBodyQty = Paragraph(str(i.qty), tableBodyStyle)
            pBodyTPrice = Paragraph(str(totalprice), tableBodyStyle)
            data.append([pBodyProd, pBodyPrice, pBodyQty, pBodyTPrice])

    # contract.grandTotal = grandTotal
    # contract.save()
    grandTotal=total-(promoAmount * total)/100
    grandTotal=round(grandTotal, 2)
    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10
    #
    data += [['',   Paragraph('Total (INR)', tableHeaderStyle), '', Paragraph(str(total), tableGrandStyle)],['',   Paragraph('Discount Coupon (%)', tableHeaderStyle), '', Paragraph(str(promoAmount), tableGrandStyle)],['',   Paragraph('Grand Total (INR)', tableHeaderStyle), '', Paragraph(str(grandTotal), tableGrandStyle)]]
    t = Table(data)
    ts = TableStyle([('ALIGN', (1, 1), (-3, -3), 'RIGHT'),
                     ('VALIGN', (0, 1), (-1, -3), 'TOP'),
                     ('VALIGN', (0, -2), (-1, -2), 'TOP'),
                     ('VALIGN', (0, -1), (-1, -1), 'TOP'),
                     ('SPAN', (-3, -1), (-2, -1)),
                     ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                     ('BACKGROUND', (0, 0), (-1, 0), themeColor),
                     ('LINEABOVE', (0, 0), (-1, 0), 0.25, themeColor),
                     ('LINEABOVE', (0, 1), (-1, 1), 0.25, themeColor),
                     ('BACKGROUND', (-3, -3), (-1, -2), themeColor),
                     ('BACKGROUND', (-3, -2), (-1, -2), themeColor),
                     ('BACKGROUND', (-3, -1), (-1, -1), themeColor),
                     # ('LINEABOVE', (-2, -2), (-1, -2), 0.25, colors.gray),
                     ('LINEABOVE', (0, -1), (-1, -1), 0.25, colors.gray),
                     # ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
                     ])
    t.setStyle(ts)
    t._argW[0] = 6 * cm
    t._argW[1] = 3 * cm
    t._argW[2] = 3 * cm
    t._argW[3] = 3 * cm
    # t._argW[4] = 2 * cm
    # t._argW[5] = 2 * cm
    # t._argW[6] = 1.6 * cm
    # t._argW[7] = 2 * cm

    # add some flowables

    story = []

    expHead = expanseReportHead(request, contract)
    story.append(Spacer(2.5, 2 * cm))
    story.append(expHead)
    story.append(Spacer(2.5, 0.75 * cm))

    #
    # adrs = contract.deal.company.address
    #
    # if contract.deal.company.tin is None:
    #     tin = 'NA'
    # else:
    #     tin = contract.deal.company.tin
    #


    summryParaSrc = """
    <font size='8'><strong>Customer details:</strong></font> <br/><br/>
    <font size='6'><strong>Your Billing Address:</strong></font> <br/>
    <font size='6'>
    %s %s<br/>
    %s <br/>
    %s <br/>
    %s %s - %s<br/>
    India<br/>
    %s<br/><br/>
    </font>
    <font size='6'><strong>Your Shipping Address:</strong></font> <br/>
    <font size='6'>
    %s %s<br/>
    %s <br/>
    %s <br/>
    %s %s - %s<br/>
    India<br/>
    %s<br/>
    </font>
    """ %(contract.user.first_name , contract.user.last_name , contract.landMark , contract.street , contract.city , contract.state , contract.pincode, contract.mobileNo,contract.user.first_name , contract.user.last_name , contract.landMark , contract.street , contract.city , contract.state , contract.pincode, contract.mobileNo)
    story.append(Paragraph(summryParaSrc , styleN))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))

    summryParaSrc = """
    <font size='4'><strong>Computer generated bill, no signature required</strong></font> <br/>
    """
    story.append(Paragraph(summryParaSrc , styleN))

    #     summryParaSrc = settingsFields.get(name = 'bankDetails').value
    #     story.append(Paragraph(summryParaSrc , styleN))
    #
    #     tncPara = settingsFields.get(name = 'tncInvoice').value
    #
    # else:
    #     tncPara = settingsFields.get(name = 'tncQuotation').value

    # story.append(Paragraph(tncPara , styleN))

    # scans = ['scan.jpg' , 'scan2.jpg', 'scan3.jpg']
    # for s in scans:
    #     story.append(PageBreak())
    #     story.append(FullPageImage(s))


    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)



class DownloadInvoiceAPI(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self, request, format=None):
        print request.GET['value'],'aaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbb'
        response = HttpResponse(content_type='application/pdf')
        o = Order.objects.get(pk=request.GET['value'])
        print o
        response['Content-Disposition'] = 'attachment; filename="Call_letter%s_%s.pdf"' % (
             datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, o.pk)
        genInvoice(response, o, request)
        f = open(os.path.join(globalSettings.BASE_DIR, 'media_root/Call_letter%s_%s.pdf' %
                              ( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, o.pk)), 'wb')
        f.write(response.content)
        f.close()
        # return Response(status=status.HTTP_200_OK)
        return response
