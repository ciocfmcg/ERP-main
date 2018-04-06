from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from django.conf import settings as globalSettings
from rest_framework.response import Response
from organization.models import *



class DepartmentsLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departments
        fields = ('pk' , 'dept_name' )


class UnitsLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Units
        fields = ('pk' , 'name' )

class RolesLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = ('pk' , 'name')


class JobsSerializer(serializers.ModelSerializer):
    unit = UnitsLiteSerializer(many = False , read_only = True)
    department = DepartmentsLiteSerializer(many = False , read_only = True)
    role = RolesLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Jobs
        fields = ('pk', 'jobtype','unit', 'department', 'role' , 'contacts', 'skill' )
    def create(self , validated_data):
        print validated_data,self.context['request'].data['contacts']
        # cont = validated_data['contacts']
        del validated_data['contacts']
        print validated_data
        inv = Jobs(**validated_data)
        inv.unit = Units.objects.get(pk = self.context['request'].data['unit'])
        inv.department = Departments.objects.get(pk = self.context['request'].data['department'])
        inv.role = Roles.objects.get(pk = self.context['request'].data['role'])
        inv.save()
        for i in self.context['request'].data['contacts']:
            inv.contacts.add(User.objects.get(pk = i))
        return inv

    def update(self ,instance, validated_data):
        print 'enteredddddddddddddddddddd'
        for key in ['jobtype',  'contacts' , 'skill']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.unit = Units.objects.get(pk = self.context['request'].data['unit'])
        instance.department = Departments.objects.get(pk = self.context['request'].data['department'])
        instance.role = Roles.objects.get(pk = self.context['request'].data['role'])
        if 'contacts' in self.context['request'].data:
            for i in self.context['request'].data['contacts']:
                instance.contacts.add(User.objects.get(pk = i))
        instance.save()
        return instance
