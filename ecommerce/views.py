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
from django.db.models import F ,Value,CharField,Prefetch
import ast
from django.utils import timezone

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
        userCart = Cart.objects.filter(user=request.user,typ='cart')
        print userCart.count(),userCart
        for i in request.data['products']:
            pObj = listing.objects.get(pk = i['pk'])
            pp = int(round(pObj.product.price)) * i['qty']
            if pp > 0:
                a = pp - (pObj.product.discount*pp)/100
                b = a - (request.data['promoCodeDiscount']*a)/100
            else:
                b=0
            totalAmount += int(round(b))
            print {'product':pObj,'qty':i['qty'],'totalAmount':pp,'discountAmount':pp-int(round(b))}
            oQMObj = OrderQtyMap.objects.create(**{'product':pObj,'qty':i['qty'],'totalAmount':pp,'discountAmount':pp-int(round(b))})
            oQMp.append(oQMObj)
        else:
            data = {
            'user':User.objects.get(pk=request.user.pk),
            'totalAmount' : int(round(totalAmount)),
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


        return Response({'msg':msg}, status = status.HTTP_200_OK)


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
        # return Order.objects.filter( ~Q(status = 'failed')).order_by('-created')
        return Order.objects.all().order_by('-created')

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


settingsFields = application.objects.get(name = 'app.public.ecommerce').settings.all()

def manifest(response,item):
    print '999999999999999999999999999999999999999'
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
    elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=30,spaceAfter=5))
    txt3 = '<para size=10 leftIndent=150 rightIndent=150><b>COURIER NAME : </b>{0}<br/><b>COURIER AWB No. : </b>{1}</para>'.format(item.courierName,item.courierAWBNo)
    elements.append(Paragraph(txt3, styles['Normal']))
    elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=5,spaceAfter=5))
    txt4 = '<para size=10 leftIndent=150 rightIndent=150><b>SOLD BY : </b>{0}</para>'.format(settingsFields.get(name = 'address').value)
    elements.append(Paragraph(txt4, styles['Normal']))
    elements.append(Spacer(1, 10))
    txt5 = '<para size=10 leftIndent=150 rightIndent=150><b>VAT/TIN No. : </b>{0} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>CST No. : </b>{1}</para>'.format(settingsFields.get(name = 'vat/tinNo').value,settingsFields.get(name = 'cstNo').value)
    elements.append(Paragraph(txt5, styles['Normal']))
    elements.append(Spacer(1, 10))
    invNo = str(now.year)+str(now.month)+str(now.day)+str(order.pk)
    txt6 = '<para size=10 leftIndent=150 rightIndent=150><b>Invoice No. : </b>{0} </para>'.format(invNo)
    elements.append(Paragraph(txt6, styles['Normal']))
    elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=30,spaceAfter=10))
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
    elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=20,spaceAfter=5))
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
    elements.append(HRFlowable(width="50%", thickness=1, color=black,spaceBefore=5,spaceAfter=5))

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
