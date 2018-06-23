from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from django.db.models import Sum
from .models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('pk' , 'firstName','lastName','dateOfBirth','gender','uniqueId','email','phoneNo','emergencyContact1','emergencyContact2','street','city','pin','state','country' , 'age' )

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('pk' , 'name','rate')

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('pk' , 'name','department', 'education')

class ActivePatientSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(many=False , read_only=True)
    class Meta:
        model = ActivePatient
        fields = ('pk' , 'patient','inTime','outTime','status','comments','outPatient','created','dateOfDischarge', 'mlc' , 'cash' , 'insurance')
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
        fields = ('pk' , 'activePatient','invoiceName','grandTotal','products','quantity' , 'billed' , 'discount')
    def create(self , validated_data):
        i = Invoice(**validated_data)
        i.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        i.save()
        return i
    def update(self ,instance, validated_data):
        print validated_data , self.context['request'].data
        for key in ['invoiceName', 'grandTotal' ,'quantity','products' , 'billed' , 'discount']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'activePatient' in self.context['request'].data:
            instance.activePatient = ActivePatient.objects.get(pk=int(self.context['request'].data['activePatient']))
        instance.save()
        return instance

class DishchargeSummarySerializer(serializers.ModelSerializer):
    patient = ActivePatientSerializer(many=False , read_only=True)
    treatingConsultant = DoctorSerializer(many=False , read_only=True)
    class Meta:
        model = DischargeSummary
        fields = ('pk' , 'patient','ipNo','treatingConsultant','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','pastHistory','familyHistory','summaryKeyInvestigation','courseInHospital','patientCondition','advice','reviewOn','complications')
    def create(self , validated_data):
        i = DischargeSummary(**validated_data)
        i.patient = ActivePatient.objects.get(pk=int(self.context['request'].data['patient']))
        i.treatingConsultant = Doctor.objects.get(pk=int(self.context['request'].data['treatingConsultant']))
        i.save()
        return i
    def update(self ,instance, validated_data):
        print "will update"

        for key in ['ipNo','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','pastHistory','familyHistory','summaryKeyInvestigation','courseInHospital','patientCondition','advice','reviewOn','complications']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'treatingConsultant' in self.context['request'].data:
            instance.treatingConsultant = Doctor.objects.get(pk=int(self.context['request'].data['treatingConsultant']))
        instance.save()
        return instance

class DishchargeSummaryLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeSummary
        fields = ('pk' ,'ipNo','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','pastHistory','familyHistory','summaryKeyInvestigation','courseInHospital','patientCondition','advice','reviewOn','complications' , 'treatingConsultant')

class ActivePatientLiteSerializer(serializers.ModelSerializer):
    invoices = InvoiceSerializer(many = True , read_only = True)
    # dischargeSummary = DishchargeSummaryLiteSerializer(many = False , read_only = True)
    class Meta:
        model = ActivePatient
        fields = ('pk' , 'patient','inTime','outTime','status','comments', 'dischargeSummary' , 'invoices')
