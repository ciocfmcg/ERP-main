from __future__ import unicode_literals
from django.shortcuts import render
from rest_framework import viewsets, permissions, serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *

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
import datetime
import time
import calendar
from forex_python.converter import CurrencyCodes

from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.views import APIView
from django.conf import settings as globalSettings
from django.db.models import Q, F
from django.db.models.functions import Concat
from django.db.models import Value
import json
# Create your views here.


class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uniqueId', 'firstName']


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend]

class DishchargeSummaryViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = DishchargeSummarySerializer
    queryset = DischargeSummary.objects.all()
    filter_backends = [DjangoFilterBackend]


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['activePatient']


class ActivePatientViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ActivePatientSerializer
    queryset = ActivePatient.objects.all()
    filter_backends = [DjangoFilterBackend]

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
            self.draw_page_number(page_count)
            canvas.Canvas.showPage(self)

        canvas.Canvas.save(self)
    #----------------------------------------------------------------------
    def draw_page_number(self, page_count):
        """
        Add the page number
        """
        styles = getSampleStyleSheet()
        text = "<font size='8'>Page #%s of %s</font>" % (self._pageNumber , page_count)
        p = Paragraph(text , styles['Normal'])
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 100*mm , 10*mm)

def invoice(response,inv):
    print '999999999999999999999999999999999999999'
    now = datetime.datetime.now()
    print inv

    ad = str(inv.activePatient.inTime).split(' ')[0].split('-')
    (refid,name,admitDate,dischargeDate,total) = (inv.activePatient.patient.uniqueId,inv.activePatient.patient.firstName+' '+inv.activePatient.patient.lastName,ad[2]+'-'+ad[1]+'-'+ad[0],'',inv.grandTotal)
    data = json.loads(inv.products)
    details = []
    for i in data:
        details.append({'name':i['data']['name'],'qty':i['quantity'],'rate':i['data']['rate']})
    print '************',details

    totalRows = len(details)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=A4, topMargin=0.5*cm,leftMargin=1*cm,rightMargin=1*cm)
    elements = []
    logo = os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'hospital_logo.png')
    im = Image(logo,height=0.8*inch ,width=0.6*inch)

    p1=[
       Paragraph("<para fontSize=20 alignment='center' leading=25 textColor=darkblue><b> CHAITANYA HOSPITAL </b></para>",styles['Normal']),
       Paragraph("<para fontSize=10 textColor=darkblue spaceBefore=3 leftIndent=5># 80, 3rd Cross, P & T Colony, R. T. Nagar, Bangalore - 560 032. Ph : 2333 3581, Fax : 2343 2633</para>",styles['Normal']),
       Paragraph("<para fontSize=8 alignment='left' textColor=darkblue spaceBefore=3 leftIndent=5><strong>Reg. No. 711 / 95-96 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Service Tax No. AAAFC5438JSD001 </strong></para>",styles['Normal']),
       ]
    # Paragraph("<para fontSize=8 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(calendar.month_name[now.month],now.year),styles['Normal'])

    data1=[[im,p1]]
    rheights=1*[0.8*inch]
    cwidths=2*[0.7*inch]
    cwidths[1]=6.5*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)
    elements.append(t1)

    elements.append(HRFlowable(width="100%", thickness=1, color=darkblue))

    elements.append(Spacer(1, 6))

    elements.append(Paragraph("<para fontSize=12 alignment='center'textColor=darkblue><b> RECEIPT / BILL </b></para>",styles['Normal']))

    elements.append(Paragraph("<para fontSize=8 alignment='right' rightIndent=15><b> Date : {0}-{1}-{2}</b></para>".format(now.day,now.month,now.year),styles['Normal']))

    elements.append(Spacer(1, 12))

    data2=[['Ref Id : {0}'.format(refid),'Patient Name : {0}'.format(name.upper())],['Admitted on : {0}'.format(admitDate),'Discharged on : {0}-{1}-{2}'.format(now.day,now.month,now.year)]]

    rheights=2*[0.2*inch]
    cwidths=2*[2.8*inch]
    cwidths[1]=3.5*inch
    t2=Table(data2,rowHeights=rheights,colWidths=cwidths)
    t2.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'), ]))
    elements.append(t2)

    elements.append(Spacer(1, 12))

    rheights=(totalRows+1)*[0.25*inch]
    cwidths=5*[0.4*inch]
    cwidths[0]=0.5*inch
    cwidths[1]=4*inch
    cwidths[3]=0.6*inch
    cwidths[4]=0.8*inch
    data3=[]
    for i,j in enumerate(range(totalRows+1)):
        # print i,j
        if i==0:
            data3.append(['SL No.','Particulars','Qty','Price','Amount '])
        else:
            data3.append([i,details[i-1]['name'].upper(),details[i-1]['qty'],details[i-1]['rate'],details[i-1]['qty']*details[i-1]['rate']])

    t3=Table(data3,rowHeights=rheights,colWidths=cwidths)
    t3.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('LINEBELOW',(0,0),(-1,0),0.8,black),('LINEBELOW',(0,-1),(-1,-1),0.8,black),('VALIGN',(0,0),(-1,-1),'TOP'), ]))
    elements.append(t3)
    elements.append(Spacer(1, 7))
    # elements.append(HRFlowable(width="20%", thickness=1, color=black ,hAlign='RIGHT',spaceBefore=12))
    elements.append(Paragraph("<para fontSize=8 alignment='right' rightIndent=70><b> Total : {0} </b></para>".format(total),styles['Normal']))

    doc.build(elements,canvasmaker=PageNumCanvas)

def dischargeSummary(response):
    print '77777777777777777'
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=A4, topMargin=0.5*cm,leftMargin=1*cm,rightMargin=1*cm)
    elements = []

    # logo = "hospital_logo.png"
    logo = os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'hospital_logo.png')
    im = Image(logo,height=0.8*inch ,width=0.6*inch)

    p1=[
       Paragraph("<para fontSize=20 alignment='center' leading=25 textColor=darkblue><b> CHAITANYA HOSPITAL </b></para>",styles['Normal']),
       Paragraph("<para fontSize=10 textColor=darkblue spaceBefore=3 leftIndent=5># 80, 3rd Cross, P & T Colony, R. T. Nagar, Bangalore - 560 032. Ph : 2333 3581, Fax : 2343 2633</para>",styles['Normal']),
       Paragraph("<para fontSize=8 alignment='left' textColor=darkblue spaceBefore=3 leftIndent=5><strong>Reg. No. 711 / 95-96 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Service Tax No. AAAFC5438JSD001 </strong></para>",styles['Normal']),
       ]
    # Paragraph("<para fontSize=8 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(calendar.month_name[now.month],now.year),styles['Normal'])

    data1=[[im,p1]]
    rheights=1*[0.8*inch]
    cwidths=2*[0.7*inch]
    cwidths[1]=6.5*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)
    elements.append(t1)

    elements.append(HRFlowable(width="100%", thickness=1, color=darkblue))

    elements.append(Spacer(1, 6))

    elements.append(Paragraph("<para fontSize=12 alignment='center'textColor=darkblue><b> DISCHARGE SUMMARY </b></para>",styles['Normal']))

    elements.append(Spacer(1, 15))

    ld = Paragraph("<para textColor=darkblue fontSize=7 spaceAfter=5>:................................................................................................................................................................................</para>",styles['Normal']),

    hld = Paragraph("<para textColor=darkblue fontSize=7 spaceBefore=9>:........................................................................................................</para>",styles['Normal']),

    lbreak = Paragraph("<para textColor=darkblue> <br/></para>",styles['Normal']),

    p1_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Patient's Name</b></para>",styles['Normal']),
    p1_2=Paragraph("<para textColor=darkblue fontSize=7>:................................................................................................. <b>Age </b>:......................<b>Sex</b> :.......................................</para>",styles['Normal'])

    p2_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Telephone No / Mobile No.</b></para>",styles['Normal'])

    p3_1= Paragraph("<para fontSize=7 textColor=darkblue><b>UHID No.</b></para>",styles['Normal']),
    p3_2=Paragraph("<para textColor=darkblue fontSize=7>:...........................................................................&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>4.IP No</b>. :......................................................................</para>",styles['Normal'])

    p5_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Treating Consultant/s Name<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a. Contact Numbers <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b. Department/ Specialty </b></para>",styles['Normal']),

    p6_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Date Of Admission With Time</b></para>",styles['Normal']),
    p6_2=Paragraph("<para textColor=darkblue fontSize=7>:.......................<b>/</b> ................................<b>/</b> .................................. Hours</para>",styles['Normal'])

    p7_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Date Of Discharge With Time</b></para>",styles['Normal']),

    p8_1= Paragraph("<para fontSize=7 textColor=darkblue><b>MLC No.</b></para>",styles['Normal']),
    p8_2=Paragraph("<para textColor=darkblue fontSize=7>:.............................................. <b>FIR No.</b> .......................................................</para>",styles['Normal'])

    p9_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Provisional Diagnosis<br/>At The Time Of Admission</b></para>",styles['Normal'])

    p10_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Final Diagnosis<br/>At The Time Of Discharge</b></para>",styles['Normal'])

    p11_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Presenting Complaints With Duration And Reason For Admission</b></para>",styles['Normal'])

    p12_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Summary Of Presenting Illness</b></para>",styles['Normal'])

    p13_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Key Findings, On Physical Examination At The Time Of Admission</b></para>",styles['Normal'])

    p14_1= Paragraph("<para fontSize=7 textColor=darkblue><b>History Of Alcoholism, Tobacco Or Substance Abuse, If Any</b></para>",styles['Normal'])

    p15_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Significant Past Medical And Surgical History, If Any</b></para>",styles['Normal'])

    p16_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Family History If Significant / Relevent To Diagnosis Or Treatment</b></para>",styles['Normal'])

    p17_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Summary Of Key Investigations During Hospitalization</b></para>",styles['Normal'])

    p18_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Course In The Hospital Including Complications, If Any</b></para>",styles['Normal'])

    p19_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Patient Condition At The Time Of Discharge</b></para>",styles['Normal'])

    p20_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Advice On Discharge</b></para>",styles['Normal'])

    p21_1= Paragraph("<para fontSize=7 textColor=darkblue><b>Review On</b></para>",styles['Normal'])

    p22_1= Paragraph("<para fontSize=7 textColor=darkblue><b>In Case Of Complications Such As</b></para>",styles['Normal'])
    p22_2=Paragraph("<para textColor=darkblue fontSize=7>:........................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................... <b>Contact The Consultant</b></para>",styles['Normal'])

    l1=['1.',p1_1,p1_2]
    l2=['2.',p2_1,ld]
    l3=['3.',p3_1,p3_2]
    l5=['5.',p5_1,ld+hld+hld]
    l6=['6.',p6_1,p6_2]
    l7=['7.',p7_1,p6_2]
    l8=['8.',p8_1,p8_2]
    l9=['9.',p9_1,lbreak+ld]
    l10=['10.',p10_1,lbreak+ld]
    l11=['11.',p11_1,lbreak+ld+ld+ld+ld]
    l12=['12.',p12_1,ld+ld+ld]
    l13=['13.',p13_1,lbreak+ld+ld+ld+ld]
    l14=['14.',p14_1,lbreak+ld+ld+ld]
    l15=['15.',p15_1,lbreak+ld+ld+ld]
    l16=['16.',p16_1,lbreak+ld+ld+ld]
    l17=['17.',p17_1,lbreak+ld+ld+ld]
    l18=['18.',p18_1,lbreak+ld+ld+ld+ld+ld+ld]
    l19=['19.',p19_1,lbreak+ld+ld+ld]
    l20=['20.',p20_1,ld+ld+ld+ld+ld+ld]
    l21=['21.',p21_1,ld+ld+ld]
    l22=['22.',p22_1,p22_2]

    data=[l1,l2,l3,l5,l6,l7,l8,l9,l10,l11,l12,l13,l14,l15,l16,l17,l18,l19,l20,l21,l22]
    rheights=[0.3*inch,0.3*inch,0.3*inch,1*inch,0.3*inch,0.3*inch,0.3*inch,0.5*inch,0.5*inch,1.2*inch,0.8*inch,1.2*inch,1*inch,1*inch,1*inch,1*inch,1.7*inch,1*inch,1.5*inch,0.8*inch,0.6*inch,]
    cwidths=[0.25*inch , 2*inch , 5*inch]
    t2=Table(data,rowHeights=rheights,colWidths=cwidths)
    t2.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),darkblue),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),]))
    elements.append(t2)

    elements.append(Spacer(1,6))

    data3 = [['Treating Consultant /\nAuthorized Team Doctor','Name','',''],['','Signature','',''],['Date & Time :','Reg. No.:','','Contact No. :'],['Patient / Attendant','Name','',''],['','Signature','',''],]
    rheights=5*[0.3*inch]
    cwidths=[1.8*inch , 0.7*inch , 1.9*inch , 2.7*inch]
    t3=Table(data3,rowHeights=rheights,colWidths=cwidths)
    t3.setStyle(TableStyle([('SPAN',(0,0),(0,1)),('SPAN',(0,3),(0,4)),('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),darkblue),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('GRID',(0,0),(-1,-1),1,darkblue),]))
    elements.append(t3)

    elements.append(Spacer(1,8))

    elements.append(Paragraph("<para fontSize=7 textColor=darkblue leftIndent=10><b>In Case Of Emergency - Contact No. of The Hospital</b></para>",styles['Normal']))

    doc.build(elements,canvasmaker=PageNumCanvas)


class InvoiceSlip(APIView):
    def get(self , request , format = None):
        print 'invoiceeeeeeeee'
        print request.GET['invoicePk']
        # inv = list(Invoice.objects.filter(pk = request.GET['invoicePk']).values('grandTotal','products',refId = F('activePatient__patient__uniqueId'),adDate = F('activePatient__inTime'),name = Concat('activePatient__patient__firstName', Value(' '), 'activePatient__patient__lastName')))
        inv = Invoice.objects.get(pk = request.GET['invoicePk'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="invoice.pdf"'
        invoice(response,inv)
        return response

class DischargeSummary(APIView):
    def get(self , request , format = None):
        print 'dischargeeeeeeeeeee'
        print request.GET['pPk']
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="dischargeSummery.pdf"'
        dischargeSummary(response)
        return response
