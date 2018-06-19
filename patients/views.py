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

def invoice(response):
    print '999999999999999999999999999999999999999'
    now = datetime.datetime.now()

    (invDate,refid,name,admitDate,dischargeDate,total) = ('19-06-2018','RR/0236/18','priyanka','15-06-2018','19-06-2018',20000)
    # originalData = {'grandTotal':25000,'rfid':}
    details = [{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757},{'name':'name1','qty':7,'rate':77},{'name':'name2','qty':5,'rate':130},{'name':'name3','qty':4,'rate':2500},{'name':'name4','qty':10,'rate':3750},{'name':'name5','qty':2,'rate':785},{'name':'name6','qty':5,'rate':1000},{'name':'name7','qty':7,'rate':757}]
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
    elements.append(Paragraph("<para fontSize=8 alignment='right' rightIndent=15><b> Date : {0} </b></para>".format(invDate),styles['Normal']))
    elements.append(Spacer(1, 12))
    data2=[['Ref Id : {0}'.format(refid),'Patient Name : {0}'.format(name.upper())],['Admitted on : {0}'.format(admitDate),'Discharged on : {0}'.format(dischargeDate)]]
    rheights=2*[0.2*inch]
    cwidths=2*[2.1*inch]
    cwidths[1]=3.5*inch
    t2=Table(data2,rowHeights=rheights,colWidths=cwidths)
    t2.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'), ]))
    elements.append(t2)
    elements.append(Spacer(1, 12))
    data2=[['Ref Id : {0}'.format(refid),'Patient Name : {0}'.format(name.upper())],['Admitted on : {0}'.format(admitDate),'Discharged on : {0}'.format(dischargeDate)]]
    rheights=(totalRows+1)*[0.25*inch]
    cwidths=4*[0.5*inch]
    cwidths[1]=4*inch
    data3=[]
    for i,j in enumerate(range(totalRows+1)):
        # print i,j
        if i==0:
            data3.append(['SL No.','Particulars','Qty','Amount '])
        else:
            data3.append([i,details[i-1]['name'].upper(),details[i-1]['qty'],details[i-1]['rate']])

    t3=Table(data3,rowHeights=rheights,colWidths=cwidths)
    t3.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('LINEBELOW',(0,0),(-1,0),0.8,black),('LINEBELOW',(0,-1),(-1,-1),0.8,black),('VALIGN',(0,0),(-1,-1),'TOP'), ]))
    elements.append(t3)
    elements.append(Spacer(1, 7))
    # elements.append(HRFlowable(width="20%", thickness=1, color=black ,hAlign='RIGHT',spaceBefore=12))
    elements.append(Paragraph("<para fontSize=8 alignment='right' rightIndent=75><b> Total : {0} </b></para>".format(total),styles['Normal']))

    doc.build(elements,canvasmaker=PageNumCanvas)


class InvoiceSlip(APIView):
    def get(self , request , format = None):
        print 'enterrrrrrrrrrrrrrrrrr'
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="invoice.pdf"'
        invoice(response)
        return response
