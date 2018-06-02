from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
import os
from projects.serializers import projectLiteSerializer
from datetime import datetime


class TimeSheetItemSerializer(serializers.ModelSerializer):
    project = projectLiteSerializer(many = False ,read_only = True)
    class Meta:
        model = TimeSheetItem
        fields = ('pk','parent','project','duration','comment','approvalComment')
        read_only_fields=('approvalComment', )
    def create(self , validated_data):
        t = TimeSheetItem(**validated_data)
        t.parent__id = self.context['request'].data['parent']
        t.project = project.objects.get(pk=self.context['request'].data['project'])
        t.save()
        return t


class TimeSheetSerializer(serializers.ModelSerializer):
    items = TimeSheetItemSerializer(many = True , read_only = True)
    class Meta:
        model = TimeSheet
        fields = ('pk','created','user','date','approved','approvedBy' , 'items','status' , 'checkIn' , 'checkOut')
        read_only_fields=('user', )
    def create(self , validated_data):
        t = TimeSheet(**validated_data)
        t.user = self.context['request'].user
        # t.user = User.objects.get(pk=self.context['request'].data['user'])
        t.save()
        return t

    def update(self , instance , validated_data):
        print self.context['request'].data,validated_data
        if 'checkInTime' in self.context['request'].data:
            instance.checkIn = datetime.now()
            # instance.checkOut = None
            instance.save()
            return instance
        if 'checkOutTime' in self.context['request'].data:
            instance.checkOut = datetime.now()
            # instance.checkIn = None
            instance.save()
            return instance
        if instance.status == 'submitted':
            if 'typ' in self.context['request'].data:
                if self.context['request'].data['typ'] == 'approved':
                    pass
                    instance.approved = True
                    instance.status = 'approved'
                elif self.context['request'].data['typ'] == 'created':
                    instance.status = 'created'
                instance.approvedBy.add(self.context['request'].user)

        if 'status' in self.context['request'].data:
            instance.status = 'submitted'
        instance.save()
        return instance
        # else:
        #     return instance
