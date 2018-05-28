from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *

class AssetsSerializer(serializers.ModelSerializer):
    # units = UnitsLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Asset
        fields = ('pk' , 'user','created','updated','name','brand','modelNo')
        read_only_fields=('user',)
    def create(self , validated_data):
        d = Asset(**validated_data)
        d.user = self.context['request'].user
        d.save()
        return d

class CheckinSerializer(serializers.ModelSerializer):
    # asset = AssetsSerializer(many = False , read_only = True)
    class Meta:
        model = Checkin
        fields = ('pk' , 'user','serialNos','warrantyTill','manufacturedOn','qty','poNumber','asset')
        read_only_fields=('user',)
    def create(self , validated_data):
        d = Checkin(**validated_data)
        d.user = self.context['request'].user
        d.asset = Asset.objects.get(pk=self.context['request'].data['asset'])
        d.save()
        return d


class AllotmentSerializer(serializers.ModelSerializer):
    # units = UnitsLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Allotment
        fields = ('pk' , 'user','to','serialNo','approvedBy','comments','refurbished','asset','returned','returnComment')
        read_only_fields=('user',)
    def create(self , validated_data):
        d = Allotment(**validated_data)
        d.user = self.context['request'].user
        d.asset = Asset.objects.get(pk=self.context['request'].data['asset'])
        d.save()
        return d

class CheckoutSerializer(serializers.ModelSerializer):
    # units = UnitsLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Checkout
        fields = ('pk' , 'user','reason','sentTo','quantity')
        read_only_fields=('user',)
    def create(self , validated_data):
        d = Checkout(**validated_data)
        d.user = self.context['request'].user
        d.save()
        return d
