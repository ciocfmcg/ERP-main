from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from ERP.serializers import serviceLiteSerializer , serviceSerializer , addressSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('pk' , 'user' ,'name', 'company', 'email', 'mobile' , 'notes' , 'pan' , 'gst' , 'street' , 'city' , 'state' , 'pincode' , 'country' ,  'streetBilling' , 'cityBilling' , 'stateBilling' , 'pincodeBilling' , 'countryBilling' , 'sameAsShipping')
        read_only_fields = ( 'user' , )
    def create(self , validated_data):
        c = Customer(**validated_data)
        c.user = self.context['request'].user
        c.save()
        return c

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name', 'hsnCode', 'price', 'displayPicture', 'serialNo', 'description', 'inStock')
        read_only_fields = ( 'user' , )
    def create(self , validated_data):
        p = Product(**validated_data)
        p.user = self.context['request'].user
        p.save()
        return p
