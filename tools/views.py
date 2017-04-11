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
# from scripts.knnocr.captchaSolver import main as toolFn
# from scripts.pdfReader.main import processDoc as toolFn
# Create your views here.

class KNNOcrApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)

    def post(self , request , format = None):
        user = self.request.user
        imgFile = request.FILES['screenshot']
        res = toolFn(imgFile)
        content = {'keyname': res[0]}
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
