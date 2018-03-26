# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from .models import *
from HR.models import profile
from django.contrib.auth.models import User
from rest_framework import viewsets , permissions , serializers
from .serializers import *

# Create your views here.

class Tutor24UserView(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print 'enteredddddddddddddddddddddddd'
        print request.user.tutors24Profile.pk
        tutorObj = Tutors24Profile.objects.get(id = request.user.tutors24Profile.pk)
        hrObj = profile.objects.get(id= request.user.profile.pk)
        print request.user.profile.pk
        print tutorObj,hrObj
        hrData = {'mobile':hrObj.mobile,'gender':hrObj.gender,'hrPk' :hrObj.pk}
        tutorData = {'school':tutorObj.school ,'schoolName':tutorObj.schoolName ,'standard':tutorObj.standard ,'street':tutorObj.street ,'city':tutorObj.city ,'pinCode':tutorObj.pinCode ,'state':tutorObj.state ,'country':tutorObj.country ,'tutorPk': tutorObj.pk }
        toSend = {'hrObj' : hrData ,'tutorObj':tutorData}
        return Response(toSend,)


class tutors24ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Tutors24Profile.objects.all()
    serializer_class = Tutors24ProfileSerializer
