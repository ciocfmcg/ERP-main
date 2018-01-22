# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from rest_framework import viewsets , permissions , serializers
from API.permissions import *
from .models import *
from .serializers import *


class ServiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ServiceSerializer
    queryset = Service.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class ContactViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ContactSerializer
    queryset = Contact.objects.all()

class ContractViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = ContractSerializer
    queryset = Contract.objects.all()
