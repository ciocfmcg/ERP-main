
from __future__ import unicode_literals
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from rest_framework import viewsets , permissions , serializers
from API.permissions import *
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
from clientRelationships.views import expanseReportHead,addPageNumber,PageNumCanvas,FullPageImage
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors , utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode , renderPDF
from reportlab.graphics.shapes import *
from reportlab.graphics.barcode.qr import QrCodeWidget
import datetime
import json
import pytz
import requests
from .models import *
from .serializers import *


class ServiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ServiceSerializer
    queryset = Service.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name',]

class ContractViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ContractSerializer
    queryset = Contract.objects.all()

class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contract']

def genInvoice(response , contract, request):

    themeColor = colors.HexColor('#227daa')

    styles=getSampleStyleSheet()
    styleN = styles['Normal']
    styleH = styles['Heading1']


    settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()

    MARGIN_SIZE = 8 * mm
    PAGE_SIZE = A4

    # c = canvas.Canvas("hello.pdf")
    # c.drawString(9*cm, 19*cm, "Hello World!")

    pdf_doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
        leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
        topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)

    # data = [['', '', '', 'Grand Total', '' , pFooterGrandTotal]]

    pdf_doc.contract = contract
    pdf_doc.request = request

    tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
    tableHeaderStyle.textColor = colors.white;
    tableHeaderStyle.fontSize = 7

    pHeadProd = Paragraph('<strong>Product/<br/>Service</strong>' , tableHeaderStyle)
    pHeadDetails = Paragraph('<strong>Details</strong>' , tableHeaderStyle)
    pHeadTaxCode = Paragraph('<strong>HSN/<br/>SAC</strong>' , tableHeaderStyle)
    pHeadQty = Paragraph('<strong>Qty</strong>' , tableHeaderStyle)
    pHeadPrice = Paragraph('<strong>Rate</strong>' , tableHeaderStyle)
    pHeadTotal = Paragraph('<strong>Total</strong>' , tableHeaderStyle)
    pHeadTax = Paragraph('<strong>IGST <br/> Tax</strong>' , tableHeaderStyle)
    pHeadSubTotal = Paragraph('<strong>Sub Total</strong>' , tableHeaderStyle)

    # # bookingTotal , bookingHrs = getBookingAmount(o)
    #
    # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
    # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
    # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
    # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)

    data = [[ pHeadProd, pHeadDetails, pHeadTaxCode, pHeadPrice , pHeadQty, pHeadTotal, pHeadTax ,pHeadSubTotal ]]

    totalQuant = 0
    totalTax = 0
    grandTotal = 0
    tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    tableBodyStyle.fontSize = 7

    for i in json.loads(contract.data):
        print i
        pDescSrc = i['desc']

        totalQuant += i['quantity']
        totalTax += i['totalTax']
        grandTotal += i['subtotal']

        pBodyProd = Paragraph('Service' , tableBodyStyle)
        pBodyTitle = Paragraph( pDescSrc , tableBodyStyle)
        pBodyQty = Paragraph(str(i['quantity']) , tableBodyStyle)
        pBodyPrice = Paragraph(str(i['rate']) , tableBodyStyle)
        if 'taxCode' in i:
            taxCode = '%s(%s %%)' %(i['taxCode'] , i['tax'])
        else:
            taxCode = ''

        pBodyTaxCode = Paragraph(taxCode , tableBodyStyle)
        pBodyTax = Paragraph(str(i['totalTax']) , tableBodyStyle)
        pBodyTotal = Paragraph(str(i['quantity']*i['rate']) , tableBodyStyle)
        pBodySubTotal = Paragraph(str(i['subtotal']) , tableBodyStyle)

        data.append([pBodyProd, pBodyTitle,pBodyTaxCode, pBodyPrice, pBodyQty, pBodyTotal, pBodyTax , pBodySubTotal])

    contract.grandTotal = grandTotal
    contract.save()

    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10


    data += [['', '','','', '', '',Paragraph(str(totalTax) , tableBodyStyle)  , Paragraph(str(grandTotal) , tableBodyStyle) ],
            ['', '', '', '', '',  Paragraph('Grand Total (INR)' , tableHeaderStyle), '' , Paragraph(str(grandTotal) , tableGrandStyle)]]
    t=Table(data)
    ts = TableStyle([('ALIGN',(1,1),(-3,-3),'RIGHT'),
                ('VALIGN',(0,1),(-1,-3),'TOP'),
                ('VALIGN',(0,-2),(-1,-2),'TOP'),
                ('VALIGN',(0,-1),(-1,-1),'TOP'),
                ('SPAN',(-3,-1),(-2,-1)),
                ('TEXTCOLOR',(0,0),(-1,0) , colors.white),
                ('BACKGROUND',(0,0),(-1,0) , themeColor),
                ('LINEABOVE',(0,0),(-1,0),0.25,themeColor),
                ('LINEABOVE',(0,1),(-1,1),0.25,themeColor),
                ('BACKGROUND',(-2,-2),(-1,-2) , colors.HexColor('#eeeeee')),
                ('BACKGROUND',(-3,-1),(-1,-1) , themeColor),
                ('LINEABOVE',(-2,-2),(-1,-2),0.25,colors.gray),
                ('LINEABOVE',(0,-1),(-1,-1),0.25,colors.gray),
                # ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
            ])
    t.setStyle(ts)
    t._argW[0] = 1.5*cm
    t._argW[1] = 6*cm
    t._argW[2] = 2.4*cm
    t._argW[3] = 2*cm
    t._argW[4] = 2*cm
    t._argW[5] = 2*cm
    t._argW[6] = 1.6*cm
    t._argW[7] = 2*cm

    #add some flowables



    story = []

    expHead = expanseReportHead(request , contract)
    story.append(Spacer(2.5,2*cm))
    story.append(expHead)
    story.append(Spacer(2.5,0.75*cm))

    # adrs = contract.deal.company.address
    #
    # if contract.deal.company.tin is None:
    #     tin = 'NA'
    # else:
    #     tin = contract.deal.company.tin

    # summryParaSrc = """
    # <font size='11'><strong>Customer details:</strong></font> <br/><br/>
    # <font size='9'>
    # %s<br/>
    # %s<br/>
    # %s<br/>
    # %s<br/>
    # %s , %s<br/>
    # %s<br/>
    # <strong>GSTIN:</strong>%s<br/>
    # </font>
    # """ %(contract.deal.contacts.all()[0].name , contract.deal.company.name, adrs.street , adrs.city , adrs.state , adrs.pincode , adrs.country, tin)
    # story.append(Paragraph(summryParaSrc , styleN))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))

    if contract.status in ['billed' , 'approved' , 'recieved']:
        # summryParaSrc = settingsFields.get(name = 'regulatoryDetails').value
        # story.append(Paragraph(summryParaSrc , styleN))
        #
        # summryParaSrc = settingsFields.get(name = 'bankDetails').value
        # story.append(Paragraph(summryParaSrc , styleN))

        tncPara = settingsFields.get(name = 'tncInvoice').value

    else:
        tncPara = settingsFields.get(name = 'tncQuotation').value

    story.append(Paragraph(tncPara , styleN))

    # scans = ['scan.jpg' , 'scan2.jpg', 'scan3.jpg']
    # for s in scans:
    #     story.append(PageBreak())
    #     story.append(FullPageImage(s))


    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)


class DownloadInvoice(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print '******************'
        if 'contract' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type='application/pdf')
        i = Invoice.objects.get(id = request.GET['contract'])
        response['Content-Disposition'] = 'attachment; filename="warehouse_invoice%s_%s.pdf"' %(i.pk, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year )
        genInvoice(response , i , request)
        f = open('./media_root/warehouse_invoice%s%s_%s.pdf'%(i.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
        f.write(response.content)
        f.close()
        if 'saveOnly' in request.GET:
            return Response(status=status.HTTP_200_OK)
        return response


# # -*- coding: utf-8 -*-
# from __future__ import unicode_literals
#
#
# from django.shortcuts import render
#
# # Create your views here
# from django.shortcuts import render
# from url_filter.integrations.drf import DjangoFilterBackend
# from rest_framework import viewsets , permissions , serializers
# from API.permissions import *
# from .models import *
# from .serializers import *
#
#
# class ServiceViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated , )
#     serializer_class = ServiceSerializer
#     queryset = Service.objects.all()
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name']
#
# class ContactViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated , )
#     serializer_class = ContactSerializer
#     queryset = Contact.objects.all()
#
# class ContractViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated , )
#     serializer_class = ContractSerializer
#     queryset = Contract.objects.all()
#
