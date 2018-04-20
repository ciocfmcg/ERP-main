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

class UnitLiteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, readOnly)

    serializer_class = UnitLiteSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' , 'parents', 'division']

class UnitFullViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, readOnly)
    queryset = Unit.objects.all()
    serializer_class = UnitFullSerializer

class UnitSuperliteViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, readOnly)
    serializer_class = UnitSuperLiteSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' , 'division']
    queryset = Unit.objects.all()


class UnitViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = UnitSerializer
    queryset = Unit.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name','division']

class FirstLevelUnitViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = UnitLiteSerializer
    queryset = Unit.objects.filter(parent=None)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['division']

class DepartmentsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = DepartmentsSerializer
    queryset = Departments.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['dept_name']

class RoleViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
