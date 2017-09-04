from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from ERP.serializers import serviceLiteSerializer , serviceSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings


class ContactLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ('pk' , 'user' ,'name', 'company', 'email', 'mobile' , 'designation', 'dp', 'male')
        read_only_fields = ( 'user' ,'name', 'company', 'email', 'mobile' , 'designation', 'dp', 'male')


class ContactSerializer(serializers.ModelSerializer):
    company = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = Contact
        fields = ('pk' , 'user' ,'name', 'created' , 'updated' , 'company', 'email' , 'emailSecondary', 'mobile' , 'mobileSecondary' , 'designation' , 'notes' , 'linkedin', 'facebook', 'dp', 'male')
        read_only_fields = ('user', )
    def create(self , validated_data):
        c = Contact(**validated_data)
        c.user = self.context['request'].user
        if 'company' in self.context['request'].data:
            c.company_id = int(self.context['request'].data['company'])
        c.save()
        return c
    def update(self ,instance, validated_data):
        for key in ['name', 'email' , 'emailSecondary', 'mobile' , 'mobileSecondary' , 'designation' , 'notes' , 'linkedin', 'facebook', 'dp', 'male']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'company' in self.context['request'].data:
            instance.company_id = int(self.context['request'].data['company'])
        instance.save()
        return instance


class DealSerializer(serializers.ModelSerializer):
    company = serviceLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Deal
        fields = ('pk' , 'user' , 'created' , 'updated' , 'company','value', 'currency', 'state', 'contact')

    def create(self , validated_data):
        pass



class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ('pk'  ,'user' , 'created' , 'updated' , 'doc', 'value', 'relationType', 'deal')

class ActivitySerializer(serializers.ModelSerializer):
    contacts = ContactLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Activity
        fields = ('pk'  ,'user' , 'created' , 'typ' , 'data', 'deal', 'contact', 'notes', 'doc' , 'contacts' , 'internalUsers')
        read_only_fields = ('user','contacts' , 'internalUsers')
    def create(self , validated_data):
        a = Activity(**validated_data)
        a.user = self.context['request'].user
        a.save()
        if 'internalUsers' in self.context['request'].data:
            for c in self.context['request'].data['internalUsers']:
                a.internalUsers.add(User.objects.get(pk = c))
        if 'contacts' in self.context['request'].data:
            for c in self.context['request'].data['contacts']:
                a.contacts.add(Contact.objects.get(pk = c))
        return a
