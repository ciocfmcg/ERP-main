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
from dateutil.relativedelta import relativedelta
# Create your views here.


class ActivePatientLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ActivePatientLiteSerializer
    queryset = ActivePatient.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['patient','outPatient' , 'status']

class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = PatientSerializer
    queryset = Patient.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['uniqueId', 'firstName']

class DoctorViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = DoctorSerializer
    queryset = Doctor.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class DishchargeSummaryViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = DishchargeSummarySerializer
    queryset = DischargeSummary.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['patient']



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
    filter_fields = ['patient','outPatient' , 'status']

    def get_queryset(self):
        return ActivePatient.objects.filter( ~Q(status = 'settled')).order_by('-created')




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
        text = "<font size='14'>Page #%s of %s</font>" % (self._pageNumber , page_count)
        p = Paragraph(text , styles['Normal'])
        p.wrapOn(self , 50*mm , 10*mm)
        p.drawOn(self , 100*mm , 10*mm)

# def myFirstPage(canvas, doc):
#     canvas.saveState()
#     # canvas.rotate(90)
#     canvas.restoreState()
#
#
# def myLaterPages(canvas, doc):
#     canvas.saveState()
#     # canvas.rotate(90)
#     canvas.restoreState()

def invoice(response,inv):
    print '999999999999999999999999999999999999999'
    now = datetime.datetime.now()
    print inv.activePatient.dateOfDischarge,inv.activePatient.inTime

    ad1 = str(inv.activePatient.inTime).split(' ')
    ad = ad1[0].split('-')
    dd1 = str(inv.activePatient.dateOfDischarge).split(' ')
    dd = dd1[0].split('-')
    print dd
    if inv.activePatient.outPatient:
        refId = inv.activePatient.opNo
        a = ''
        d = ''
    else:
        try:
            refId = inv.activePatient.dischargeSummary.get().ipNo
        except DischargeSummary.DoesNotExist:
            refId = ''

        a = ad[2]+'-'+ad[1]+'-'+ad[0]+' '+ ad1[1].split('+')[0]
        try:
            d = dd[2]+'-'+dd[1]+'-'+dd[0]+' '+ dd1[1].split('.')[0]
        except:
            d = ''
    (refid,name,admitDate,dischargeDate,total) = (inv.activePatient.patient.uniqueId,inv.activePatient.patient.firstName+' '+inv.activePatient.patient.lastName,a,d,inv.grandTotal)
    data = json.loads(inv.products)
    details = []
    for i in data:
        details.append({'name':i['data']['name'],'qty':i['quantity'],'rate':i['data']['rate']})
    print '************',details

    totalRows = len(details)

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=0.5*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    elements = []
    logo = os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'hospital_logo.png')
    im = Image(logo,height=1*inch ,width=0.6*inch)

    p1=[
       Paragraph("<para fontSize=30 alignment='center' leading=25 textColor=darkblue><b> CHAITANYA HOSPITAL </b></para>",styles['Normal']),
       Paragraph("<para fontSize=11  spaceBefore=12 leftIndent=5># 80, 3rd Cross, P & T Colony, R. T. Nagar, Bangalore - 560 032. Ph : 2333 3581, Fax : 2343 2633</para>",styles['Normal']),
       Paragraph("<para fontSize=11 alignment='left'  leftIndent=5><strong>Reg. No. 711 / 95-96 </strong></para>",styles['Normal']),
       ]
        # &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Service Tax No. AAAFC5438JSD001
    # Paragraph("<para fontSize=13 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(calendar.month_name[now.month],now.year),styles['Normal'])

    data1=[[im,p1]]
    rheights=1*[1.1*inch]
    cwidths=2*[0.8*inch]
    cwidths[1]=7*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)
    elements.append(t1)

    elements.append(Spacer(1, 10))

    elements.append(HRFlowable(width="100%", thickness=1, color=darkblue))

    elements.append(Spacer(1, 12))

    elements.append(Paragraph("<para fontSize=13 alignment='center'textColor=darkblue><b> RECEIPT / BILL </b></para>",styles['Normal']))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph("<para fontSize=12 alignment='right' rightIndent=15><b> Date : {0}-{1}-{2}</b></para>".format(now.day,now.month,now.year),styles['Normal']))
    elements.append(Paragraph("<para fontSize=12 alignment='left' leftIndent=30><b> Bill No. : {0}</b></para>".format(inv.pk),styles['Normal']))
    elements.append(Paragraph("<para fontSize=12 alignment='left' leftIndent=30><b> Ref ID. : {0}</b></para>".format(refId),styles['Normal']))

    elements.append(Spacer(1, 15))

    if inv.activePatient.outPatient:
        if inv.activePatient.docName:
            dN = inv.activePatient.docName.name
        else:
            dN = ''
        data2=[['Patient Name : {0}'.format(name.upper()),'UHID : {0}'.format(refid)],['DoctorName : {0}'.format(dN),'']]
    else:
        data2=[['Patient Name : {0}'.format(name.upper()),'UHID : {0}'.format(refid)],['Admitted on : {0}'.format(a),'Discharged on : {0}'.format(d)]]


    rheights=2*[0.3*inch]
    cwidths=2*[5*inch]
    cwidths[1]=2.5*inch
    t2=Table(data2,rowHeights=rheights,colWidths=cwidths)
    t2.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 12),('TEXTFONT', (0, 0), (-1, -1), 'Courier'), ]))
    elements.append(t2)

    elements.append(Spacer(1, 50))

    rheights=(totalRows+1)*[0.25*inch]
    cwidths=5*[0.4*inch]
    cwidths[0]=0.8*inch
    cwidths[1]=4.5*inch
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
    t3.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 13),('TEXTFONT', (0, 0), (-1, -1), 'Courier'),('LINEBELOW',(0,0),(-1,0),0.8,black),('LINEBELOW',(0,-1),(-1,-1),0.8,black),('VALIGN',(0,0),(-1,-1),'TOP'), ]))
    elements.append(t3)
    elements.append(Spacer(1, 7))
    # elements.append(HRFlowable(width="20%", thickness=1, color=black ,hAlign='RIGHT',spaceBefore=12))
    elements.append(Paragraph("<para fontSize=13 alignment='right' rightIndent=70><b> Total : {0} </b></para>".format(total),styles['Normal']))

    if inv.billed:
        elements.append(Paragraph("<para fontSize=13 alignment='right' rightIndent=70><b> Amount recieved : {0} </b></para>".format(total-inv.discount),styles['Normal']))
        elements.append(Paragraph("<para fontSize=13 alignment='right' rightIndent=70><b> Discount Amount / Due amount: {0} </b></para>".format(inv.discount),styles['Normal']))

    doc.build(elements,canvasmaker=PageNumCanvas)


def dischargeSummary(response,dis):
    print '77777777777777777'
    print dis
    now = datetime.datetime.now()
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(response,pagesize=letter, topMargin=5*cm,leftMargin=0.1*cm,rightMargin=0.1*cm)
    elements = []

    # logo = "hospital_logo.png"
    logo = os.path.join(globalSettings.BASE_DIR , 'static_shared','images' , 'hospital_logo.png')
    im = Image(logo,height=1*inch ,width=0.6*inch)

    p1=[
       Paragraph("<para fontSize=30 alignment='center' leading=25 textColor=darkblue><b> CHAITANYA HOSPITAL </b></para>",styles['Normal']),
       Paragraph("<para fontSize=11  spaceBefore=12 leftIndent=5># 80, 3rd Cross, P & T Colony, R. T. Nagar, Bangalore - 560 032. Ph : 2333 3581, Fax : 2343 2633</para>",styles['Normal']),
       Paragraph("<para fontSize=11 alignment='left'  leftIndent=5><strong>Reg. No. 711 / 95-96 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Service Tax No. AAAFC5438JSD001 </strong></para>",styles['Normal']),
       ]
    # Paragraph("<para fontSize=13 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(calendar.month_name[now.month],now.year),styles['Normal'])

    data1=[[im,p1]]
    rheights=1*[1.1*inch]
    cwidths=2*[0.8*inch]
    cwidths[1]=7*inch
    t1=Table(data1,rowHeights=rheights,colWidths=cwidths)
    # elements.append(t1)

    # elements.append(Spacer(1, 150))

    # elements.append(HRFlowable(width="100%", thickness=1, color=darkblue))

    elements.append(Spacer(1, 12))

    elements.append(Paragraph("<para fontSize=12 alignment='center'textColor=darkblue><b> DISCHARGE SUMMARY </b></para>",styles['Normal']))

    elements.append(Spacer(1, 15))
    print dis.patient.patient
    ad = str(dis.patient.inTime).split('.')[0]
    dd = str(dis.patient.dateOfDischarge).split('.')[0]
    d = str(now).split('.')[0]
    print d, ad , dd
    # page= int(d.split('-')[0])-int(str(dis.patient.patient.dateOfBirth).split('-')[0])
    # print 'ageeeeeeeeeeee',page
    if dis.treatingConsultant.department:
        dep = dis.treatingConsultant.department
    else:
        dep = ''

    if dis.treatingConsultant.mobile:
        docMobile = dis.treatingConsultant.mobile
    else:
        docMobile = ''

    print dep
    print 'advv',dis.advice
    print 'revvvvvvvvvv',dis.reviewOn

    (pname,age,sex,mob,uhid,ipno,tcname,cno,dep,doa,dod,mlc,fir,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20,p21,p22,docname,dt,regno)=(dis.patient.patient.firstName+' '+dis.patient.patient.lastName,dis.patient.patient.age,dis.patient.patient.gender,dis.patient.patient.phoneNo,dis.patient.patient.uniqueId,dis.ipNo,dis.treatingConsultant.name, docMobile ,dep,ad,dd,dis.mlcNo,dis.firNo,dis.provisionalDiagnosis,dis.finalDiagnosis,dis.complaintsAndReason,dis.summIllness,dis.keyFindings,dis.historyOfAlchohol,dis.pastHistory,dis.familyHistory,dis.summaryKeyInvestigation,dis.courseInHospital,dis.patientCondition,dis.advice,dis.reviewOn,dis.complications,dis.treatingConsultant.name,d,dis.treatingConsultant.education)

    p1_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Patient's Name</b></para>",styles['Normal']),
    p1_2=Paragraph("<para  fontSize=11>: {0} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Age </b>: {1} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Sex</b> : {2} &nbsp;</para>".format(pname.upper(),age,sex.capitalize()),styles['Normal'])

    p2_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Telephone No / Mobile No.</b></para>",styles['Normal'])
    p2_2=Paragraph("<para  fontSize=11>: {0} </para>".format(mob),styles['Normal'])

    p3_1= Paragraph("<para fontSize=11 textColor=darkblue><b>UHID : </b></para>",styles['Normal']),
    p3_2=Paragraph("<para  fontSize=11>: {0} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>4.IP No</b>. : {1}</para>".format(uhid,ipno),styles['Normal'])

    p5_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Treating Consultant/s Name<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a. Contact Numbers <br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b. Department/ Specialty </b></para>",styles['Normal']),
    p5_2=Paragraph("<para  fontSize=11>: {0} <br/><br/>: {1} <br/><br/>: {2}</para>".format(tcname,cno,dep),styles['Normal'])

    p6_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Date Of Admission With Time</b></para>",styles['Normal']),
    p6_2=Paragraph("<para  fontSize=11>: {0} </para>".format(doa),styles['Normal'])

    p7_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Date Of Discharge With Time</b></para>",styles['Normal']),
    p7_2=Paragraph("<para  fontSize=11>: {0} </para>".format(dod),styles['Normal'])

    p8_1= Paragraph("<para fontSize=11 textColor=darkblue><b>MLC No.</b></para>",styles['Normal']),
    p8_2=Paragraph("<para  fontSize=11>: {0} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>FIR No.</b> : {1}</para>".format(mlc,fir),styles['Normal'])

    p9_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Provisional Diagnosis<br/>At The Time Of Admission</b></para>",styles['Normal'])
    p9_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p9),styles['Normal'])

    p10_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Final Diagnosis<br/>At The Time Of Discharge</b></para>",styles['Normal'])
    p10_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p10),styles['Normal'])

    p11_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Presenting Complaints With Duration And Reason For Admission</b></para>",styles['Normal'])
    p11_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p11),styles['Normal'])

    p12_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Summary Of Presenting Illness</b></para>",styles['Normal'])
    p12_2=Paragraph("<para  fontSize=11>: {0} </para>".format(p12),styles['Normal'])

    p13_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Key Findings, On Physical Examination At The Time Of Admission</b></para>",styles['Normal'])
    p13_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p13),styles['Normal'])

    p14_1= Paragraph("<para fontSize=11 textColor=darkblue><b>History Of Alcoholism, Tobacco Or Substance Abuse, If Any</b></para>",styles['Normal'])
    p14_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p14),styles['Normal'])

    p15_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Significant Past Medical And Surgical History, If Any</b></para>",styles['Normal'])
    p15_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p15),styles['Normal'])

    p16_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Family History If Significant / Relevent To Diagnosis Or Treatment</b></para>",styles['Normal'])
    p16_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p16),styles['Normal'])

    p17_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Summary Of Key Investigations During Hospitalization</b></para>",styles['Normal'])
    p17_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p17),styles['Normal'])

    p18_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Course In The Hospital Including Complications, If Any</b></para>",styles['Normal'])
    p18_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p18),styles['Normal'])

    p19_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Patient Condition At The Time Of Discharge</b></para>",styles['Normal'])
    p19_2=Paragraph("<para  fontSize=11><br/>: {0} </para>".format(p19),styles['Normal'])

    p20_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Advice On Discharge</b></para>",styles['Normal'])
    p20_2=Paragraph("<para  fontSize=11>: {0} </para>".format(p20),styles['Normal'])

    p21_1= Paragraph("<para fontSize=11 textColor=darkblue><b>Review On</b></para>",styles['Normal'])
    p21_2=Paragraph("<para  fontSize=11>: {0} </para>".format(p21),styles['Normal'])

    p22_1= Paragraph("<para fontSize=11 textColor=darkblue><b>In Case Of Complications Such As</b></para>",styles['Normal'])
    p22_2=Paragraph("<para  fontSize=11>: {0} &nbsp;&nbsp;&nbsp;&nbsp;<b>Contact The Consultant</b></para>".format(p22),styles['Normal'])

    l1=['1.',p1_1,p1_2]
    l2=['2.',p2_1,p2_2]
    l3=['3.',p3_1,p3_2]
    l5=['5.',p5_1,p5_2]
    l6=['6.',p6_1,p6_2]
    l7=['7.',p7_1,p7_2]
    l8=['8.',p8_1,p8_2]
    l9=['9.',p9_1,p9_2]
    l10=['10.',p10_1,p10_2]
    l11=['11.',p11_1,p11_2]
    l12=['12.',p12_1,p12_2]
    l13=['13.',p13_1,p13_2]
    l14=['14.',p14_1,p14_2]
    l15=['15.',p15_1,p15_2]
    l16=['16.',p16_1,p16_2]
    l17=['17.',p17_1,p17_2]
    l18=['18.',p18_1,p18_2]
    l19=['19.',p19_1,p19_2]
    l20=['20.',p20_1,p20_2]
    l21=['21.',p21_1,p21_2]
    l22=['22.',p22_1,p22_2]

    data=[l1,l2,l3,l5,l6,l7,l8,l9,l10,l11,l12,l13,l14,l15,l16,l17,l18,l19,l20,l21,l22]
    rheights=21*[0.3*inch]
    rheights[3]=1.0*inch
    # rheights[4]=1.3*inch
    print len(p11)
    rheights[7]=0.7*inch if len(p9)<130 else (1.4*inch if len(p9)<390 else (2.1*inch if len(p9)<650 else (2.8*inch if len(p9)<910 else (3.5*inch if len(p9)<1170 else (4.2*inch if len(p9)<1330 else (4.9*inch if len(p9)<1600 else 5.2*inch))))))
    rheights[8]=0.7*inch if len(p10)<130 else (1.4*inch if len(p10)<390 else (2.1*inch if len(p10)<650 else (2.8*inch if len(p10)<910 else (3.5*inch if len(p10)<1170 else (4.2*inch if len(p10)<1330 else (4.9*inch if len(p10)<1600 else 5.2*inch))))))
    rheights[9]=0.7*inch if len(p11)<130 else (1.4*inch if len(p11)<390 else (2.1*inch if len(p11)<650 else (2.8*inch if len(p11)<910 else (3.5*inch if len(p11)<1170 else (4.2*inch if len(p11)<1330 else (4.9*inch if len(p11)<1600 else 5.2*inch))))))
    rheights[10]=0.7*inch if len(p12)<130 else (1.4*inch if len(p12)<390 else (2.1*inch if len(p12)<650 else (2.8*inch if len(p12)<910 else (3.5*inch if len(p12)<1170 else (4.2*inch if len(p12)<1330 else (4.9*inch if len(p12)<1600 else 5.2*inch))))))
    rheights[11]=0.7*inch if len(p13)<130 else (1.4*inch if len(p13)<390 else (2.1*inch if len(p13)<650 else (2.8*inch if len(p13)<910 else (3.5*inch if len(p13)<1170 else (4.2*inch if len(p13)<1330 else (4.9*inch if len(p13)<1600 else 5.2*inch))))))
    rheights[12]=0.7*inch if len(p14)<130 else (1.4*inch if len(p14)<390 else (2.1*inch if len(p14)<650 else (2.8*inch if len(p14)<910 else (3.5*inch if len(p14)<1170 else (4.2*inch if len(p14)<1330 else (4.9*inch if len(p14)<1600 else 5.2*inch))))))
    rheights[13]=0.7*inch if len(p15)<130 else (1.4*inch if len(p15)<390 else (2.1*inch if len(p15)<650 else (2.8*inch if len(p15)<910 else (3.5*inch if len(p15)<1170 else (4.2*inch if len(p15)<1330 else (4.9*inch if len(p15)<1600 else 5.2*inch))))))
    rheights[14]=0.7*inch if len(p16)<130 else (1.4*inch if len(p16)<390 else (2.1*inch if len(p16)<650 else (2.8*inch if len(p16)<910 else (3.5*inch if len(p16)<1170 else (4.2*inch if len(p16)<1330 else (4.9*inch if len(p16)<1600 else 5.2*inch))))))
    rheights[15]=0.8*inch if len(p17)<130 else (1.4*inch if len(p17)<390 else (2.1*inch if len(p17)<650 else (2.8*inch if len(p17)<910 else (3.5*inch if len(p17)<1170 else (4.2*inch if len(p17)<1330 else (4.9*inch if len(p17)<1600 else 5.2*inch))))))
    rheights[16]=0.7*inch if len(p18)<130 else (1.4*inch if len(p18)<390 else (2.1*inch if len(p18)<650 else (2.8*inch if len(p18)<910 else (3.5*inch if len(p18)<1170 else (4.2*inch if len(p18)<1330 else (4.9*inch if len(p18)<1600 else 5.2*inch))))))
    rheights[17]=0.7*inch if len(p19)<130 else (1.4*inch if len(p19)<390 else (2.1*inch if len(p19)<650 else (2.8*inch if len(p19)<910 else (3.5*inch if len(p19)<1170 else (4.2*inch if len(p19)<1330 else (4.9*inch if len(p19)<1600 else 5.2*inch))))))
    rheights[18]=0.7*inch if len(p20)<130 else (1.4*inch if len(p20)<390 else (2.1*inch if len(p20)<650 else (2.8*inch if len(p20)<910 else (3.5*inch if len(p20)<1170 else (4.2*inch if len(p20)<1330 else (4.9*inch if len(p20)<1600 else 5.2*inch))))))
    rheights[19]=0.7*inch if len(p21)<130 else (1.4*inch if len(p21)<390 else (2.1*inch if len(p21)<650 else (2.8*inch if len(p21)<910 else (3.5*inch if len(p21)<1170 else (4.2*inch if len(p21)<1330 else (4.9*inch if len(p21)<1600 else 5.2*inch))))))
    rheights[20]=0.7*inch if len(p22)<130 else (1.4*inch if len(p22)<390 else (2.1*inch if len(p22)<650 else (2.8*inch if len(p22)<910 else (3.5*inch if len(p22)<1170 else (4.2*inch if len(p22)<1330 else (4.9*inch if len(p22)<1600 else 5.2*inch))))))
    print 'hhhhhhhhhhhhhhhh',rheights[9],rheights[17],len(p19)
    # rheights=[0.3*inch,0.3*inch,0.3*inch,1*inch,0.3*inch,0.3*inch,0.3*inch,0.5*inch,0.5*inch,0.4*inch if len(a)<200 else 1.2*inch,0.8*inch,1.2*inch,1*inch,1*inch,1*inch,1*inch,1.7*inch,1*inch,1.5*inch,0.8*inch,0.6*inch,]
    cwidths=[0.25*inch , 2.4*inch , 5.5*inch]
    t2=Table(data,rowHeights=rheights,colWidths=cwidths)
    t2.setStyle(TableStyle([('FONTSIZE', (0, 0), (-1, -1), 8),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),darkblue),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'TOP'),]))
    elements.append(t2)

    elements.append(Spacer(1,6))
    print docname,dt,mob,pname
    data3 = [['Treating Consultant /\nAuthorized Team Doctor','Name',docname.upper(),''],['','Signature','',''],['Date&Time : '+dt,'Reg. No.: ',regno,'Contact No. : '+str(docMobile)],['Patient / Attendant','Name',pname.upper(),''],['','Signature','',''],]
    rheights=5*[0.3*inch]
    cwidths=[2.2*inch , 0.7*inch , 2.8*inch , 2*inch]
    t3=Table(data3,rowHeights=rheights,colWidths=cwidths)
    t3.setStyle(TableStyle([('SPAN',(2,0),(3,0)),('SPAN',(2,1),(3,1)),('SPAN',(2,3),(3,3)),('SPAN',(2,4),(3,4)),('SPAN',(0,0),(0,1)),('SPAN',(0,3),(0,4)),('FONTSIZE', (0, 0), (-1, -1), 9),('TEXTFONT', (0, 0), (-1, -1), 'Times-Bold'),('TEXTCOLOR',(0,0),(-1,-1),darkblue),('ALIGN',(0,0),(-1,-1),'LEFT'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('GRID',(0,0),(-1,-1),1,darkblue),]))
    elements.append(t3)

    elements.append(Spacer(1,8))

    elements.append(Paragraph("<para fontSize=11  leftIndent=10><b>In Case Of Emergency - Contact No. of The Hospital (Casualty : 7022161297)</b></para>",styles['Normal']))

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

class DischargeSummarys(APIView):
    def get(self , request , format = None):
        print 'dischargeeeeeeeeeee'
        print request.GET['pPk']
        dis = DischargeSummary.objects.get(pk = request.GET['pPk'])
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="dischargeSummery.pdf"'
        dischargeSummary(response,dis)
        return response
