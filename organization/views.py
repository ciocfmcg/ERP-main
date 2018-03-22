# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
# Create your views here.


class DivisionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = DivisionSerializer
    queryset = Division.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class UnitsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = UnitsSerializer
    queryset = Units.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name','division']

class DepartmentsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = DepartmentsSerializer
    queryset = Departments.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['dept_name']

class RolesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = RolesSerializer
    queryset = Roles.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
