from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('pk' , 'firstName','lastName','age','gender','uniqueId','email','phoneNo','emergencyContact1','emergencyContact2','street','city','pin','state','country' )

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('pk' , 'name','rate')


class ActivePatientSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(many=False , read_only=True)
    class Meta:
        model = ActivePatient
        fields = ('pk' , 'patient','inTime','outTime','status','comments')
    def create(self , validated_data):
        print '**********************************'
        print validated_data , self.context['request'].data
        a = ActivePatient(**validated_data)

        # if 'patient' in self.context['request'].data:
        #     a.patient_id = int(self.context['request'].data['patient'])
        a.patient = Patient.objects.get(pk=int(self.context['request'].data['patient']))
        a.save()
        return a

class InvoiceSerializer(serializers.ModelSerializer):
    # activePatient = ActivePatientSerializer(many=False , read_only=True)
    class Meta:
        model = Invoice
        fields = ('pk' , 'activePatient','invoiceName','grandTotal','items')
    def create(self , validated_data):
        i = Invoice(**validated_data)
        i.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        i.save()
        return i
