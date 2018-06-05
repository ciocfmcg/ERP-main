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
from .models import *
from API.permissions import *
from django.db.models import Q
from django.http import HttpResponse
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from openpyxl import load_workbook
from io import BytesIO,StringIO
import csv

# Create your views here.

class ContactsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = ContactsSerializer
    queryset = Contacts.objects.all()


class BulkContactsAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated , isAdmin)
    def post(self, request, format=None):

        print 'ttttttttttt',request.FILES['fil'],request.POST['source']
        fil = StringIO(request.FILES['fil'].read().decode('utf-8'))
        reader = csv.reader(fil, delimiter=':')
        count = 0
        for row in reader:
            dat = row[0].split(',')
            print 'aaaaaaaaaaaaa',dat
            check = Contacts.objects.filter(Q(email=dat[2]) | Q(mobile=dat[3]))
            if len(check)>0:
                continue
            else:
                contactData = {"name" : dat[1] ,  "email" : dat[2] ,"mobile" : dat[3] ,"referenceId" : dat[0] , "source" : str(request.POST['source'])}
                Contacts.objects.create(**contactData)
                count += 1


        return Response({"count" : count}, status = status.HTTP_200_OK)
