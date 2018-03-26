
from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.views import generateOTPCode
import hashlib
import random, string
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.contrib.auth import authenticate , login , logout
from django.shortcuts import redirect , get_object_or_404
from django.conf import settings as globalSettings
from ERP.models import application, permission , module

class RegistrationSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    class Meta:
        model = Registration
        fields = ('pk', 'created' , 'token' , 'mobileOTP' , 'emailOTP' , 'email', 'mobile')
        read_only_fields = ( 'token' , 'mobileOTP' , 'emailOTP')
    def update(self , instance , validated_data):
        print instance
        print validated_data
        d = self.context['request'].data;

        if( d['token'] == instance.token and d['mobileOTP'] == instance.mobileOTP and d['emailOTP']== instance.emailOTP ):
            print "will create a new user"

            u = User(username = d['email'].split('@')[0])
            u.first_name = d['firstName']
            u.email = d['email']
            u.last_name = d['lastName']
            u.first_name = d['firstName']
            u.set_password(d['password'])
            u.is_active = True
            u.save()

            for a in globalSettings.DEFAULT_APPS_ON_REGISTER:
                app = application.objects.get(name = a)
                p = permission.objects.create(app =  app, user = u , givenBy = User.objects.get(pk=1))

            login(self.context['request'] , u,backend='django.contrib.auth.backends.ModelBackend')
            instance.delete()
            return instance

        else:
            raise SuspiciousOperation('Expired')


        return instance
    def create(self , validated_data):

        reg = Registration(**validated_data)

        salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
        key = hashlib.sha1(salt+validated_data.pop('email')).hexdigest()

        reg.token = key
        reg.mobileOTP = generateOTPCode()
        print reg.mobileOTP
        reg.emailOTP = generateOTPCode()
        print reg.emailOTP
        reg.save()
        reg.emailOTP = ''
        reg.mobileOTP = ''
        return reg
