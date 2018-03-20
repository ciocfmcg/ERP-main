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
    company=ServiceSerializer(many=False,read_only=True)
    class Meta:
        model = Contact
        fields = ('pk' ,'name' , 'company' , 'email' , 'mobile' , 'designation','notes')
        read_only_fields = ('user' , 'company',)
    def create(self , validated_data):
        c=Contact(**validated_data)
        c.user=self.context['request'].user
        c.company=Service.objects.get(pk=self.context['request'].data['company'])
        c.save()
        return c
    def update(self ,instance, validated_data):
        for key in ['name', 'email' , 'mobile' , 'designation' , 'notes' ,]:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'company' in self.context['request'].data:
            instance.company = Service.objects.get(pk=self.context['request'].data['company'])
        instance.save()
        return instance

class ServiceLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('pk' ,'name' )

class ContractLiteSerializer(serializers.ModelSerializer):
    company =ServiceLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Contract
        fields = ('pk' ,'occupancy' , 'company')
class SpaceSerializer(serializers.ModelSerializer):
    contractSpace = ContractLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Space
        fields = ('pk' ,'name' , 'areas' , 'code' , 'contractSpace')
        read_only_fields = ('user' ,)
    def create(self , validated_data):
        s=Space(**validated_data)
        s.user=self.context['request'].user
        s.save()
        return s

class ContractSerializer(serializers.ModelSerializer):
    company=ServiceSerializer(many=False,read_only=True)
    contacts=ContactSerializer(many = True , read_only = True)
    areas=SpaceSerializer(many=False,read_only=True)
    class Meta:
        model = Contract
        fields = ('pk' ,'contacts', 'company' , 'billingFrequency' , 'billingDates' , 'rate','quantity' ,'unitType' ,'dueDays' ,'occupancy' ,'contractPaper' ,'otherDocs' ,'areas' ,'occupancy_screenshort')
        read_only_fields = ('user' ,'company','contacts','areas' )
    def create(self , validated_data):
        if validated_data['billingFrequency'] == len(str(validated_data['billingDates']).split(',')):
            c=Contract(**validated_data)
            c.user=self.context['request'].user
            c.company=Service.objects.get(pk=self.context['request'].data['company'])
            c.areas=Space.objects.get(pk=self.context['request'].data['areas'])
            c.save()
            return c
        else:
            raise ValidationError(detail=None)
    def update(self ,instance, validated_data):
        if validated_data['billingFrequency'] == len(str(validated_data['billingDates']).split(',')):
            for key in ['billingFrequency' , 'billingDates' , 'rate','quantity' ,'unitType' ,'dueDays' ,'occupancy' ,'contractPaper' ,'otherDocs' ,'occupancy_screenshort']:
                try:
                    setattr(instance , key , validated_data[key])
                except:
                    pass
            if 'company' in self.context['request'].data:
                instance.company = Service.objects.get(pk=self.context['request'].data['company'])
            if 'areas' in self.context['request'].data:
                instance.areas = Space.objects.get(pk=self.context['request'].data['areas'])
            instance.save()
            return instance
        else:
            raise ValidationError(detail=None)


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Invoice
        fields = ('pk','contract','data','value','status','created' ,'updated')

class CheckinsSerializer(serializers.ModelSerializer):
    contract=ContractSerializer(many=False,read_only=True)
    class Meta:
        model = Checkin
        fields = ('pk','created' ,'updated' , 'contract' , 'description' , 'height' , 'width','length','weight','checkedin','qty')
        # read_only_fields = ('contract')
    def create(self , validated_data):
        c=Checkin(**validated_data)
        c.user=self.context['request'].user
        c.contract=Contract.objects.get(pk=self.context['request'].data['contract'])
        c.save()
        return c

class CheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkout
        fields = ('pk' ,'user' , 'parent' , 'typ' , 'initial' , 'value','final', 'created')
        read_only_fields = ('user' , )
    def create(self , validated_data):
        c=Checkout(**validated_data)
        c.user=self.context['request'].user
        c.parent.qty = validated_data.pop('final')
        c.parent.save()
        c.save()
        return c
