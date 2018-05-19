# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *

# Create your views here.

class AssetsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = AssetsSerializer
    queryset = Asset.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class CheckinViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = CheckinSerializer
    queryset = Checkin.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['asset']

class AllotmentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = AllotmentSerializer
    queryset = Allotment.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['asset','to','returned','serialNo']

class CheckoutViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = CheckoutSerializer
    queryset = Checkout.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['sentTo']
