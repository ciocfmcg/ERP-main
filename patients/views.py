from __future__ import unicode_literals
from django.shortcuts import render
from rest_framework import viewsets, permissions, serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *

from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors, utils
from reportlab.platypus import Paragraph, Table, TableStyle, Image, Frame, Spacer, PageBreak, BaseDocTemplate, PageTemplate, SimpleDocTemplate, Flowable
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet, TA_CENTER
from reportlab.graphics import barcode, renderPDF
from reportlab.graphics.shapes import *
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.lib.pagesizes import letter, A5, A4, A3
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import *
from reportlab.lib.units import inch, cm
from reportlab.lib.enums import TA_JUSTIFY
import datetime
import time
import calendar
from forex_python.converter import CurrencyCodes

from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.views import APIView
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


def invoice(response):
    print '999999999999999999999999999999999999999'
    # now = datetime.datetime.now()
    # monthdays=calendar.monthrange(now.year, now.month)[1]
    # currencyType='INR'
    # s=CurrencyCodes().get_symbol(currencyType) # currencysymbol
    # if currencyType == 'INR':
    #     s='Rs.'
    # absent=3
    # daysPresent=monthdays-absent
    # paidHolidays=1
    # accountNumber=paySlip.accountNumber
    #
    # print '99999999999999',paySlip.joiningDate.year
    # print paySlip.joiningDate.year,userObj.pk
    # print str(paySlip.joiningDate.year)+str(userObj.pk)
    #
    #
    # (empCode,name,location,department,grade,designation,pfNo,escisNo,pan,sbs)=(str(paySlip.joiningDate.year)+str(userObj.pk) ,userObj.first_name+' '+userObj.last_name,'Bangalore','Software','A','Software developer','','','',paySlip.basic)
    # (days,ml,al,cl,adHocLeaves,balanceSL,balanceCL,balanceCO)=(daysPresent+paidHolidays,paySlip.ml,paySlip.al,0,paySlip.adHocLeaves,0,0,0)
    # # (basicSalary,hra,cn,cr,mr,oe)=(sbs,50000,40000,0,40000,0)
    # (basic,hra,special,lta,adHoc,amount)=(paySlip.basic,paySlip.hra,paySlip.special,paySlip.lta,paySlip.adHoc,paySlip.amount)
    # (spf,pdf,iol,od)=(10000,50000,0,0)
    # totalEarnings,deductions=(0,0)
    # # for i in (basicSalary,hra,cn,cr,oe):
    # for i in (basic,hra,special,lta,adHoc,amount):
    #     totalEarnings+=i
    # for i in (spf,pdf,iol,od):
    #     deductions+=i
    # netpay=totalEarnings-deductions
    #
    # styles = getSampleStyleSheet()
    # styledict={'center':ParagraphStyle(name='center', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)}
    # doc = SimpleDocTemplate(response,pagesize=A3, topMargin=1*cm,)
    # doc.request = request
    # # container for the 'Flowable' objects
    # elements = []
    #
    # a=[Paragraph("<para fontSize=25 alignment='Left' textColor=#6375d4><strong>CIOC</strong></para>",styles['Normal']),
    #    Paragraph("<b>CIOC FMCG Pvt ltd.</b><br/>",styledict['center']),
    #    Paragraph("<para fontSize=7 alignment='center'>4th Floor,Venkateshwara Heritage,Kudlu Hosa Road,opp Sai Purna Premium Apartment,Sai Meadows,Kudlu,Bengaluru,Karnataka-560068<br/> <b>www.cioc.co.in</b> </para>",styles['Normal']),
    #    Paragraph("<para fontSize=8 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(calendar.month_name[now.month],now.year),styles['Normal'])
    #    ]
    # p1=Paragraph("<para fontSize=8><strong>Bank Details : </strong>Salary Has Been Credited To {0},ICICI Bank LTD.".format(accountNumber),styles['Normal'])
    #
    # data=[[a,'','',''],['','','',''],['Emp Code : %s'%(empCode),'Name : %s'%(name),'',''],['Location : %s'%(location),'Department :%s'%(department),'Grade : %s'%(grade),'Designation : %s'%(designation)],
    #       ['PF No : %s'%(pfNo),'ESIC No : %s'%(escisNo),'PAN : %s'%(pan),'Standard Basic Salary : %s %d'%(s,sbs)],['Days Paid : %d'%(days),'Days Present : %d'%(daysPresent),'Paid Holidays : %d'%(paidHolidays),'Lwp/Absent : %d'%(absent)],
    #       ['Sick Leaves : %d'%(ml),'Annual Leaves : %d'%(al),'Compensatory Leaves : %d'%(cl),'AdHoc Leaves : %d'%(adHocLeaves)],['Balance SL : %d'%(balanceSL),'Balance CL : %d'%(balanceCL),'Balance CO : %d'%(balanceCO),''],['Earnings','Amount','Deductions','Amount'],
    #       ['Basic Salary' ,s+' '+str(basic),'Saturatory Provident Fund',s+' '+str(spf)],['HRA',s+' '+str(hra),'Professional Tax Deduction',s+' '+str(pdf)],['Conveyance',s+' '+str(special),'Interest On Loan',s+' '+str(iol)],['Conveyance Reimbursement',s+' '+str(lta),'Other Deduction ',s+' '+str(od)],['Medical Reimbursement',s+' '+str(adHoc),'',''],['Other Earnings',s+' '+str(amount),'',''],
    #       ['Total Earnings ',s+' '+str(totalEarnings),'Total Deduction',s+' '+str(deductions)],['','','','Net Pay : %s %d'%(s,netpay)],[p1,'','',''],]
    #
    # lines=[('LINEBELOW',(0,1),(-1,1),0.5,black),('LINEBELOW',(0,4),(-1,4),0.5,black),('LINEBELOW',(0,7),(-1,7),0.5,black),('LINEBELOW',(0,8),(-1,8),0.5,black),
    #        ('LINEBELOW',(0,14),(-1,14),0.5,black),('LINEBELOW',(0,15),(-1,15),0.5,black),('LINEBELOW',(0,16),(-1,16),0.5,black),('LINEBEFORE',(2,8),(2,16),0.5,black)]
    # spans=[('SPAN',(0,0),(-1,1)),('SPAN',(1,2),(-1,2)),('SPAN',(0,-1),(-1,-1))]
    # aligns=[('ALIGN',(1,8),(1,15),'RIGHT'),('ALIGN',(-1,8),(-1,16),'RIGHT')]
    # rheights=18*[0.3*inch]
    # rheights[1]=0.5*inch
    # t1=Table(data,rowHeights=rheights)
    # t1.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 0.75, black),]+lines+spans+aligns))
    # elements.append(t1)
    # doc.build(elements)

    # doc = SimpleDocTemplate("form_letter.pdf", pagesize=letter,
    #                         rightMargin=72, leftMargin=72,
    #                         topMargin=72, bottomMargin=18)
    #
    #
    # Story = []
    # # logo = "python_logo.png"
    # magName = "Pythonista"
    # issueNum = 12
    # subPrice = "99.00"
    # limitedDate = "03/05/2010"
    # freeGift = "tin foil hat"
    #
    # formatted_time = time.ctime()
    # full_name = "Mike Driscoll"
    # address_parts = ["411 State St.", "Marshalltown, IA 50158"]
    #
    # # im = Image(logo, 2 * inch, 2 * inch)
    # # Story.append(im)
    #
    # styles = getSampleStyleSheet()
    # styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY))
    # ptext = '<font size=12>%s</font>' % formatted_time
    #
    # Story.append(Paragraph(ptext, styles["Normal"]))
    # Story.append(Spacer(1, 12))
    #
    # # Create return address
    # ptext = '<font size=12>%s</font>' % full_name
    # Story.append(Paragraph(ptext, styles["Normal"]))
    # for part in address_parts:
    #     ptext = '<font size=12>%s</font>' % part.strip()
    #     Story.append(Paragraph(ptext, styles["Normal"]))
    #
    # Story.append(Spacer(1, 12))
    # ptext = '<font size=12>Dear %s:</font>' % full_name.split()[0].strip()
    # Story.append(Paragraph(ptext, styles["Normal"]))
    # Story.append(Spacer(1, 12))
    #
    # ptext = '<font size=12>We would like to welcome you to our subscriber base for %s Magazine! \
    #         You will receive %s issues at the excellent introductory price of $%s. Please respond by\
    #         %s to start receiving your subscription and get the following free gift: %s.</font>' % (magName,
    #                                                                                                 issueNum,
    #                                                                                                 subPrice,
    #                                                                                                 limitedDate,
    #                                                                                                 freeGift)
    # Story.append(Paragraph(ptext, styles["Justify"]))
    # Story.append(Spacer(1, 12))
    #
    #
    # ptext = '<font size=12>Thank you very much and we look forward to serving you.</font>'
    # Story.append(Paragraph(ptext, styles["Justify"]))
    # Story.append(Spacer(1, 12))
    # ptext = '<font size=12>Sincerely,</font>'
    # Story.append(Paragraph(ptext, styles["Normal"]))
    # Story.append(Spacer(1, 48))
    # ptext = '<font size=12>Ima Sucker</font>'
    # Story.append(Paragraph(ptext, styles["Normal"]))
    # Story.append(Spacer(1, 12))
    # doc.build(Story)
    now = datetime.datetime.now()
    monthdays=calendar.monthrange(now.year, now.month)[1]
    currencyType='INR'
    s=CurrencyCodes().get_symbol(currencyType) # currencysymbol
    if currencyType == 'INR':
        s='Rs.'
    absent=3
    daysPresent=monthdays-absent
    paidHolidays=1
    accountnumber=7341
    (empCode,name,location,department,grade,designation,pfNo,escisNo,pan,sbs)=('E1002','Saikiran pothuri','Bangalore','Software','A','Software developer','','','',10000)
    (daysPaid,sickleaves,casualleaves,cl,pl,balanceSL,balanceCL,balanceCO)=(daysPresent+paidHolidays,1,0,0,0,0,0,0)
    (basicSalary,hra,cn,cr,mr,oe)=(sbs,4000,2000,0,0,0)
    (spf,pdf,iol,od)=(1000,500,0,0)
    totalEarnings,deductions=(0,0)
    for i in (basicSalary,hra,cn,cr,oe):
        totalEarnings+=i
    for i in (spf,pdf,iol,od):
        deductions+=i
    netpay=totalEarnings-deductions


    styles = getSampleStyleSheet()
    styledict={'center':ParagraphStyle(name='center', parent=styles['Normal'], alignment=TA_CENTER, fontSize=10)}
    doc = SimpleDocTemplate("finalpayslip.pdf",pagesize=A4, topMargin=1*cm,)
    # container for the 'Flowable' objects
    elements = []

    a=[Paragraph("<para fontSize=35 alignment='Left' textColor=skyblue><strong>CIOC</strong></para>",styles['Normal']),
       Paragraph("<b>CIOC FMCG Pvt Ltd</b><br/>",styledict['center']),
       Paragraph("<para fontSize=7 alignment='center'>G-162, Splendid Times Square, Pattandur Agrahara, Behind Brigade Tech Park, Whitefield Bangalore - 560066. <br/> <b>www.cioc.co.in</b> </para>",styles['Normal']),
       Paragraph("<para fontSize=8 alignment='center'><strong>Employee PaySlip For Month Of {0} {1} </strong></para>".format(calendar.month_name[now.month],now.year),styles['Normal'])
       ]
    p1=Paragraph("<para fontSize=8><strong>Bank Details : </strong>Salary Has Been Credited To {0},ICICI Bank LTD.".format(accountnumber),styles['Normal'])

    data=[[a,'','',''],['','','',''],['Emp Code : %s'%(empCode),'Name : %s'%(name),'',''],['Location : %s'%(location),'Department :%s'%(department),'Grade : %s'%(grade),'Designation : %s'%(designation)],
          ['PF No : %s'%(pfNo),'ESIC No : %s'%(escisNo),'PAN : %s'%(pan),'Standard Basic Salary : %s %d'%(s,sbs)],['Days Paid : %d'%(daysPaid),'Days Present : %d'%(daysPresent),'Paid Holidays : %d'%(paidHolidays),'Lwp/Absent : %d'%(absent)],
          ['Sick Leaves : %d'%(sickleaves),'Casual Leaves : %d'%(casualleaves),'Compensatory Leaves : %d'%(cl),'Priviledge Leaves : %d'%(pl)],['Balance SL : %d'%(balanceSL),'Balance CL : %d'%(balanceCL),'Balance CO : %d'%(balanceCO),''],['Earnings','Amount','Deductions','Amount'],
          ['Basic Salary' ,s+' '+str(basicSalary),'Saturatory Provident Fund',s+' '+str(spf)],['HRA',s+' '+str(hra),'Professional Tax Deduction',s+' '+str(pdf)],['Conveyance',s+' '+str(cn),'Interest On Loan',s+' '+str(iol)],['Conveyance Reimbursement',s+' '+str(cr),'Other Deduction ',s+' '+str(od)],['Medical Reimbursement',s+' '+str(mr),'',''],['Other Earninga',s+' '+str(oe),'',''],
          ['Total Earnings ',s+' '+str(totalEarnings),'Total Deduction',s+' '+str(deductions)],['','','','Net Pay : %s %d'%(s,netpay)],[p1,'','',''],]

    lines=[('LINEBELOW',(0,1),(-1,1),0.5,black),('LINEBELOW',(0,4),(-1,4),0.5,black),('LINEBELOW',(0,7),(-1,7),0.5,black),('LINEBELOW',(0,8),(-1,8),0.5,black),
           ('LINEBELOW',(0,14),(-1,14),0.5,black),('LINEBELOW',(0,15),(-1,15),0.5,black),('LINEBELOW',(0,16),(-1,16),0.5,black),('LINEBEFORE',(2,8),(2,16),0.5,black)]
    spans=[('SPAN',(0,0),(-1,1)),('SPAN',(1,2),(-1,2)),('SPAN',(0,-1),(-1,-1))]
    aligns=[('ALIGN',(1,8),(1,15),'RIGHT'),('ALIGN',(-1,8),(-1,16),'RIGHT')]
    rheights=18*[0.3*inch]
    rheights[1]=0.5*inch
    t1=Table(data,rowHeights=rheights)
    t1.setStyle(TableStyle([('BOX', (0,0), (-1,-1), 0.75, black),]+lines+spans+aligns))
    elements.append(t1)
    doc.build(elements)


class InvoiceSlip(APIView):
    def get(self , request , format = None):
        print 'enterrrrrrrrrrrrrrrrrr'

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment;filename="invoice.pdf"'
        invoice(response)
        return response
