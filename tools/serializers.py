from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
import datetime
from django.contrib.auth.hashers import make_password

class FileCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileCache
        fields = ( 'pk' , 'user' , 'created' , 'expiresOn' , 'attachment', 'fileID', 'account')
        read_only_fields = ('user' , 'expiresOn', 'fileID')

    def create(self , validated_data):
        fc = FileCache(**validated_data)
        fc.user = self.context['request'].user

        if 'apiKey' not in self.context['request'].data:
            raise ValidationError(detail="api key not provided")


        apiKey = self.context['request'].data['apiKey']

        aa = ApiAccount.objects.get(apiKey__contains=apiKey)

        # add the expiresOn date as two days later then the date of creation
        dt = datetime.date.today()
        dt += datetime.timedelta(days = 2)
        fc.expiresOn = dt.strftime('%Y-%m-%d')
        fc.fileID = make_password(datetime.datetime.now())
        fc.account = aa
        fc.save()
        return fc

    def update(self, instance , validated_data):
        # here the user can update the expiry date
        daysToExtend = int(self.context['request'].data['days'])
        instance.expiresOn += datetime.timedelta(days = daysToExtend)
        instance.save()
        return instance


class ApiAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiAccount
        fields = ('pk', 'user' ,'created', 'accountType', 'remaining', 'active','email', 'apiKey')
        read_only_fields = ('user','apiKey',)
    def create(self , validated_data):
        aa = ApiAccount(**validated_data)
        aa.user = self.context['request'].user
        try:
            aa.apiKey = make_password(datetime.datetime.now()).split('sha256$')[1]
        except:
            aa.apiKey = make_password(datetime.datetime.now())
        aa.save()
        return aa
    def update(self , instance , validated_data):

        if 'active' in self.context['request'].data:
            instance.active = self.context['request'].data['active']
            aalog = ApiAccountLog(account = instance, actor = self.context['request'].user,accActive = instance.active)
            aalog.save()
        if 'addUsage' in self.context['request'].data:
            toAdd = int(self.context['request'].data['addUsage'])
            instance.remaining += toAdd
            ref = self.context['request'].data['refID']
            if ref == '':
                ref = None
            aalog = ApiAccountLog(usageAdded = toAdd , account = instance, actor = self.context['request'].user, refID = ref)
            aalog.save()
        # instance.remaining = validated_data.pop('active')
        instance.save()
        return instance

class ApiAccountLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApiAccountLog
        fields = ('pk' , 'account' , 'updated', 'actor', 'usageAdded', 'refID', 'accActive')
