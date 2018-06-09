from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta


class TagSerializer(serializers.ModelSerializer):
    tagsCount = serializers.SerializerMethodField()
    class Meta:
        model = Tag
        fields = ('pk' , 'created' , 'name' ,'tagsCount')
    def get_tagsCount(self,obj):
        if 'fd' in self.context['request'].GET and len(self.context['request'].GET['fd']) > 0:
            fromDate = self.context['request'].GET['fd'].split('-')
            toDate = self.context['request'].GET['td'].split('-')
            fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
            td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
            fromDate = fd + relativedelta(days=1)
            toDate = td + relativedelta(days=1)
            print fromDate,toDate,obj.contacts_set.filter(created__range=(fromDate,toDate))
            return obj.contacts_set.filter(created__range=(str(fromDate),str(toDate))).count()
        else:
            return obj.contacts_set.all().count()

class ContactsSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True,read_only=True)
    # srcCount = serializers.SerializerMethodField()
    class Meta:
        model = Contacts
        fields = ('pk' , 'created' , 'referenceId' , 'name', 'email', 'mobile' , 'source' , 'pinCode' , 'notes' , 'tags' )
    def create(self , validated_data):
        print self.context['request'].data['tags'],validated_data
        if 'tags' in validated_data:
            del validated_data['tags']
        c = Contacts(**validated_data)
        c.save()
        for i in self.context['request'].data['tags']:
            c.tags.add(Tag.objects.get(pk = int(i)))
        return c
    def update(self ,instance, validated_data):
        for key in ['referenceId' , 'name', 'email', 'mobile' , 'source' , 'notes' , 'pinCode']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        instance.tags.clear()
        for i in self.context['request'].data['tags']:
            instance.tags.add(Tag.objects.get(pk = int(i)))
        return instance

    # def get_srcCount(self,obj):
    #     return Contacts.objects.filter(source = obj.source).count()


class CampaignSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True,read_only=True)
    class Meta:
        model = Campaign
        fields = ('pk' , 'created' ,  'name', 'source' , 'tags' ,'filterFrom' , 'filterTo' , 'status' , 'typ' , 'participants' , 'msgBody' , 'emailSubject' , 'emailBody' , 'directions')
    def create(self , validated_data):
        print self.context['request'].data,validated_data
        if 'tags' in validated_data:
            del validated_data['tags']
        c = Campaign(**validated_data)
        c.save()
        if 'tags' in self.context['request'].data :
            for i in self.context['request'].data['tags']:
                c.tags.add(Tag.objects.get(pk = int(i)))
        return c
    def update(self ,instance, validated_data):
        for key in ['name', 'source' ,'filterFrom' , 'filterTo' , 'status' , 'typ' , 'msgBody' , 'emailSubject' , 'emailBody' , 'directions']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        if 'tags' in self.context['request'].data:
            instance.tags.clear()
            for i in self.context['request'].data['tags']:
                instance.tags.add(Tag.objects.get(pk = int(i)))
        if 'participants' in self.context['request'].data:
            instance.participants.clear()
            for i in self.context['request'].data['participants']:
                instance.participants.add(User.objects.get(pk = int(i)))
        return instance

class CampaignLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignLogs
        fields = ('pk' , 'created' , 'user' , 'contact', 'campaign', 'data' , 'typ' , 'followupDate')
    def create(self , validated_data):
        print self.context['request'].data,validated_data
        c = CampaignLogs(**validated_data)
        c.user = self.context['request'].user
        c.contact = Contacts.objects.get(pk = self.context['request'].data['contact'])
        c.campaign = Campaign.objects.get(pk = self.context['request'].data['campaign'])
        c.save()
        return c
