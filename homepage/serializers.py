
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
import requests
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage

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


        msgBody = ['Your OTP to verify your email ID is <strong>%s</strong>.' %(reg.emailOTP) ]

        ctx = {
            'heading' : 'Welcome to 24Tutors.com , your buddy in your studies',
            'recieverName' : 'Student',
            'message': msgBody,
            'linkUrl': '24tutors.com',
            'linkText' : 'View Online',
            'sendersAddress' : '(C) CIOC FMCG Pvt Ltd',
            'sendersPhone' : '841101',
            'linkedinUrl' : 'https://www.linkedin.com/company/24tutors/',
            'fbUrl' : 'https://www.facebook.com/24tutorsIndia/',
            'twitterUrl' : 'twitter.com',
            'brandName' : globalSettings.BRAND_NAME,
        }

        email_body = get_template('app.homepage.emailOTP.html').render(ctx)
        print email_body
        email_subject = '[24Tutors.com] Email OTP'

        msg = EmailMessage(email_subject, email_body, to= [reg.email] , from_email= 'do_not_reply@cioc.co.in' )
        msg.content_subtype = 'html'
        msg.send()

        url = globalSettings.SMS_API_PREFIX + 'number=%s&message=%s'%(reg.mobile , 'Dear Student,\nPlease use OTP : %s to verify your mobile number' %(reg.mobileOTP))
        # print url
        requests.get(url)

        reg.save()
        reg.emailOTP = ''
        reg.mobileOTP = ''
        return reg
