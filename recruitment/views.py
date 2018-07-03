
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
from rest_framework.views import APIView
# Create your views here.


class JobsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = JobsSerializer
    queryset = Jobs.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['jobtype','status']

class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = JobApplicationSerializer
    queryset = JobApplication.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['job',]

class JobsList(APIView):
    permission_classes = (permissions.AllowAny, )
    def get(self , request , format = None):
        print 'ccccccccccccccccccccc'
        print request.GET
        if 'status' in request.GET:
            querySet = Jobs.objects.filter(status = str(request.GET['status']))
        else:
            querySet = Jobs.objects.all()
        toReturn = list(querySet.values('pk','jobtype','department__dept_name','skill','maximumCTC','unit__name','role__name'))
        print toReturn

        return Response(toReturn )
