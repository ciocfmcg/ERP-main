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
from django.db.models import Min , Sum , Avg
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

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
# from scripts.knnocr.captchaSolver import main as toolFn
# from scripts.pdfReader.main import processDoc as toolFn
# Create your views here.
# from scripts.kpmgPDFExtract.kpmgMain import main as kpmg
from shutil import copyfile

class kpmgAuditApi(APIView):

    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def get(self , request , format = None):
        # user = self.request.user
        # print request.FILES
        # pdfFile = request.FILES['file']
        # print pdfFile, pdfFile.size
        # res = toolFn(imgFile)
        pth = os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'kpmgPDFExtract')
        kpmg(pth)
        copyfile(os.path.join(pth , 'destination.pdf') , os.path.join(globalSettings.BASE_DIR , 'media_root', 'kpmg', 'destination.pdf'))
        content = {'fileLink': '/media/kpmg/destination.pdf'}
        return Response(content, status=status.HTTP_200_OK)


class KNNOcrApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        print request.FILES
        imgFile = request.FILES['file']
        print imgFile, imgFile.size
        # res = toolFn(imgFile)
        content = {'keyname': 234}
        return Response(content, status=status.HTTP_200_OK)


class PDFReaderApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        pdfFile = request.FILES['pdffile']
        pageNo = int(request.data['pageNo'])
        # res = toolFn(os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'pdfReader', 'pdfFile.pdf'), 9)
        res = toolFn(pdfFile.read(), pageNo)
        return Response(res, status=status.HTTP_200_OK)


class NLPParser(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        line = request.data['line']
        from scripts.kpmgPDFExtract.nlpEngine import parseLine
        # res = toolFn(os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'pdfReader', 'pdfFile.pdf'), 9)
        datafields , words,percents, durations , persons , miscs , locations, cleanedTags, dates, money = parseLine(line)
        res = {'percents': percents , 'persons' : persons , 'locations' : locations ,'dates':dates, 'money' : money}
        return Response(res, status=status.HTTP_200_OK)

class NLPParserRelation(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        line = request.data['line']
        from scripts.kpmgPDFExtract.nlpEngine import getYearRelatedValues
        # res = toolFn(os.path.join(globalSettings.BASE_DIR , 'tools', 'scripts', 'pdfReader', 'pdfFile.pdf'), 9)
        res = getYearRelatedValues(line)
        return Response(res, status=status.HTTP_200_OK)




class FileCacheViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isOwner, )
    serializer_class = FileCacheSerializer
    def get_queryset(self):
        qs = FileCache.objects.filter(user = self.request.user)
        return qs

class ApiAccountViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isOwner, )
    serializer_class = ApiAccountSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['email']
    def get_queryset(self):
        qs = ApiAccount.objects.filter(user = self.request.user)
        return qs

class ApiAccountLogViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, permissions.IsAuthenticatedOrReadOnly,isAdmin,)
    serializer_class = ApiAccountLogSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['account', 'refID']
    def get_queryset(self):
        qs = ApiAccountLog.objects.filter(actor = self.request.user).order_by('-updated')
        return qs
