from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from django.conf import settings as globalSettings
from rest_framework.response import Response


# class UnitsLiteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Units
#         fields = ('pk' , 'name' )

class DepartmentsLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departments
        fields = ('pk' , 'dept_name' )


class DivisionLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = ('pk' , 'name' ,'website', 'logo')

class UnitsLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Units
        fields = ('pk' , 'name')


class DivisionSerializer(serializers.ModelSerializer):
    # units = UnitsLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Division
        fields = ('pk' , 'name','website','contacts','logo','gstin','pan','cin','l1','l2')
        read_only_fields=('contacts',)
    def create(self , validated_data):
        d = Division(**validated_data)
        d.save()
        for i in self.context['request'].data['contacts'].split(','):
            d.contacts.add(User.objects.get(pk = i))

        return d

class UnitsSerializer(serializers.ModelSerializer):
    division = DivisionLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Units
        fields = ('pk' , 'name','address','pincode','l1','l2','mobile','telephone','contacts','fax','division' )
        read_only_fields=('contacts',)
    def create(self , validated_data):
        d = Units(**validated_data)
        d.division=Division.objects.get(pk=self.context['request'].data['division'])
        d.save()

        for i in self.context['request'].data['contacts']:
            d.contacts.add(User.objects.get(pk = i))

        return d

    def update(self ,instance, validated_data):
        for key in ['name','address','pincode','l1','l2','mobile','telephone','fax']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.division=Division.objects.get(pk=self.context['request'].data['division'])
        if 'contacts' in self.context['request'].data:
            for i in self.context['request'].data['contacts']:
                instance.contacts.add(User.objects.get(pk = i))
        instance.save()
        return instance



class DepartmentsSerializer(serializers.ModelSerializer):
    units = UnitsLiteSerializer(many = True , read_only = False)
    class Meta:
        model = Departments
        fields = ('pk','dept_name','mobile','telephone','fax','contacts','units','picture')
        read_only_fields=('contacts','units')
    def create(self , validated_data):

        print '3333333333333333333333',self.context['request'].data
        # a=self.context['request'].data['units'].split(',')
        # for i in a:
        #     print i,type(i)
        print validated_data
        del validated_data['units']
        d = Departments(**validated_data)
        # d.units=Units.objects.get(pk=self.context['request'].data['units'])
        d.save()
        print '111111111111111111'
        # a=self.context['request'].data['contacts'].split(',')
        # b=self.context['request'].data['units'].split(',')
        for i in str(self.context['request'].data['contacts']).split(','):
            d.contacts.add(User.objects.get(pk = i))
            print 'endddddddddddddddddddddddd'
        for i in self.context['request'].data['units'].split(','):
            print '%%%%%%%%%%%%%%%%%%%%%',self.context['request'].data['units']
            print i,type(i)
            d.units.add(Units.objects.get(pk = i))
            print '@@@@@@@@@@@@@@@@@',validated_data
        return d

    def update(self ,instance, validated_data):
        for key in ['dept_name','mobile','telephone','fax','picture','contacts','units']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        # instance.units=Units.objects.get(pk=self.context['request'].data['units'])
        if 'contacts' in self.context['request'].data:
            a=self.context['request'].data['contacts'].split(',')
            for i in a:
                instance.contacts.add(User.objects.get(pk = i))
        if 'units' in self.context['request'].data:
            b=self.context['request'].data['units'].split(',')
            for i in b:
                instance.units.add(Units.objects.get(pk = i))
        instance.save()
        return instance


class RolesSerializer(serializers.ModelSerializer):
    department = DepartmentsLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Roles
        fields = ('pk','name','department')
    def create(self , validated_data):
        d = Roles(**validated_data)
        d.department=Departments.objects.get(pk=self.context['request'].data['department'])
        d.save()
        return d



    def update(self ,instance, validated_data):
        for key in ['name']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.department=Departments.objects.get(pk=self.context['request'].data['department'])
        instance.division=Division.objects.get(pk=self.context['request'].data['division'])
        instance.unit=Units.objects.get(pk=self.context['request'].data['unit'])
        if 'contacts' in self.context['request'].data:
            a=self.context['request'].data['contacts'].split(',')
            for i in a:
                instance.contacts.add(User.objects.get(pk = i))
        instance.save()
        return instance
