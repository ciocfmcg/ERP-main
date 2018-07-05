from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from django.db.models import Sum
from .models import *
import requests
import datetime

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('pk' ,'created', 'firstName','lastName','dateOfBirth','gender','uniqueId','email','phoneNo','emergencyContact1','emergencyContact2','street','city','pin','state','country' , 'age' )

    def create(self , validated_data):
        print '****************************'
        print validated_data
        today = datetime.date.today()
        dt = '%02d' % today.day
        mt = '%02d' % today.month
        uId = mt+dt
        p = Patient(**validated_data)
        p.save()
        p.uniqueId = uId + str(p.pk)
        p.save()


        requests.get("https://cioc.in/api/ERP/contacts/?name=" + p.firstName + "&email="+ str(p.email) + "&mobile=" + str(p.phoneNo) + "&age=" + str(p.age) + "&pincode=" + str(p.pin) )

        return p



class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('pk' , 'name','rate')

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('pk' , 'name','department', 'education' , 'mobile')

class ActivePatientSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(many=False , read_only=True)
    docName = DoctorSerializer(many=False , read_only=True)
    class Meta:
        model = ActivePatient
        fields = ('pk' , 'patient','inTime','outTime','status','comments','outPatient','created','dateOfDischarge', 'mlc' , 'cash' , 'insurance' ,'opNo' ,'docName' , 'msg')
    def create(self , validated_data):
        print '**********************************'
        print validated_data , self.context['request'].data
        a = ActivePatient(**validated_data)
        if 'docName' in self.context['request'].data:
            a.docName = Doctor.objects.get(pk=int(self.context['request'].data['docName']))
        a.patient = Patient.objects.get(pk=int(self.context['request'].data['patient']))
        a.save()
        if not a.outPatient:
            print ActivePatient.objects.filter(outPatient=False,pk__lt=a.pk).count()
            count = 309 + ActivePatient.objects.filter(outPatient=False,pk__lt=a.pk).count()
            print count
            n = count if count>=1000 else '0'+str(count)
            ipn = 'RR/'+str(n)+'/18'
            print ipn
            d = DischargeSummary.objects.create(patient=a,ipNo=ipn)
        else:
            a.opNo = a.pk
            a.save()
        return a
    def update(self ,instance, validated_data):
        print validated_data , self.context['request'].data
        for key in ['inTime','outTime','status','comments','outPatient','dateOfDischarge', 'mlc' , 'cash' , 'insurance' ,'opNo' ,'msg']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'docName' in self.context['request'].data:
            instance.docName = Doctor.objects.get(pk=int(self.context['request'].data['docName']))
        instance.save()
        return instance


class InvoiceSerializer(serializers.ModelSerializer):
    # activePatient = ActivePatientSerializer(many=False , read_only=True)
    class Meta:
        model = Invoice
        fields = ('pk' ,'created', 'activePatient','invoiceName','grandTotal','products','quantity' , 'billed' , 'discount')
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
    treatingConsultant = DoctorSerializer(many=True , read_only=True)
    class Meta:
        model = DischargeSummary
        fields = ('pk' , 'patient','ipNo','treatingConsultant','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','pastHistory','familyHistory','summaryKeyInvestigation','courseInHospital','patientCondition','advice','reviewOn','complications' , 'treatmentGiven')
    def create(self , validated_data):
        print validated_data
        print '*******************'
        print self.context['request'].data
        i = DischargeSummary(**validated_data)
        i.patient = ActivePatient.objects.get(pk=int(self.context['request'].data['patient']))
        i.save()
        if 'primaryDoctor' in self.context['request'].data:
            ap = ActivePatient.objects.get(pk=int(self.context['request'].data['patient']))
            ap.docName = Doctor.objects.get(pk=int(self.context['request'].data['primaryDoctor']))
            ap.save()
        if 'docListPk' in self.context['request'].data:
            for p in self.context['request'].data['docListPk']:
                i.treatingConsultant.add(Doctor.objects.get(pk=int(p)))
        return i
    def update(self ,instance, validated_data):
        print "will update"
        print validated_data
        print self.context['request'].data
        for key in ['ipNo','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','pastHistory','familyHistory','summaryKeyInvestigation','courseInHospital','patientCondition','advice','reviewOn','complications' , 'treatmentGiven']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        print 'came'
        if 'primaryDoctor' in self.context['request'].data:
            ap = ActivePatient.objects.get(pk=int(self.context['request'].data['patient']))
            ap.docName = Doctor.objects.get(pk=int(self.context['request'].data['primaryDoctor']))
            ap.save()
        if 'docListPk' in self.context['request'].data:
            print 'innnn'
            instance.treatingConsultant.clear()
            for p in self.context['request'].data['docListPk']:
                print 'forrrrrrrrrrr',p,type(p)
                instance.treatingConsultant.add(Doctor.objects.get(pk=int(p)))
        instance.save()
        return instance


class DishchargeSummaryLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeSummary
        fields = ('pk' ,'ipNo','mlcNo','firNo','provisionalDiagnosis','finalDiagnosis','complaintsAndReason','summIllness','keyFindings','historyOfAlchohol','pastHistory','familyHistory','summaryKeyInvestigation','courseInHospital','patientCondition','advice','reviewOn','complications' , 'treatingConsultant' , 'treatmentGiven')

class ActivePatientLiteSerializer(serializers.ModelSerializer):
    invoices = InvoiceSerializer(many = True , read_only = True)
    # dischargeSummary = DishchargeSummaryLiteSerializer(many = False , read_only = True)
    docName = DoctorSerializer(many=False , read_only=True)
    class Meta:
        model = ActivePatient
        fields = ('pk' , 'patient','inTime','outTime','status','comments', 'dischargeSummary' , 'invoices', 'opNo' ,'docName' , 'outPatient' , 'dateOfDischarge' , 'msg')
