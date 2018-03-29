# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from url_filter.integrations.drf import DjangoFilterBackend
from .models import *
from HR.models import profile
from django.contrib.auth.models import User
from rest_framework import viewsets , permissions , serializers
from .serializers import *
from django.conf import settings as globalSettings
from ERP.models import application
from API.permissions import erp_permission

# Create your views here.

class Tutor24UserView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        # print 'enteredddddddddddddddddddddddd'
        # print request.user.tutors24Profile.p
        # print request.user.profile.pk

        a = application.objects.filter(name = 'app.tutor.tutorAccount')
        p = erp_permission.objects.filter(user = request.user , app = a).count()

        if p == 0:
            # its a student
            isTutor = False
        else:
            # its a tutor
            isTutor = True



        tutorObj = Tutors24Profile.objects.get(id = request.user.tutors24Profile.pk)
        hrObj = profile.objects.get(id= request.user.profile.pk)
        # print tutorObj,hrObj
        hrData = {'mobile':hrObj.mobile,'gender':hrObj.gender,'hrPk' :hrObj.pk}
        tutorData = {'school':tutorObj.school ,'schoolName':tutorObj.schoolName ,'standard':tutorObj.standard ,'street':tutorObj.street ,'city':tutorObj.city ,'pinCode':tutorObj.pinCode ,'state':tutorObj.state ,'country':tutorObj.country ,'tutorPk': tutorObj.pk , 'balance' : tutorObj.balance , 'parentEmail' : tutorObj.parentEmail , 'parentMobile' : tutorObj.parentMobile ,'isTutor' : isTutor}
        toSend = {'hrObj' : hrData ,'tutorObj':tutorData}
        return Response(toSend,)


class tutors24ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Tutors24Profile.objects.all()
    serializer_class = Tutors24ProfileSerializer

class tutors24SessionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = tutors24SessionSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['initialQuestion' , 'student' , 'tutor' ]

    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'onlyComplete':
                print '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
                sessionObj = Session.objects.exclude(end__isnull = True)
        else:
            sessionObj = Session.objects.all()

        return sessionObj

class tutors24TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Transaction.objects.all()
    serializer_class = tutors24TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['ref_id' ]


class tutors24MessageViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Message.objects.all()
    serializer_class = tutors24MessageSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['session' ]



def studentHome(request):
    return render(request,"student.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})



def tutorHome(request):
    return render(request,"tutor.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
