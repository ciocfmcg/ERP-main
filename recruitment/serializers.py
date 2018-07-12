from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from django.conf import settings as globalSettings
from rest_framework.response import Response
from organization.models import *
from organization.serializers import *
from HR.serializers import userSearchSerializer

class JobsSerializer(serializers.ModelSerializer):
    unit = UnitsLiteSerializer(many = False , read_only = True)
    department = DepartmentsLiteSerializer(many = False , read_only = True)
    role = RoleSerializer(many = False , read_only = True)
    class Meta:
        model = Jobs
        fields = ('pk', 'jobtype','unit', 'department', 'role' , 'contacts', 'skill' , 'approved' , 'maximumCTC' , 'status' )
    def create(self , validated_data):
        del validated_data['contacts']
        inv = Jobs(**validated_data)
        inv.unit = Unit.objects.get(pk = self.context['request'].data['unit'])
        inv.department = Departments.objects.get(pk = self.context['request'].data['department'])
        inv.role = Role.objects.get(pk = self.context['request'].data['role'])
        inv.save()
        for i in self.context['request'].data['contacts']:
            inv.contacts.add(User.objects.get(pk = i))
        return inv

    def update(self ,instance, validated_data):
        for key in ['jobtype',  'contacts' , 'skill', 'approved' , 'maximumCTC' , 'status']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'unit' in self.context['request'].data:
            instance.unit = Unit.objects.get(pk = self.context['request'].data['unit'])
        if 'department' in self.context['request'].data:
            instance.department = Departments.objects.get(pk = self.context['request'].data['department'])
        if 'role' in self.context['request'].data:
            instance.role = Role.objects.get(pk = self.context['request'].data['role'])
        if 'contacts' in self.context['request'].data:
            for i in self.context['request'].data['contacts']:
                instance.contacts.add(User.objects.get(pk = i))
        instance.save()
        return instance

class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobsSerializer(many = False , read_only = True)
    class Meta:
        model = JobApplication
        fields = ('pk', 'created','firstname', 'lastname', 'email' , 'mobile', 'resume' , 'coverletter' , 'status' , 'job' ,'aggree' , 'joiningDate' , 'hra' , 'basic' , 'lta' , 'special' , 'taxSlab' , 'adHoc' , 'al' , 'ml' , 'adHocLeaves' , 'amount' , 'notice' , 'probation' , 'joiningDate' , 'off' , 'probationNotice' , 'noticePeriodRecovery')
    def create(self , validated_data):
        i = JobApplication(**validated_data)
        i.job = Jobs.objects.get(pk = self.context['request'].data['job'])
        i.save()
        return i

class InterviewSerializer(serializers.ModelSerializer):
    candidate = JobApplicationSerializer(many = False , read_only = True)
    interviewer = userSearchSerializer(many = False , read_only = True)
    class Meta:
        model = Interview
        fields = ('pk', 'interviewer' ,'status' ,'comment', 'interviewDate', 'mode' ,  'candidate' )
    def create(self , validated_data):
        a = Interview(**validated_data)
        if 'candidate' in self.context['request'].data:
            a.candidate = JobApplication.objects.get(pk = self.context['request'].data['candidate'])
            print  self.context['request'].data['interviewer'],'aaaaaaaaaaaaaaaaaaaaaaaaa'
        if 'interviewer' in self.context['request'].data:
            a.interviewer= User.objects.get(pk = self.context['request'].data['interviewer'])
        a.save()
        return a
