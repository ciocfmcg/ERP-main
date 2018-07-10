
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
from HR.models import profile
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.template.loader import render_to_string, get_template
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
from reportlab.graphics.barcode.qr import QrCodeWidget
from django.http import HttpResponse
import datetime
import calendar as pythonCal
import json
import pytz
import requests
from django.template.loader import render_to_string, get_template
from ERP.models import service, appSettingsField
from django.conf import settings as globalSettings
# Create your views here.


class JobsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = JobsSerializer
    queryset = Jobs.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['jobtype','status']

class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = JobApplicationSerializer
    queryset = JobApplication.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['job','status' ,'email' ,'mobile','firstname']

class JobsList(APIView):
    permission_classes = (permissions.AllowAny, )
    def get(self , request , format = None):
        print 'ccccccccccccccccccccc'
        print request.GET
        if 'status' in request.GET:
            querySet = Jobs.objects.filter(status = str(request.GET['status']))
        else:
            querySet = Jobs.objects.all()
        toReturn = list(querySet.values('pk','jobtype','department__dept_name','skill','maximumCTC','unit__name','role__name'))
        print toReturn

        return Response(toReturn )
    def post(self , request , format = None):
        data = request.POST
        d = {'firstname':data['firstname'],'email':data['email'],'mobile':data['mobile'],'job':Jobs.objects.get(pk = int(data['job'])),'resume':request.FILES['resume']}
        if 'lastname' in data:
            d['lastname'] = data['lastname']
        if 'coverletter' in data:
            d['coverletter'] = data['coverletter']
        if 'aggree' in data:
            d['aggree'] = True
        print d
        try:
            obj = JobApplication.objects.create(**d)
            toSend = 'Sucess'
        except:
            toSend = 'Error'
        print toSend
        return Response({'res':toSend}, status = status.HTTP_200_OK)

class InterviewViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = InterviewSerializer
    queryset = Interview.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['candidate','interviewer']


class SendLinkAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self, request, format=None):
        contactData=[]
        value = request.data['value']
        if value == 'online':
            email_subject ="On Response to the post you have applied for:"
            msgBody= "Hi " + request.data['first_name'] + " " + request.data['last_name'] + ",\n\n\t\t We are glad to inform you that you are been selected for the next level of interview i.e., Online Assesment. Please find the Assesment Link to complete as part of our interview process.\n\n Best of luck.\n\nThank You"
        elif value == 'email':
            print request.data['subject'] ,'aaaaaaaaaaaaaaaa'
            email_subject = request.data['subject']
            msgBody= request.data['message']
        email=request.data['emailID']
        contactData.append(str(email))
        msg = EmailMessage(email_subject, msgBody,  to= contactData )
        msg.send()
        return Response({}, status = status.HTTP_200_OK)

class InviteInterviewAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self, request, format=None):
        print request.data
        contactData=[]
        email_subject=''
        msgBody=''
        value = request.data['value']
        print value,'aaaaaaaaaaaaaaabbbbbbb'
        if value == 'telephonic':
            email_subject = "On Response to the post you have applied for:"
            msgBody = "Hi " + request.data['first_name'] + " " + request.data['last_name'] + ",\n\n\t\t We are glad to inform you that you are been selected for the next level of interview i.e., Telephonic Round of "  + request.data['status'] + ". We would like to invite you to an interview via telephone to tell you more about our role and to get to know you a little better on " + request.data['dateSch'] + "."
        elif value == 'face-to-face':
            email_subject = "On Response to the post you have applied for:"
            msgBody = "Hi " + request.data['first_name'] + " " + request.data['last_name'] + ",\n\n\t\t We are glad to inform you that you are been selected for the next level of interview i.e., Face-To-Face Round of "  + request.data['status'] + ". We would like to invite you to an interview =at our location on " + request.data['dateSch'] + "."
        email=request.data['emailID']
        contactData.append(str(email))
        msg = EmailMessage(email_subject, msgBody,  to= contactData )
        msg.send()
        return Response({}, status = status.HTTP_200_OK)

class ScheduleInterviewAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self, request, format=None):
        contactData=[]
        print request.data,'aaaaaaaaaaaaaaaa'
        resume = request.data['resume']
        interviewerDetail = profile.objects.get(pk = int(request.data['interviewer']))
        recruitermail = interviewerDetail.email
        value = request.data['value']
        if value == 'telephonic':
            email_subject = "Schedule For You:"
            msgBody = "Hi " + request.data['interviewer_firstname'] + " " + request.data['interviewer_lastname'] + ",\n\n\t\t There is interview schedule between you and "+ request.data['first_name'] + " " + request.data['last_name'] + "i.e., Telephonic Interview on. " + request.data['dateSch'] +" He has applied for the post of " + request.data['job'] +" as a " + request.data['jobType'] + " Resume is been attached for further details about the candidate" + request.data['dateSch'] + "."
        elif value == 'face-to-face':
            email_subject = "Schedule For You:"
            msgBody ="Hi " + request.data['interviewer_firstname'] + " " + request.data['interviewer_lastname'] + ",\n\n\t\t There is interview schedule between you and "+ request.data['first_name'] + " " + request.data['last_name'] + "i.e., Face-to-Face Interview on. " + request.data['dateSch'] +" He/She has applied for the post of " + request.data['job'] +" as a " + request.data['jobType'] + " Resume is been attached for further details about the candidate."
        contactData.append(str(recruitermail))
        msg = EmailMessage(email_subject, msgBody,  to= contactData )
        a = str(resume).split('media/')[1]
        msg.attach_file(os.path.join(globalSettings.MEDIA_ROOT,a))
        msg.send()
        return Response({}, status = status.HTTP_200_OK)



themeColor = colors.HexColor('#227daa')

styles = getSampleStyleSheet()
styleN = styles['Normal']
styleH = styles['Heading1']


settingsFields = application.objects.get(
    name='app.clientRelationships').settings.all()


class FullPageImage(Flowable):
    def __init__(self, img):
        Flowable.__init__(self)
        self.image = img

    def draw(self):
        img = utils.ImageReader(self.image)

        iw, ih = img.getSize()
        aspect = ih / float(iw)
        width, self.height = PAGE_SIZE
        width -= 3.5 * cm
        self.canv.drawImage(os.path.join(BASE_DIR, self.image), -1 * MARGIN_SIZE +
                            1.5 * cm, -1 * self.height + 5 * cm, width, aspect * width)


class expanseReportHead(Flowable):

    def __init__(self, request, contract):
        Flowable.__init__(self)
        self.req = request
        self.contract = contract
    #----------------------------------------------------------------------

    def draw(self):
        """
        draw the floable
        """
        print self.contract.status
        now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
        docTitle = 'JOINING LETTER'


        passKey = '%s%s' % (str(self.req.user.date_joined.year),
                            self.req.user.pk)  # also the user ID
        docID = '%s%s%s' % (self.contract.job.pk, now.year, self.contract.pk)

        pSrc = '''
        <font size=14>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<u>%s</u></font><br/><br/><br/>
        <font size=9>
        <strong>Generated by:</strong> %s<br/>
        <strong>On:</strong> %s<br/><br/>
        <strong>Document ID:</strong> %s<br/><br/>
        </font>
        ''' % (docTitle, '%s %s (%s)' % (self.req.user.first_name, self.req.user.last_name, passKey), now.strftime("%d-%B-%Y - %H:%M:%S"), docID)

        story = []
        head = Paragraph(pSrc, styleN)
        head.wrapOn(self.canv, 200 * mm, 50 * mm)
        head.drawOn(self.canv, 0 * mm, -10 * mm)

        # barcode_value = "1234567890"
        # barcode39 = barcode.createBarcodeDrawing('EAN13', value = barcode_value,barWidth=0.3*mm,barHeight=10*mm)
        #
        # barcode39.drawOn(self.canv,160*mm,0*mm)
        # self.canv.drawImage(os.path.join(BASE_DIR , 'logo.png') , 80*mm , 0*mm , 2*cm, 2*cm)


def addPageNumber(canvas, doc):
    """
    Add the page number
    """
    print doc.contract,'aaaaaaaaaaaaaaaaa'
    now = datetime.datetime.now(pytz.timezone('Asia/Kolkata'))
    passKey = '%s%s' % (str(doc.request.user.date_joined.year),
                        doc.request.user.pk)  # also the user ID
    docID = '%s%s%s' % (doc.contract.job.pk, now.year, doc.contract.pk)

    qrw = QrCodeWidget(
        'http://cioc.co.in/documents?id=%s&passkey=%s&app=callLetter' % (docID, passKey))
    b = qrw.getBounds()

    w = b[2] - b[0]
    h = b[3] - b[1]

    d = Drawing(60, 60, transform=[60. / w, 0, 0, 60. / h, 0, 0])
    d.add(qrw)
    renderPDF.draw(d, canvas, 180 * mm, 270 * mm)

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

        text = "<font size='8'>Page #%s of %s</font>" % (
            self._pageNumber, page_count)
        p = Paragraph(text, styleN)
        p.wrapOn(self, 50 * mm, 10 * mm)
        p.drawOn(self, 100 * mm, 10 * mm)

    def drawLetterHeadFooter(self):
        self.setStrokeColor(themeColor)
        self.setFillColor(themeColor)
        self.rect(0, 0, 1500, 70, fill=True)
        # print dir(self)
        compNameStyle = styleN.clone('footerCompanyName')
        compNameStyle.textColor = colors.white

        p = Paragraph(settingsFields.get(
            name='companyName').value, compNameStyle)
        p.wrapOn(self, 50 * mm, 10 * mm)
        p.drawOn(self, 85 * mm, 18 * mm)

        p1 = Paragraph(settingsFields.get(
            name='companyAddress').value, compNameStyle)
        p1.wrapOn(self, 200 * mm, 10 * mm)
        p1.drawOn(self, 15 * mm, 10 * mm)

        p2 = Paragraph(settingsFields.get(
            name='contactDetails').value, compNameStyle)
        p2.wrapOn(self, 200 * mm, 10 * mm)
        p2.drawOn(self, 40 * mm, 4 * mm)

        from svglib.svglib import svg2rlg
        drawing = svg2rlg(os.path.join(globalSettings.BASE_DIR,
                                       'static_shared', 'images', 'cioc_icon.svg'))
        sx = sy = 0.5
        drawing.width, drawing.height = drawing.minWidth() * sx, drawing.height * sy
        drawing.scale(sx, sy)
        # if you want to see the box around the image
        # drawing._showBoundary = True
        renderPDF.draw(drawing, self, 10 * mm, self._pagesize[1] - 20 * mm)

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

    # pHeadProd = Paragraph(
    #     '<strong>Product/<br/>Service</strong>', tableHeaderStyle)
    # pHeadDetails = Paragraph('<strong>Details</strong>', tableHeaderStyle)
    # pHeadTaxCode = Paragraph('<strong>HSN/<br/>SAC</strong>', tableHeaderStyle)
    # pHeadQty = Paragraph('<strong>Qty</strong>', tableHeaderStyle)
    # pHeadPrice = Paragraph('<strong>Rate</strong>', tableHeaderStyle)
    # pHeadTotal = Paragraph('<strong>Total</strong>', tableHeaderStyle)
    # pHeadTax = Paragraph('<strong>IGST <br/> Tax</strong>', tableHeaderStyle)
    # pHeadSubTotal = Paragraph('<strong>Sub Total</strong>', tableHeaderStyle)
    #
    # # bookingTotal , bookingHrs = getBookingAmount(o)
    #
    # pFooterQty = Paragraph('%s' % ('o.quantity') , styles['Normal'])
    # pFooterTax = Paragraph('%s' %('tax') , styles['Normal'])
    # pFooterTotal = Paragraph('%s' % (1090) , styles['Normal'])
    # pFooterGrandTotal = Paragraph('%s' % ('INR 150') , tableHeaderStyle)
    #
    # data = [[pHeadProd, pHeadDetails, pHeadTaxCode, pHeadPrice,
    #          pHeadQty, pHeadTotal, pHeadTax, pHeadSubTotal]]
    #
    # totalQuant = 0
    # totalTax = 0
    # grandTotal = 0
    # tableBodyStyle = styles['Normal'].clone('tableBodyStyle')
    # tableBodyStyle.fontSize = 7

    # for i in json.loads(contract.data):
    #     print i
    #     pDescSrc = i['desc']
    #
    #     totalQuant += i['quantity']
    #     totalTax += i['totalTax']
    #     grandTotal += i['subtotal']
    #
    #     pBodyProd = Paragraph('Service', tableBodyStyle)
    #     pBodyTitle = Paragraph(pDescSrc, tableBodyStyle)
    #     pBodyQty = Paragraph(str(i['quantity']), tableBodyStyle)
    #     pBodyPrice = Paragraph(str(i['rate']), tableBodyStyle)
    #     if 'taxCode' in i:
    #         taxCode = '%s(%s %%)' % (i['taxCode'], i['tax'])
    #     else:
    #         taxCode = ''
    #
    #     pBodyTaxCode = Paragraph(taxCode, tableBodyStyle)
    #     pBodyTax = Paragraph(str(i['totalTax']), tableBodyStyle)
    #     pBodyTotal = Paragraph(str(i['quantity'] * i['rate']), tableBodyStyle)
    #     pBodySubTotal = Paragraph(str(i['subtotal']), tableBodyStyle)
    #
    #     data.append([pBodyProd, pBodyTitle, pBodyTaxCode, pBodyPrice,
    #                  pBodyQty, pBodyTotal, pBodyTax, pBodySubTotal])

    # contract.grandTotal = grandTotal
    contract.save()

    tableGrandStyle = tableHeaderStyle.clone('tableGrandStyle')
    tableGrandStyle.fontSize = 10
    #
    # data += [['', '', '', '', '', '', Paragraph(str(totalTax), tableBodyStyle), Paragraph(str(grandTotal), tableBodyStyle)],
    #          ['', '', '', '', '',  Paragraph('Grand Total (INR)', tableHeaderStyle), '', Paragraph(str(grandTotal), tableGrandStyle)]]
    # t = Table(data)
    # ts = TableStyle([('ALIGN', (1, 1), (-3, -3), 'RIGHT'),
    #                  ('VALIGN', (0, 1), (-1, -3), 'TOP'),
    #                  ('VALIGN', (0, -2), (-1, -2), 'TOP'),
    #                  ('VALIGN', (0, -1), (-1, -1), 'TOP'),
    #                  ('SPAN', (-3, -1), (-2, -1)),
    #                  ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    #                  ('BACKGROUND', (0, 0), (-1, 0), themeColor),
    #                  ('LINEABOVE', (0, 0), (-1, 0), 0.25, themeColor),
    #                  ('LINEABOVE', (0, 1), (-1, 1), 0.25, themeColor),
    #                  ('BACKGROUND', (-2, -2), (-1, -2), colors.HexColor('#eeeeee')),
    #                  ('BACKGROUND', (-3, -1), (-1, -1), themeColor),
    #                  ('LINEABOVE', (-2, -2), (-1, -2), 0.25, colors.gray),
    #                  ('LINEABOVE', (0, -1), (-1, -1), 0.25, colors.gray),
    #                  # ('LINEBELOW',(0,-1),(-1,-1),0.25,colors.gray),
    #                  ])
    # t.setStyle(ts)
    # t._argW[0] = 1.5 * cm
    # t._argW[1] = 6 * cm
    # t._argW[2] = 2.4 * cm
    # t._argW[3] = 2 * cm
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

    # adrs = contract.deal.company.address

    # if contract.deal.company.tin is None:
    #     tin = 'NA'
    # else:
    #     tin = contract.deal.company.tin

    summryParaSrc = """
    <font size='11'><strong>To, </strong></font> <br/>
    <font size='11'><strong>%s %s </strong></font> <br/>
    <font size='9'><br/>
    Subject : Joining Details
    </font>
    <font size='9'><br/><br/>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;In response to your application & subsequent interview, we are pleased to inform you that, you are been selected as %s - %s with effect from %s with a payscale of %s.
    </font>
    """%(contract.firstname,contract.lastname,contract.job.role.name,contract.job.jobtype,contract.dateOfJoin,contract.sallary)
    story.append(Paragraph(summryParaSrc, styleN))
    # story.append(t)
    story.append(Spacer(2.5, 0.5 * cm))
    #
    # if contract.status in ['billed', 'approved', 'recieved']:
    #     summryParaSrc = settingsFields.get(name='regulatoryDetails').value
    #     story.append(Paragraph(summryParaSrc, styleN))
    #
    #     summryParaSrc = settingsFields.get(name='bankDetails').value
    #     story.append(Paragraph(summryParaSrc, styleN))
    #
    #     tncPara = settingsFields.get(name='tncInvoice').value
    #
    # else:
    #     tncPara = settingsFields.get(name='tncQuotation').value

    # story.append(Paragraph(tncPara, styleN))

    # scans = ['scan.jpg' , 'scan2.jpg', 'scan3.jpg']
    # for s in scans:
    #     story.append(PageBreak())
    #     story.append(FullPageImage(s))

    pdf_doc.build(story, onFirstPage=addPageNumber,
                  onLaterPages=addPageNumber, canvasmaker=PageNumCanvas)


class DownloadCallLetter(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self, request, format=None):
        print request.GET['value'],'aaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbb'
        response = HttpResponse(content_type='application/pdf')
        o = JobApplication.objects.get(pk=request.GET['value'])
        print o
        response['Content-Disposition'] = 'attachment; filename="Call_letter%s_%s_%s.pdf"' % (
             o.job.pk, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, o.pk)
        genInvoice(response, o, request)
        f = open(os.path.join(globalSettings.BASE_DIR, 'media_root/Call_letter%s%s_%s.pdf' %
                              ( o.job.pk, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year, o.pk)), 'wb')
        f.write(response.content)
        f.close()
        # return Response(status=status.HTTP_200_OK)
        return response
