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
from email.mime.image import MIMEImage

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from StringIO import StringIO
import math
import requests
# related to the invoice generator
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib import colors, utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode, renderPDF
# from reportlab.graphics.shapes import *
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.pagesizes import letter, A5, A4, A3
from reportlab.lib.colors import *
from reportlab.lib.units import inch, cm ,mm
from reportlab.lib.enums import TA_JUSTIFY,TA_LEFT, TA_CENTER
from reportlab.graphics.barcode import code39
from reportlab.platypus.doctemplate import Indenter
from PIL import Image
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
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors, utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from reportlab.platypus.flowables import HRFlowable
from PIL import Image
from dateutil.relativedelta import relativedelta
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode, renderPDF
from reportlab.graphics.shapes import *
import calendar as pythonCal
from POS.models import *
from ERP.models import service, appSettingsField
# Create your views here.

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN})

class SearchProductAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny , )
    def get(self , request , format = None):
        print 'aaaaaaaaaaaaaaaaa'
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
            return Response({'paymentMode':orderObj.paymentMode,'dt':orderObj.created,'odnumber':orderObj.pk}, status = status.HTTP_200_OK)


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
    permission_classes = (permissions.AllowAny , )
    serializer_class = listingSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parentType']

    def get_queryset(self):

        data = self.request.GET
        if 'recursive' in data:
            if data['recursive'] == '1':
                print data['parent'] , type(data['parent'])
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
                # print toReturn
                # for i in toReturn:
                #     print i.product
                #
                #     product  = Product.objects.filter(pk__in=i.product)
                #     print product ,'aaaaaaaaaaaaaa'
                #     prductSku =  ProductVerient.objects.all()
                #     for i in product:
                #         print i,'jjjjj'
                #         for j in prductSku:
                #             print j.parent,'bbbbbbbbbbbbbbbb'
                #             if i == j.parent:
                #                 print 'kkkkkkkkkkkkkkkkkk'
                return toReturn
        else:
            return listing.objects.all()

class listingLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, )
    serializer_class = listingLiteSerializer
    # queryset = listing.objects.all()
    def get_queryset(self):
        print "fffffffffffffffffffff",self.request.user.is_authenticated
        if self.request.user.is_authenticated:
            u = self.request.user
            has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
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
    permission_classes = (permissions.AllowAny , )
    serializer_class = CartSerializer
    queryset = Cart.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','typ']

class ActivitiesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
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
    permission_classes = (permissions.AllowAny , )
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','pincode']

class TrackingLogViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = TrackingLog.objects.all()
    serializer_class = TrackingLogSerializer

class OrderQtyMapViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = OrderQtyMap.objects.all()
    serializer_class = OrderQtyMapSerializer

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    # queryset = Order.objects.all()
    serializer_class = OrderSerializer
    def get_queryset(self):
        # return Order.objects.filter( ~Q(status = 'failed')).order_by('-created')
        return Order.objects.all().order_by('-created')

class PromocodeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = Promocode.objects.all()
    serializer_class = PromocodeSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class FrequentlyQuestionsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = FrequentlyQuestions.objects.all()
    serializer_class = FrequentlyQuestionsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['ques']



def manifest(response,item):
    print '999999999999999999999999999999999999999'
    settingsFields = application.objects.get(name = 'app.public.ecommerce').settings.all()
    print settingsFields.get(name = 'address').value
    order = item.order.get()
    now = datetime.datetime.now()
    print item.pk , order.pk
    print now.year,now.month,now.day

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=1*cm,leftMargin=0.2*cm,rightMargin=0.2*cm)
    elements = []

    elements.append(HRFlowable(width="100%", thickness=1, color=black,spaceAfter=10))
    if order.paymentMode == 'card':
        txt1 = '<para size=13 leftIndent=150 rightIndent=150><b>PREPAID - DO NOT COLLECT CASH</b></para>'
    else:
        txt1 = '<para size=13 leftIndent=150 rightIndent=150><b>CASH ON DELIVERY &nbsp; {0} INR</b></para>'.format(item.totalAmount-item.discountAmount)
    elements.append(Paragraph(txt1, styles['Normal']))
    elements.append(Spacer(1, 8))
    txt2 = '<para size=10 leftIndent=150 rightIndent=150><b>DELIVERY ADDRESS :</b> {0},<br/>{1},<br/>{2} - {3},<br/>{4} , {5}.</para>'.format(order.landMark,order.street,order.city,order.pincode,order.state,order.country)
    elements.append(Paragraph(txt2, styles['Normal']))
    # elements.append(Indenter(left=150))
    # elements.append(HRFlowable(hAlign='LEFT',thickness=1, color=black,spaceBefore=30,spaceAfter=5))
    # elements.append(Indenter(left=-150))

    elements.append(Spacer(1, 30))

    txt3 = '<para size=10 leftIndent=150 rightIndent=150><b>COURIER NAME : </b>{0}<br/><b>COURIER AWB No. : </b>{1}</para>'.format(item.courierName,item.courierAWBNo)
    elements.append(Paragraph(txt3, styles['Normal']))
    # elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=5,spaceAfter=5))
    elements.append(Spacer(1, 10))

    txt4 = '<para size=10 leftIndent=150 rightIndent=150><b>SOLD BY : </b>{0}</para>'.format(settingsFields.get(name = 'address').value)
    elements.append(Paragraph(txt4, styles['Normal']))
    elements.append(Spacer(1, 3))
    txt5 = '<para size=10 leftIndent=150 rightIndent=150><b>VAT/TIN No. : </b>{0} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>CST No. : </b>{1}</para>'.format(settingsFields.get(name = 'vat/tinNo').value,settingsFields.get(name = 'cstNo').value)
    elements.append(Paragraph(txt5, styles['Normal']))
    elements.append(Spacer(1, 10))
    invNo = str(now.year)+str(now.month)+str(now.day)+str(order.pk)
    txt6 = '<para size=10 leftIndent=150 rightIndent=150><b>Invoice No. : </b>{0} </para>'.format(invNo)
    elements.append(Paragraph(txt6, styles['Normal']))
    # elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=30,spaceAfter=10))
    elements.append(Spacer(1, 30))

    pd= Paragraph("<para fontSize=10><b>{0}</b></para>".format(item.product.product.name),styles['Normal'])
    tableData=[['Product','Price','Qty','Discount','Final Price'],[pd,item.totalAmount,item.qty,item.discountAmount,item.totalAmount-item.discountAmount],['TOTAL','','','',item.totalAmount-item.discountAmount]]

    t1=Table(tableData,colWidths=[1.7*inch , 0.5*inch , 0.5*inch, 0.7*inch , 0.7*inch])
    t1.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('INNERGRID', (0,0), (-1,-1), 0.25, colors.black),('BOX', (0,0), (-1,-1), 0.25, colors.black),('VALIGN',(0,0),(-1,-1),'TOP'), ]))
    # elements.append(Indenter(left=10))
    elements.append(t1)
    # elements.append(Indenter(left=-10))
    elements.append(Spacer(1, 10))
    if order.paymentMode != 'card':
        txt7 = '<para size=15 leftIndent=150 rightIndent=150><b>CASH TO BE COLLECT &nbsp; {0} INR</b></para>'.format(item.totalAmount-item.discountAmount)
        elements.append(Paragraph(txt7, styles['Normal']))
    # elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=20,spaceAfter=5))
    elements.append(Spacer(1, 20))

    txt8 = '<para size=10 leftIndent=150 rightIndent=150><b>Tracking ID. : </b>{0} </para>'.format(item.courierAWBNo)
    elements.append(Paragraph(txt8, styles['Normal']))
    elements.append(Spacer(1, 10))
    barVal = str(item.courierAWBNo)
    barcode=code39.Extended39(barVal,barWidth=0.4*mm,barHeight=10*mm)
    elements.append(Indenter(left=140))
    elements.append(barcode)
    elements.append(Indenter(left=-140))
    elements.append(Spacer(1, 10))
    # orderNo = str(now.year)+str(now.month)+str(now.day)+str(item.pk)
    txt9 = '<para size=10 leftIndent=150 rightIndent=150><b>Order ID. : </b>{0} </para>'.format(invNo)
    elements.append(Paragraph(txt9, styles['Normal']))
    # elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=5,spaceAfter=5))
    elements.append(Spacer(1, 5))


    doc.build(elements)

class DownloadManifestAPI(APIView):
    renderer_classes = (JSONRenderer,)
    # permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        print self.request.GET
        item = OrderQtyMap.objects.get(pk = request.GET['qPk'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="manifest.pdf"'
        manifest(response,item)
        return response

class SendStatusAPI(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        emailAddr=[]
        print request.data['value'],'aaaaaaaaaaaaaa'
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
            msgBody = "Your order status with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been changed from shipped to In Transit"
        elif productStatus == 'reachedNearestHub':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been Reached to the nearest Hub"
        elif productStatus == 'outForDelivery':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" is Out for delivery"
        elif productStatus == 'cancelled':
            msgBody = "Your order with  product name: " + str(productName) + ", Quantity of: " +str(qty)+" has been cancelled"
        elif productStatus == 'returnToOrigin':
            msgBody = "Product has been returned to origin"
        elif productStatus == 'returned':
            msgBody ="Product has been returned"
        msg = EmailMessage(email_subject, msgBody,  to= emailAddr )
        msg.send()
        return Response({}, status = status.HTTP_200_OK)

class SendDeliveredStatus(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        emailAddr=[]
        oq = []
        o = []
        m=[]
        promoAmount=0
        # oq = list(OrderQtyMap.objects.filter(pk = request.data['value']).values().annotate(pname=F('product__product__name'),pPrice=F('product__product__price'),pDiscount=F('product__product__discount'),dp=F('product__files__attachment')))
        # productId = oq[0]['id']
        # o = list(Order.objects.filter(orderQtyMap = productId).values().annotate(userEmail=F('user__email'),fname=F('user__first_name'),lname=F('user__last_name')))
        # emailAddr.append(str( o[0]['userEmail']))
        oq=OrderQtyMap.objects.get(pk = request.data['value'])
        print oq.pk
        price = oq.product.product.price - (oq.product.product.discount * oq.product.product.price)/100
        total = oq.qty * price
        o=Order.objects.get(orderQtyMap = oq.pk)
        emailAddr.append(o.user.email)
        promoObj = Promocode.objects.all()
        for p in promoObj:
            if str(p.name)==str(o.promoCode):
                promoAmount = p.discount
        print promoAmount
        grandTotal=total-(promoAmount * total)/100
        grandTotal=round(grandTotal, 2)
        attachment =  oq.product.files.values_list('attachment', flat=True)
        # media=oq.product.files
        # for m in media:
        #     print m.pk,'aaaaaaaaa'
        # m=Media.objects.get(pk=o.product.files)
        print '**************************'
        ctx = {
            'heading' : "Invoice Details",
            # 'recieverName' : name,
            'linkUrl': 'cioc.co.in',
            'sendersAddress' : 'CIOC',
            # 'sendersPhone' : '122004',
            # 'grandTotal':grandTotal,
            'promoAmount':promoAmount,
            'attachment':"https://media/"+attachment[0],
            'grandTotal':grandTotal,
            'total':total,
            'order': o,
            'price':price,
            'orderQTY':oq,
            'linkedinUrl' : 'https://www.linkedin.com/',
            'fbUrl' : 'https://facebook.com',
            'twitterUrl' : 'https://twitter.com',
        }
        print ctx
        email_body = get_template('app.ecommerce.deliveryDetailEmail.html').render(ctx)
        # email_subject = "Order Details:"
        # msgBody = " Your Order has been placed and details are been attached"
        # contactData.append(str(orderObj.user.email))
        print 'aaaaaaaaaaaaaaa'
        msg = EmailMessage("Order Details" , email_body, to= emailAddr  )
        msg.content_subtype = 'html'
        # msg = EmailMessage(email_subject, msgBody,  to= emailAddr )
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
        <font size=10>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
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


    # totalQuant = 0
    # totalTax = 0
    totaldiscount = 0
    total = 0
    totalprice = 0
    promoAmount = 0
    discount = 0
    tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    tableBodyStyle.fontSize = 7
    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10
    promoObj = Promocode.objects.all()
    if contract.promoCode:
        for p in promoObj:
            if str(p.name)==str(contract.promoCode):
                promoAmount = p.discount
                promoCode = p.name
    else:
        promoCode="None"
    tableData=[['Product','Quantity','Price','Total Price']]
    for i in contract.orderQtyMap.all():
        if str(i.status)!='cancelled':
            print i.product.product.name, i.product.product.discount, i.product.product.price
            price = i.product.product.price - (i.product.product.discount * i.product.product.price)/100
            price=round(price, 2)
            totalprice = i.qty*price
            totalprice=round(totalprice, 2)
            total+=totalprice
            total=round(total, 2)
            tableData.append([i.product.product.name,i.qty,price,totalprice])
    grandTotal=total-(promoAmount * total)/100
    grandTotal=round(grandTotal, 2)
    tableData.append(['','','TOTAL (INR)',total])
    tableData.append(['','COUPON APPLIED(%)',promoCode,promoAmount])
    tableData.append(['','','GRAND TOTAL (INR)',grandTotal])
    t1=Table(tableData,colWidths=[3*inch , 1.5*inch , 1.5*inch, 1.5*inch , 1.5*inch])
    t1.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('INNERGRID', (0,0), (-1,-1), 0.25,  colors.HexColor('#bdd3f4')),('INNERGRID', (0,-1), (-1,-1), 0.25, colors.white),('INNERGRID', (0,-2), (-1,-1), 0.25, colors.white),('INNERGRID', (0,-1), (-1,-1), 0.25, colors.white),('LINEABOVE', (0,-1), (-1,-1), 0.25, colors.black),('INNERGRID', (0,-3), (-1,-1), 0.25, colors.white),('LINEABOVE', (0,-2), (-1,-1), 0.25, colors.HexColor('#bdd3f4')),('BOX', (0,0), (-1,-1), 0.25,  colors.HexColor('#bdd3f4')),('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND', (0, 0), (-1, 0),colors.HexColor('#bdd3f4')) ]))



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
    summryParaSrc3 = """
    <font size='8'><strong>Customer details:</strong></font> <br/>
    """
    story.append(Paragraph(summryParaSrc3 , styleN))

    summryParaSrc = Paragraph("""
    <para backColor = '#bdd3f4' leftIndent = 10>
    <font size='6'><strong>Your Billing Address:</strong></font> <br/>
    <font size='6'>
    %s %s<br/>
    %s <br/>
    %s <br/>
    %s %s - %s<br/>
    India<br/>
    %s<br/>
    </font>
    </para>
    """ %(contract.user.first_name , contract.user.last_name , contract.landMark , contract.street , contract.city , contract.state , contract.pincode, contract.mobileNo),styles['Normal'])


    summryParaSrc1 = Paragraph("""
    <para backColor = #bdd3f4 leftIndent = 10>
    <font size='6'><strong>Your Shipping Address:</strong></font> <br/>
    <font size='6'>
    %s %s<br/>
    %s <br/>
    %s <br/>
    %s %s - %s<br/>
    India<br/>
    %s<br/>
    </font></para>
    """ %(contract.user.first_name , contract.user.last_name , contract.landMark , contract.street , contract.city , contract.state , contract.pincode, contract.mobileNo),styles['Normal'])


    td=[[summryParaSrc,' ',summryParaSrc1]]
    # story.append(Paragraph(summryParaSrc , styleN))
    t=Table(td,colWidths=[3*inch , 1*inch , 3*inch])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (0, 0),colors.HexColor('#bdd3f4')),('BACKGROUND', (-1, -1), (-1,-1 ),colors.HexColor('#bdd3f4')) ]))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))
    summryParaSrc4 = """
    <font size='8'><strong>Order details:</strong></font> <br/>
    """
    story.append(Paragraph(summryParaSrc4 , styleN))
    story.append(t1)
    story.append(Spacer(2.5,0.5*cm))

    summryParaSrc2 = """
    <font size='4'><strong>Computer generated bill, no signature required</strong></font> <br/>
    """
    story.append(Paragraph(summryParaSrc2 , styleN))


    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)



class DownloadInvoiceAPI(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self, request, format=None):
        print request.GET['value'],'aaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbb'
        response = HttpResponse(content_type='application/pdf')
        o = Order.objects.get(pk=request.GET['value'])
        print o
        response['Content-Disposition'] = 'attachment; filename="invoice%s_%s.pdf"' % (
             datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, o.pk)
        genInvoice(response, o, request)
        f = open(os.path.join(globalSettings.BASE_DIR, 'media_root/invoice%s_%s.pdf' %
                              ( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, o.pk)), 'wb')
        f.write(response.content)
        f.close()
        # return Response(status=status.HTTP_200_OK)
        return response

class RatingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['productDetail',]

from datetime import timedelta
from django.db.models import Sum
class OnlineSalesGraphAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.IsAuthenticated ,)
    def post(self , request , format = None):
        totalCollections=0
        if "date" in request.data:
            # one day sale
            d = datetime.datetime.strptime(request.data["date"], '%Y-%m-%dT%H:%M:%S.%fZ')
            order = Order.objects.filter(created__range = (datetime.datetime.combine(d, datetime.time.min), datetime.datetime.combine(d, datetime.time.max)))
            custs = User.objects.filter(date_joined__range= (datetime.datetime.combine(d, datetime.time.min), datetime.datetime.combine(d, datetime.time.max)))
            orderQty = OrderQtyMap.objects.filter(updated__range = (datetime.datetime.combine(d, datetime.time.min), datetime.datetime.combine(d, datetime.time.max)))
        else:
            frm = datetime.datetime.strptime(request.data["from"], '%Y-%m-%dT%H:%M:%S.%fZ')
            to = datetime.datetime.strptime(request.data["to"], '%Y-%m-%dT%H:%M:%S.%fZ')
            order = Order.objects.filter(created__range=(datetime.datetime.combine(frm, datetime.time.min), datetime.datetime.combine(to, datetime.time.max)))
            orderQty = OrderQtyMap.objects.filter(updated__range = (datetime.datetime.combine(frm, datetime.time.min), datetime.datetime.combine(to, datetime.time.max)))
            custs = User.objects.filter(date_joined__range = (datetime.datetime.combine(frm, datetime.time.min), datetime.datetime.combine(to, datetime.time.max)))

        totalSales = order.aggregate(Sum('totalAmount'))
        for i in orderQty:
            if str(i.status) == 'delivered':
                price = i.product.product.price - (i.product.product.discount * i.product.product.price)/100
                orderD = Order.objects.filter(orderQtyMap=i.pk)
                for j in orderD:
                    if str(j.paymentMode) == 'COD':
                            if j.promoCode!=None:
                                promo = Promocode.objects.filter(name__iexact=j.promoCode)
                                for p in promo:
                                    promocode = p.discount
                                    priceVal = price-(promocode * price)/100
                                    totalCollections += priceVal
                            else:
                                totalCollections += price
            elif str(i.status) != 'delivered':
                print 'aaaaaaaaaaaaaa'
                orderD = Order.objects.filter(orderQtyMap=i.pk)
                for j in orderD:
                    if str(j.paymentMode) == 'card':
                        print 'aaaaaaaaaaaaaavvvvvvvvvv'
                        price = i.product.product.price - (i.product.product.discount * i.product.product.price)/100
                        if j.promoCode!=None:
                            promo = Promocode.objects.filter(name__iexact=j.promoCode)
                            for p in promo:
                                promocode = p.discount
                                priceVal = price-(promocode * price)/100
                                totalCollections += priceVal
                        else:
                            totalCollections += price
        totalCollections = round(totalCollections, 2)
        sales =  order.count()
        custCount = custs.count()


        last_month = datetime.datetime.now() - timedelta(days=30)

        data = (Order.objects.all()
            .extra(select={'created': 'date(created)'})
            .values('created')
            .annotate(sum=Sum('totalAmount')))


        # return Response({"totalSales" : totalSales , "totalCollections" : totalCollections ,  "sales" : sales , "custCount" : custCount , "trend" : data},status=status.HTTP_200_OK)
        return Response({"totalSales" : totalSales , "totalCollections" : totalCollections ,  "sales" : sales , "custCount" : custCount , "trend" : data},status=status.HTTP_200_OK)
