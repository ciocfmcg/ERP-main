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
from reportlab import *
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Table, TableStyle, Image
from PIL import Image
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet

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
from django.db.models import F ,Value

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN})

class SearchProductAPI(APIView):
    renderer_classes = (JSONRenderer,)
    # permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        search = str(self.request.GET['search'])
        genericProd = list(genericProduct.objects.filter(name__icontains=search).values('pk','name'))
        listProd = list(listing.objects.filter(product__name__icontains=search).values('pk').annotate(name=F('product__name')))
        tosend = genericProd + listProd
        return Response(tosend, status = status.HTTP_200_OK)

class fieldViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    queryset = field.objects.all()
    serializer_class = fieldSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class genericProductViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = genericProduct.objects.all()
    serializer_class = genericProductSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class mediaViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = media.objects.all()
    serializer_class = mediaSerializer

class listingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = listingSerializer
    queryset = listing.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

    def list(self , request, *args, **kwargs):
        u = self.request.user
        if 'lat' in self.request.GET and 'lon' in self.request.GET:
            da = [] # distance array
            sa = service.objects.all() # service array
            for s in sa:
                p1 = {'lat' : s.address.lat , 'lon' : s.address.lon}
                p2 = {'lat' : self.request.GET['lat'] , 'lon' : self.request.GET['lon'] }
                d = geoDistance(p1 , p2)
                if d<30000:
                    da.append(d)
            la = list() # listings array
            for k in sorted(range(len(da)), key=lambda k: da[k]):
                for l in listing.objects.filter(providerOptions__in = offering.objects.filter(service = sa[k])):
                    if l not in la:
                        la.append(l)
            serializer = listingSerializer(la , many = True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'vendor':
                s = service.objects.get(user = u)
                items = offering.objects.filter( service = s).values_list('item' , flat = True)
                la = listing.objects.exclude(pk__in = items)
        else:
            la = listing.objects.all()
        serializer = listingSerializer(la , many = True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class listingLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly, )
    serializer_class = listingLiteSerializer

    def get_queryset(self):
        # u = self.request.user
        # has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        if 'mode' in  self.request.GET:
            if self.request.GET['mode'] == 'vendor':
                s = service.objects.get(user = u)
                items = offering.objects.filter( service = s).values_list('item' , flat = True)
                return listing.objects.exclude(pk__in = items)
            elif self.request.GET['mode'] == 'suggest':
                return listing.objects.all()[:5]
        else:
            return listing.objects.all()

class CategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class offerBannerViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly, )
    serializer_class = offerBannerSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']
    def get_queryset(self):
        return offerBanner.objects.all()
        # return offerBanner.objects.filter(active = True)
