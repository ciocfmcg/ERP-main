from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('pk' , 'firstName','lastName','dateOfBirth','gender','uniqueId','email','phoneNo','emergencyContact1','emergencyContact2','street','city','pin','state','country' )

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

        a.patient = Patient.objects.get(pk=int(self.context['request'].data['patient']))
        a.save()
        return a

class InvoiceSerializer(serializers.ModelSerializer):
    # activePatient = ActivePatientSerializer(many=False , read_only=True)
    items = ProductSerializer(many=True , read_only=True)
    class Meta:
        model = Invoice
        fields = ('pk' , 'activePatient','invoiceName','grandTotal','items')
    def create(self , validated_data):
        i = Invoice(**validated_data)
        i.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        i.save()
        return i
    def update(self ,instance, validated_data):
        print validated_data , self.context['request'].data
        for key in ['invoiceName', 'grandTotal']:
            try:
                setattr(instance , key , validated_data[key])
                print self.context['request'].data['grandTotal']
            except:
                print "Error while saving " , key
                pass
        if 'activePatient' in self.context['request'].data:
            instance.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        instance.save()
        if 'items' in self.context['request'].data:
            instance.items.clear()
            for c in self.context['request'].data['items']:
                print 'cccc',c
                instance.items.add(Product.objects.get(pk = c))
        return instance
