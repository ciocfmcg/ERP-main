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
from django.db.models import Min , Sum , Avg , Q
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
from django.db.models import F ,Value,CharField,Prefetch

def ecommerceHome(request):
    return render(request , 'ngEcommerce.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN})

class SearchProductAPI(APIView):
    renderer_classes = (JSONRenderer,)
    # permission_classes = (permissions.IsAuthenticated ,)
    def get(self , request , format = None):
        if 'search' in self.request.GET:
            search = str(self.request.GET['search'])
            l = int(self.request.GET['limit'])
            print l , type(l)
            genericProd = list(genericProduct.objects.filter(name__icontains=search).values('pk','name').annotate(typ= Value('generic',output_field=CharField())))
            listProd = list(listing.objects.filter(product__name__icontains=search).values('pk').annotate(name=F('product__name') , typ= Value('list',output_field=CharField())))
            tosend = genericProd + listProd
            print tosend[0:l]
            return Response(tosend[0:l], status = status.HTTP_200_OK)


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
    filter_fields = ['name','parent']

class mediaViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdminOrReadOnly , )
    queryset = media.objects.all()
    serializer_class = mediaSerializer


def getProducts(lst , node):
    lst = lst | listing.objects.filter(parentType = node)
    for child in node.children.all():
        lst = getProducts(lst , child)
    return lst

class listingViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = listingSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['parentType']

    def get_queryset(self):

        if 'recursive' in self.request.GET:
            if self.request.GET['recursive'] == '1':
                prnt = genericProduct.objects.get(id = self.request.GET['parent'])
                toReturn = listing.objects.filter(parentType = prnt)
                for child in prnt.children.all():
                    toReturn = getProducts(toReturn , child)

                if 'minPrice' in self.request.GET:
                    minPrice = self.request.GET['minPrice']
                    maxPrice = self.request.GET['maxPrice']
                    toReturn = toReturn.filter(product__price__lte = maxPrice , product__price__gte = minPrice)

                if 'city' in self.request.GET:
                    cities = self.request.GET.getlist('city')
                    cL = len(cities)
                    for idx,c in enumerate(cities):
                        if idx == 0:
                            qry = Q(specifications__icontains = '"name":"place","value":"'+ cities[idx])
                        else:
                            qry = qry | Q(specifications__icontains = '"name":"place","value":"'+ cities[idx])

                    toReturn = toReturn.filter(qry)

                return toReturn
        else:
            return listing.objects.all()

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

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly , )
    serializer_class = CartSerializer
    queryset = Cart.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user','typ']
