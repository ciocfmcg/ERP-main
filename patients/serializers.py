from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from django.db.models import Sum
from .models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('pk' , 'firstName','lastName','dateOfBirth','modeOfPayment','gender','uniqueId','email','phoneNo','emergencyContact1','emergencyContact2','street','city','pin','state','country' )

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
    class Meta:
        model = Invoice
        fields = ('pk' , 'activePatient','invoiceName','grandTotal','products','quantity')
    def create(self , validated_data):
        i = Invoice(**validated_data)
        i.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        i.save()
        return i
    def update(self ,instance, validated_data):
        print validated_data , self.context['request'].data
        for key in ['invoiceName', 'grandTotal' ,'quantity','products']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'activePatient' in self.context['request'].data:
            instance.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        instance.save()
        return instance

class DishchargeSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeSummary
        fields = ('pk' , 'patientName','age','sex','telephoneNo','uhidNo','ipNo','treatingConsultantName','treatingConsultantContact','treatingConsultantDept','dateOfAdmission','dateOfDischarge','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','familyHistory','courseInHospital','patientCondition','advice','reviewOn','complications','doctorName','regNo')
    def create(self , validated_data):
        i = DischargeSummary(**validated_data)
        i.patientName = Patient.objects.get(pk=int(self.context['request'].data['patientName']))
        i.save()
        return i
