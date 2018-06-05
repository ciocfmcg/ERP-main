# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import datetime
import json
import pytz
from .models import *
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import datetime
import json
import pytz
import requests
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
# from openpyxl import load_workbook
from io import BytesIO
import re
from rest_framework import filters
from django.db.models import Q

# Create your views here.

class TimeSheetViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = TimeSheetSerializer
    queryset = TimeSheet.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['date','status' ,'user']
    # def get_queryset(self):
    #     return TimeSheet.objects.filter(Q(status='submitted') | Q(status='approved'))

class TimeSheetItemViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = TimeSheetItemSerializer
    queryset = TimeSheetItem.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parent' ]
