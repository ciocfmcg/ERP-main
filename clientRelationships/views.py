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
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
# Create your views here.

class ContactLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner , )
    serializer_class = ContactLiteSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name', 'company' , 'mobile', 'email']
    def get_queryset(self):
        return Contact.objects.all()

class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner , )
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        return Contact.objects.all()

class DealViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner , )
    serializer_class = DealSerializer
    def get_queryset(self):
        return Deal.objects.all()

class ContractViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner , )
    serializer_class = ContractSerializer
    def get_queryset(self):
        return Contract.objects.all()

class ActivityViewSet(viewsets.ModelViewSet):
    permission_classes = (isOwner , )
    serializer_class = ActivitySerializer
    def get_queryset(self):
        return Activity.objects.all()
