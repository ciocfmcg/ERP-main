from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from rest_framework.response import Response
from fabric.api import *


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('pk' ,'name' , 'cin' , 'tin' , 'telephone' , 'street','pincode','city','state','country')
        read_only_fields = ('user' , )
    def create(self , validated_data):
        s=Service(**validated_data)
        s.user=self.context['request'].user
        s.save()
        return s

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ('pk' ,'name' , 'company' , 'email' , 'mobile' , 'designation','notes')
        read_only_fields = ('user' , )
    def create(self , validated_data):
        c=Contact(**validated_data)
        c.user=self.context['request'].user
        c.save()
        return c

class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ('pk' , 'company' , 'billingFrequency' , 'billingDates' , 'rate','quantity' ,'unitType' ,'dueDays' ,'occupancy' ,'contractPaper' ,'otherDocs' )
        read_only_fields = ('user' , )
    def create(self , validated_data):
        if validated_data['billingFrequency'] == len(str(validated_data['billingDates']).split(',')):
            c=Contract(**validated_data)
            c.user=self.context['request'].user
            c.save()
            return c
        else:        
            raise ValidationError(detail=None)
