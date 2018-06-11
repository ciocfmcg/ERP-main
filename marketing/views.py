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
from django.db.models import Case, IntegerField, Sum, When
import json
import operator
from excel_response import ExcelResponse
from .serializers import campaigncontactsList
# Create your views here.

class TagViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = TagSerializer
    # queryset = Tag.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name',]
    def get_queryset(self):
        print self.request.GET
        if 'fetch' in self.request.GET:
            return Tag.objects.filter(name = self.request.GET['name'])
        else:
            return Tag.objects.all()
class CampaignViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = CampaignSerializer
    queryset = Campaign.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name',]

class CampaignLogsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = CampaignLogsSerializer
    queryset = CampaignLogs.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user', 'contact' , 'campaign']

class LeadsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = LeadsSerializer    
    def get_queryset(self):
        print self.request.GET
        leadsList = CampaignLogs.objects.filter(typ = 'converted').values_list('contact',flat=True)
        print leadsList
        print Contacts.objects.filter(pk__in = list(leadsList))
        return Contacts.objects.filter(pk__in = list(leadsList))

class ContactsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    serializer_class = ContactsSerializer
    queryset = Contacts.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name','source']

    # def get_queryset(self):
    #     if 'fd' in self.request.GET:
    #         if len(self.request.GET['fd']) > 0:
    #             print self.request.GET,'777777777'
    #             fromDate = self.request.GET['fd'].split('-')
    #             toDate = self.request.GET['td'].split('-')
    #             fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
    #             td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
    #             fromDate = fd + relativedelta(days=1)
    #             toDate = td + relativedelta(days=1)
    #             print Contacts.objects.filter(created__range=(str(fromDate),str(toDate)),source__contains = str(self.request.GET['source__contains']))
    #             return Contacts.objects.filter(created__range=(str(fromDate),str(toDate)),source__contains = str(self.request.GET['source__contains']))
    #         else:
    #             print Contacts.objects.filter(source__contains = str(self.request.GET['source__contains'])).values_list('source', flat=True).distinct()
    #             return Contacts.objects.filter(source__contains = str(self.request.GET['source__contains']))
    #     else:
    #         return Contacts.objects.all()




class BulkContactsAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated , isAdmin)
    def post(self, request, format=None):

        print 'ttttttttttt',request.FILES['fil'],request.POST['source'],
        if 'tags' in request.POST:
            print request.POST['tags']
            for i in request.POST['tags'].split(','):
                print i
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
                if len(dat) >4:
                    contactData['pinCode'] = dat[4]
                cObj = Contacts.objects.create(**contactData)
                if 'tags' in request.POST:
                    for i in request.POST['tags'].split(','):
                        cObj.tags.add(Tag.objects.get(pk = int(i)))
                count += 1


        return Response({"count" : count}, status = status.HTTP_200_OK)

class ContactsScrapedAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):

        print 'ttttttttttt',request.POST
        count = 0
        check = Contacts.objects.filter(mobile=str(request.POST['mobile']))
        if len(check)>0:
            pass
        else:
            contactData = {"name" : str(request.POST['name']) , "mobile" : str(request.POST['mobile']) ,"source" : str(request.POST['source']) , "pinCode" : str(request.POST['pincode'])}
            print contactData
            cObj = Contacts.objects.create(**contactData)
            tgObj,created = Tag.objects.get_or_create(name=str(request.POST['tag']))
            cObj.tags.add(tgObj)
            count += 1
        print count

        return Response({"count" : count}, status = status.HTTP_200_OK)

class SourceSuggestAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request, format=None):

        print 'ttttttttttt',request.data

        if len(request.data['fd']) > 0:
            # duplicates = Contacts.objects.values('source').order_by().annotate(max_id=models.Max('id'),count_id=models.Count('id')).filter(source__contains=str(request.data['source']))
            # duplicates = Contacts.objects.filter(source__contains=str(request.data['source'])).values_list('source',flat=True).distinct()
            # ab = Contacts.objects.filter(created__range=(str(fromDate),str(toDate)),source__in=list(duplicates)).values('source').annotate(sourceCount=models.Count('source'))
            # print duplicates
            fromDate = request.data['fd'].split('-')
            toDate = request.data['td'].split('-')
            fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
            td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
            print fd,td
            # fromDate = fd + relativedelta(days=1)
            # toDate = td + relativedelta(days=1)
            if 'fetch' in request.data:
                duplicates = Contacts.objects.filter(source=str(request.data['source'])).values('source').annotate(pk=models.Max('id'),sourceCount=models.Count(Case(
                When(created__range=(str(fd),str(td)), then=1),
                output_field=IntegerField()
                )))
            else:
                duplicates = Contacts.objects.filter(source__contains=str(request.data['source'])).values('source').annotate(pk=models.Max('id'),sourceCount=models.Count(Case(
                When(created__range=(str(fd),str(td)), then=1),
                output_field=IntegerField()
                )))
            print list(duplicates)

            return Response({'val':list(duplicates)})
        else:
            duplicates = Contacts.objects.filter(source__contains=str(request.data['source'])).values('source').annotate(pk=models.Max('id'),sourceCount=models.Count('source'))
            print list(duplicates)
            return Response({'val':list(duplicates)})

class CampaignDetailsAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request, format=None):
        print 'infooooooooo',self.request.GET
        sendData = campaigncontactsList(int(self.request.GET['pk']))
        print 'saiiiiiiiiii',sendData
        if 'typ' in self.request.GET :
            excelData = sendData.values('name','email','mobile','source','pinCode')
            return ExcelResponse(excelData)
        else:
            return Response(sendData)
