from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from django.db.models import Q
from django.http import HttpResponse
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from ERP.models import service
# Create your views here.
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


from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template

# from xhtml2pdf import pisa


class GenerateQuote(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny, )
    def post(self , request , format = None):
        template_src = 'quote.html'
        template = get_template(template_src)

        ids = []
        qtys = request.data['qty'].split(',')
        pList = []

        for i in request.data['products'].split(','):
            if not len(i)==0:
                pList.append(Product.objects.get(serial= int(i)))

        tot = 0
        qTot = 0
        for i , pi in enumerate(pList):
            pi.qty = qtys[i]
            pi.subTotal = int(pi.qty)*pi.rate
            qTot += int(pi.qty)
            tot += pi.subTotal

        html  = template.render({'products' : pList , 'total' : tot , 'qTot' : qTot})
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("ISO-8859-1")), result)
        f = open('testfile.pdf','w')
        f.write(result.getvalue())
        f.close()
        return Response({'OK' , 'OK'}, status=status.HTTP_200_OK)


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['serial']
    def get_queryset(self):
        return Product.objects.all()



class TicketViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' , 'description' , 'ticketID']
    def get_queryset(self):
        return Ticket.objects.all()
