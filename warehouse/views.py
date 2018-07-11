
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
import json
import pytz
import requests
from .models import *
from .serializers import *
from django.conf import settings as globalSettings
from django.db.models import Q
import datetime
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage


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
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['company']

class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contract','status']

class SpaceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = SpaceSerializer
    queryset = Space.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class CheckinViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CheckinsSerializer
    queryset = Checkin.objects.all().order_by('-qty')
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['contract' ,'description']

class CheckoutViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = CheckoutSerializer
    queryset = Checkout.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parent']


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

# <<<<<<< HEAD
        for page in self.pages:
            self.__dict__.update(page)
            # self.draw_page_number(page_count)
            self.drawLetterHeadFooter()
            canvas.Canvas.showPage(self)

        canvas.Canvas.save(self)


# =======

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


# >>>>>>> 20c361fdeb1f8a000ef15776e239c2834a00463c
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
        print '*******************',settingsFields.get(name = 'bankDetails').value

        p = Paragraph(settingsFields.get(name = 'companyName').value , compNameStyle)
        p.wrapOn(self , 70*mm , 10*mm)
        p.drawOn(self , 80*mm  , 18*mm)

        p1 = Paragraph(settingsFields.get(name = 'companyAddress').value , compNameStyle)
        p1.wrapOn(self , 210*mm , 10*mm)
        p1.drawOn(self , 4*mm  , 10*mm)


        p2 = Paragraph( settingsFields.get(name = 'contactDetails').value, compNameStyle)
        p2.wrapOn(self , 200*mm , 10*mm)
        p2.drawOn(self , 9*mm  , 4*mm)

        from svglib.svglib import svg2rlg
        drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'anchor_icon.svg'))
        sx=sy=2
        drawing.width,drawing.height = drawing.minWidth()*sx, drawing.height*sy
        drawing.scale(sx,sy)
        #if you want to see the box around the image
        # drawing._showBoundary = True
        renderPDF.draw(drawing, self,10*mm  , self._pagesize[1]-20*mm)

        #width = self._pagesize[0]
        # page = "Page %s of %s" % (, page_count)
        # self.setFont("Helvetica", 9)
        # self.drawRightString(195*mm, 272*mm, page)


def genInvoice(response , contract,invoiceobj, request):


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
    invoiceobj.grandTotal = grandTotal
    invoiceobj.save()
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

    summryParaSrc = settingsFields.get(name = 'bankDetails').value
    story.append(Paragraph(summryParaSrc , styleN))


    pdf_doc.build(story,onFirstPage=addPageNumber, onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)



class DownloadInvoice(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'cccccccccccccccccccccccccc'
        if 'contract' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if 'saveOnly' in request.GET:
            return Response(status=status.HTTP_200_OK)

        response = HttpResponse(content_type='application/pdf')
        print request.GET['contract']

        o = Contract.objects.get(id = request.GET['contract'])
        invoiceobj=Invoice.objects.get(contract=request.GET['contract'],pk=request.GET['inoicePk'])
        print o
        # o = Invoice.objects.get(contract = request.GET['contract'])
        response['Content-Disposition'] = 'attachment; filename="invoicedownload%s%s.pdf"' %( datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year , o.pk)
        genInvoice(response , o ,invoiceobj, request)


        return response

class DashboardInvoices(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'cccccccccccccccccccccccccc'
        if 'cName' in request.GET:
            print request.GET['cName']
            toReturn = Invoice.objects.filter(~Q(status='received'),contract__company__name__icontains=request.GET['cName']).values('pk','contract__company__name','status','dueDate','billedDate')
        else:
            toReturn = Invoice.objects.filter(~Q(status='received')).values('pk','contract__company__name','status','dueDate','billedDate')
        print toReturn
        return Response(toReturn, status=status.HTTP_200_OK)

class SendNotificationAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self , request , format = None):
        print request.data
        toEmail = []
        cc = []

        if request.data['sendEmail']:
            for c in request.data['contacts']:
                em = Contact.objects.get(pk=c).email
                if em is not None:
                    toEmail.append(em)
            print toEmail

            for c in request.data['internal']:
                p = profile.objects.get(user_id = c)
                u = User.objects.get(pk = c)
                cc.append(u.email)
            print cc

        toSMS = []
        if request.data['sendSMS']:
            for c in request.data['contacts']:
                mob = Contact.objects.get(pk=c).mobile
                if mob is not None:
                    toSMS.append(mob)
            print toSMS

        c = Invoice.objects.get(pk = request.data['contract'])

        # print dir(att)
        # return Response(status=status.HTTP_200_OK)

        docID = '%s%s%s' %(c.contract.pk, c.billedDate.year , c.pk)
        value = c.grandTotal

        typ = request.data['type']
        print "will send invoice generated mail to " , toEmail , cc , toSMS
        print docID , value
        if typ == 'invoiceGenerated':
            email_subject = 'Invoice %s generated'%(docID)
            heading = 'Invoice Generated'
            msgBody = ['We are pleased to share invoice number <strong>%s</strong> for the amount of INR <strong>%s</strong>.' %(docID , value) , 'The due date to make payment is <strong>%s</strong>.' %(c.dueDate) , 'In case you have any query please contact us.']
            smsBody = 'Invoice %s generated for the amount of INR %s. Due date is %s. Please check youe email for more information.'%(docID , value, c.dueDate)
        elif typ == 'dueDateReminder':
            email_subject = 'Payment reminder for invoice %s'%(docID)
            heading = 'Payment reminder'
            msgBody = ['We are sorry but invoice number <strong>%s</strong> for the amount of INR <strong>%s</strong> is still unpaid.' %(docID , value) , 'The due date to make the payment is <strong>%s</strong>. Please make payment at the earliest to avoid late payment fee.' %(c.dueDate) , 'In case you have any query please contact us.']
            smsBody = 'REMINDER : Invoice no. %s is sill unpaid. Due date is %s. Please ignore if paid.'%(docID , c.dueDate)
        elif typ == 'dueDateElapsed':
            email_subject = 'Payment overdue for invoice number %s'%(docID)
            heading = 'Due date missed'
            msgBody = ['We are pleased to share the updated copy of invoice number <strong>%s</strong> for the amount of INR <strong>%s</strong> including the late payment fees.' %(docID , value) , 'The payment is now due <strong>Immediately</strong>.' , 'In case you have any query please contact us.']
            smsBody = 'ALERT : Invoice no. %s updated to include late payment fee. Please pay immediately. Check your email for more info.'%(docID)

        ctx = {
            'heading' : heading,
            'recieverName' : Contact.objects.get(pk=request.data['contacts'][0]).name,
            'message': msgBody,
            'linkUrl': 'cioc.co.in',
            'linkText' : 'View Online',
            'sendersAddress' : '(C) CIOC FMCG Pvt Ltd',
            'sendersPhone' : '841101',
            'linkedinUrl' : 'https://www.linkedin.com/company/13440221/',
            'fbUrl' : 'facebook.com',
            'twitterUrl' : 'twitter.com',
        }

        email_body = get_template('app.clientRelationships.email.html').render(ctx)
        msg = EmailMessage(email_subject, email_body, to= toEmail, cc= cc, from_email= 'do_not_reply@cioc.co.in' )
        msg.content_subtype = 'html'

        if typ != 'dueDateReminder':
            fp = open('./media_root/clientRelationships/doc%s%s_%s.pdf'%(c.contract.pk, c.pk, c.status) , 'rb')
            att = MIMEApplication(fp.read(),_subtype="pdf")
            fp.close()
            att.add_header('Content-Disposition','attachment',filename=fp.name.split('/')[-1])
            msg.attach(att)

        msg.send()

        for n in toSMS:
            url = globalSettings.SMS_API_PREFIX + 'number=%s&message=%s'%(n , smsBody)
            requests.get(url)

        return Response(status=status.HTTP_200_OK)
