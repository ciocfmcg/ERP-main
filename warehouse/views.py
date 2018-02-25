
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
from django.conf import settings as globalSettings


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

class SpaceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = SpaceSerializer
    queryset = Space.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

# def genInvoice(response , contract, request):
#
#     themeColor = colors.HexColor('#227daa')
#
#     styles=getSampleStyleSheet()
#     styleN = styles['Normal']
#     styleH = styles['Heading1']
#
#
#     settingsFields = application.objects.get(name = 'app.clientRelationships').settings.all()
#
#     MARGIN_SIZE = 8 * mm
#     PAGE_SIZE = A4
#
#     # c = canvas.Canvas("hello.pdf")
#     # c.drawString(9*cm, 19*cm, "Hello World!")
#
#     pdf_doc = SimpleDocTemplate(response, pagesize = PAGE_SIZE,
#         leftMargin = MARGIN_SIZE, rightMargin = MARGIN_SIZE,
#         topMargin = 4*MARGIN_SIZE, bottomMargin = 3*MARGIN_SIZE)
#
#     # data = [['', '', '', 'Grand Total', '' , pFooterGrandTotal]]
#
#     pdf_doc.contract = contract
#     pdf_doc.request = request
#
#     tableHeaderStyle = styles['Normal'].clone('tableHeaderStyle')
#     tableHeaderStyle.textColor = colors.white;
#     tableHeaderStyle.fontSize = 7
#
#     pHeadProd = Paragraph('<strong>Product/<br/>Service</strong>' , tableHeaderStyle)
#     pHeadDetails = Paragraph('<strong>Details</strong>' , tableHeaderStyle)
#     pHeadTaxCode = Paragraph('<strong>HSN/<br/>SAC</strong>' , tableHeaderStyle)
#     pHeadQty = Paragraph('<strong>Qty</strong>' , tableHeaderStyle)
#     pHeadPrice = Paragraph('<strong>Rate</strong>' , tableHeaderStyle)
#     pHeadTotal = Paragraph('<strong>Total</strong>' , tableHeaderStyle)
#     pHeadTax = Paragraph('<strong>IGST <br/> Tax</strong>' , tableHeaderStyle)
#     pHeadSubTotal = Paragraph('<strong>Sub Total</strong>' , tableHeaderStyle)
#
#     # # bookingTotal , bookingHrs = getBookingAmount(o)
#     #
#     # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
#     # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
#     # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
#     # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)
#
#     data = [[ pHeadProd, pHeadDetails, pHeadTaxCode, pHeadPrice , pHeadQty, pHeadTotal, pHeadTax ,pHeadSubTotal ]]
#
#     totalQuant = 0
#     totalTax = 0
#     grandTotal = 0
#     tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
#     tableBodyStyle.fontSize = 7
#
#     for i in json.loads(contract.data):
#         print i
#         pDescSrc = i['desc']
#
#         totalQuant += i['quantity']
#         totalTax += i['totalTax']
#         grandTotal += i['subtotal']
#
#         pBodyProd = Paragraph('Service' , tableBodyStyle)
#         pBodyTitle = Paragraph( pDescSrc , tableBodyStyle)
#         pBodyQty = Paragraph(str(i['quantity']) , tableBodyStyle)
#         pBodyPrice = Paragraph(str(i['rate']) , tableBodyStyle)
#         if 'taxCode' in i:
#             taxCode = '%s(%s %%)' %(i['taxCode'] , i['tax'])
#         else:
#             taxCode = ''
#
#         pBodyTaxCode = Paragraph(taxCode , tableBodyStyle)
#         pBodyTax = Paragraph(str(i['totalTax']) , tableBodyStyle)
#         pBodyTotal = Paragraph(str(i['quantity']*i['rate']) , tableBodyStyle)
#         pBodySubTotal = Paragraph(str(i['subtotal']) , tableBodyStyle)
#
#         data.append([pBodyProd, pBodyTitle,pBodyTaxCode, pBodyPrice, pBodyQty, pBodyTotal, pBodyTax , pBodySubTotal])
#
#     contract.grandTotal = grandTotal
#     contract.save()
#
#     tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
#     tableGrandStyle.fontSize = 10
#
#
#     data += [['', '','','', '', '',Paragraph(str(totalTax) , tableBodyStyle)  , Paragraph(str(grandTotal) , tableBodyStyle) ],
#             ['', '', '', '', '',  Paragraph('Grand Total (INR)' , tableHeaderStyle), '' , Paragraph(str(grandTotal) , tableGrandStyle)]]
#     t=Table(data)
#     ts = TableStyle([('ALIGN',(1,1),(-3,-3),'RIGHT'),
#                 ('VALIGN',(0,1),(-1,-3),'TOP'),
#                 ('VALIGN',(0,-2),(-1,-2),'TOP'),
#                 ('VALIGN',(0,-1),(-1,-1),'TOP'),
#                 ('SPAN',(-3,-1),(-2,-1)),
#                 ('TEXTCOLOR',(0,0),(-1,0) , colors.white),
#                 ('BACKGROUND',(0,0),(-1,0) , themeColor),
#                 ('LINEABOVE',(0,0),(-1,0),0.25,themeColor),
#                 ('LINEABOVE',(0,1),(-1,1),0.25,themeColor),
#                 ('BACKGROUND',(-2,-2),(-1,-2) , colors.HexColor('#eeeeee')),
#                 ('BACKGROUND',(-3,-1),(-1,-1) , themeColor),
#                 ('LINEABOVE',(-2,-2),(-1,-2),0.25,colors.gray),
#                 ('LINEABOVE',(0,-1),(-1,-1),0.25,colors.gray),
#                 # ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
#             ])
#     t.setStyle(ts)
#     t._argW[0] = 1.5*cm
#     t._argW[1] = 6*cm
#     t._argW[2] = 2.4*cm
#     t._argW[3] = 2*cm
#     t._argW[4] = 2*cm
#     t._argW[5] = 2*cm
#     t._argW[6] = 1.6*cm
#     t._argW[7] = 2*cm
#
#     #add some flowables
#
#
#
#     story = []
#
#     expHead = expanseReportHead(request , contract)
#     story.append(Spacer(2.5,2*cm))
#     story.append(expHead)
#     story.append(Spacer(2.5,0.75*cm))
#
#     # adrs = contract.deal.company.address
#     #
#     # if contract.deal.company.tin is None:
#     #     tin = 'NA'
#     # else:
#     #     tin = contract.deal.company.tin
#
#     # summryParaSrc = """
#     # <font size='11'><strong>Customer details:</strong></font> <br/><br/>
#     # <font size='9'>
#     # %s<br/>
#     # %s<br/>
#     # %s<br/>
#     # %s<br/>
#     # %s , %s<br/>
#     # %s<br/>
#     # <strong>GSTIN:</strong>%s<br/>
#     # </font>
#     # """ %(contract.deal.contacts.all()[0].name , contract.deal.company.name, adrs.street , adrs.city , adrs.state , adrs.pincode , adrs.country, tin)
#     # story.append(Paragraph(summryParaSrc , styleN))
#     story.append(t)
#     story.append(Spacer(2.5,0.5*cm))
#
#     if contract.status in ['billed' , 'approved' , 'recieved']:
#         # summryParaSrc = settingsFields.get(name = 'regulatoryDetails').value
#         # story.append(Paragraph(summryParaSrc , styleN))
#         #
#         # summryParaSrc = settingsFields.get(name = 'bankDetails').value
#         # story.append(Paragraph(summryParaSrc , styleN))
#
#         tncPara = settingsFields.get(name = 'tncInvoice').value
#
#     else:
#         tncPara = settingsFields.get(name = 'tncQuotation').value
#
#     story.append(Paragraph(tncPara , styleN))
#
#     # scans = ['scan.jpg' , 'scan2.jpg', 'scan3.jpg']
#     # for s in scans:
#     #     story.append(PageBreak())
#     #     story.append(FullPageImage(s))
#
#
#     pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)
#
#
# class DownloadInvoice(APIView):
#     renderer_classes = (JSONRenderer,)
#     def get(self , request , format = None):
#         print '******************'
#         if 'contract' not in request.GET:
#             return Response(status=status.HTTP_400_BAD_REQUEST)
#
#         response = HttpResponse(content_type='application/pdf')
#         i = Invoice.objects.get(id = request.GET['contract'])
#         response['Content-Disposition'] = 'attachment; filename="warehouse_invoice%s_%s.pdf"' %(i.pk, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year )
#         genInvoice(response , i , request)
#         f = open('./media_root/warehouse_invoice%s%s_%s.pdf'%(i.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
#         f.write(response.content)
#         f.close()
#         if 'saveOnly' in request.GET:
#             return Response(status=status.HTTP_200_OK)
#         return response


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
        # print self.invoice.status
        now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
        # print self.invoice.status
        # if self.invoice.status in ['quoted']:
        #     docTitle = 'SALES QUOTATION'
        # else:
        docTitle = 'TAX INVOICE'

        passKey = '%s%s'%(str(self.req.user.date_joined.year) , self.req.user.pk) # also the user ID
        docID = '%s%s' %( now.year , self.contract.pk)


        pSrc = '''
        <font size=14>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
        <font size=9>
        <strong>Generated by:</strong> %s<br/>
        <strong>On:</strong> %s<br/><br/>
        <strong>Document ID:</strong> %s<br/><br/>
        </font>
        ''' % ( docTitle , '%s %s (%s)' %(self.req.user.first_name ,self.req.user.last_name , passKey )  , now.strftime("%d-%B-%Y - %H:%M:%S") , docID)

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
    docID = '%s%s' %( now.year , doc.contract.pk)

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


def genInvoice(response , contract, request):


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
    pHeadTax  = Paragraph('<strong>IGST <br/> Tax</strong>' , tableHeaderStyle)
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

    invoiceobj=Invoice.objects.get(contract=contract.pk)
    for i in json.loads(invoiceobj.data):
        print i
        pDescSrc = i['desc']

        # totalQuant += i['quantity']
        #
        # print i
        #
        # if 'price' not in i:
        #     print "Continuing"
        #     continue

        # i['subTotalTax'] = i['data']['price'] * i['quantity'] * ( i['data']['productMeta']['taxRate']/float(100))
        #
        # i['subTotal'] = i['data']['price'] * i['quantity'] * (1+ i['data']['productMeta']['taxRate']/float(100))

        totalQuant += i['quantity']
        totalTax += i['totalTax']
        grandTotal += i['subtotal']

        pBodyProd = Paragraph('Service' , tableBodyStyle)
        pBodyTitle = Paragraph( pDescSrc , tableBodyStyle)
        pBodyQty = Paragraph(str(i['quantity']) , tableBodyStyle)
        pBodyPrice = Paragraph(str(i['rate']) , tableBodyStyle)
        # if 'taxCode' in i:
        if 'taxCode' in i:
            taxCode = '%s(%s %%)' %(i['taxCode'] , i['tax'])
        else:
            taxCode = ''

        pBodyTaxCode = Paragraph(taxCode , tableBodyStyle)
        pBodyTax = Paragraph(str(i['totalTax']) , tableBodyStyle)
        pBodyTotal = Paragraph(str(i['quantity']*i['rate']) , tableBodyStyle)
        pBodySubTotal = Paragraph(str(i['subtotal']) , tableBodyStyle)


        data.append([pBodyProd, pBodyTitle,pBodyTaxCode, pBodyPrice, pBodyQty, pBodyTotal, pBodyTax , pBodySubTotal])

    contract.subTotal = grandTotal
    # invoice.saveInvoiceForm()

    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10


    data += [['', '','','', '', '',Paragraph(str(totalTax) , tableBodyStyle)  , Paragraph(str(grandTotal) , tableBodyStyle) ],
            ['', '', '', '', '',  Paragraph('sub Total (INR)' , tableHeaderStyle), '' , Paragraph(str(grandTotal) , tableGrandStyle)]]
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

    adrs = contract.company

    if contract.company.tin is None:
        tin = 'NA'
    else:
        tin = contract.company.tin

    summryParaSrc = """
    <font size='11'><strong>Customer details:</strong></font> <br/><br/>
    <font size='9'>
    %s<br/>
    %s<br/>
    %s<br/>
    %s , %s<br/>
    %s<br/>
    <strong>GSTIN:</strong>%s<br/>
    </font>
    """ %(contract.company.name ,contract.company.street , contract.company.city ,contract.company.state , contract.company.pincode , contract.company.country , contract.company.tin)
    story.append(Paragraph(summryParaSrc , styleN))
    story.append(t)
    story.append(Spacer(2.5,0.5*cm))

    # if invoice.status in ['billed' , 'approved' , 'recieved']:
    #     summryParaSrc = settingsFields.get(name = 'regulatoryDetails').value
    #     story.append(Paragraph(summryParaSrc , styleN))
    #
    #     summryParaSrc = settingsFields.get(name = 'bankDetails').value
    #     story.append(Paragraph(summryParaSrc , styleN))
    #
    #     tncPara = settingsFields.get(name = 'tncInvoice').value
    #
    # else:
    # tncPara = settingsFields.get(name = 'tncQuotation').value
    #
    # story.append(Paragraph(tncPara , styleN))

    # scans = ['scan.jpg' , 'scan2.jpg', 'scan3.jpg']
    # for s in scans:
    #     story.append(PageBreak())
    #     story.append(FullPageImage(s))


    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)



class DownloadInvoice(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        if 'contract' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type='application/pdf')
        print request.GET['contract']
        o = Contract.objects.get(id = request.GET['contract'])
        # o = Invoice.objects.get(contract = request.GET['contract'])
        response['Content-Disposition'] = 'attachment; filename="invoicedownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , o.pk)
        genInvoice(response , o , request)
        # f = open('./media_root/invoicedownload%s%s.pdf'%(o.pk, o.status) , 'wb')
        # f.write(response.content)
        # f.close()
        if 'saveOnly' in request.GET:
            return Response(status=status.HTTP_200_OK)
        return response
