from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from django.conf import settings as globalSettings
from rest_framework.response import Response
import re


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

# class UnitsLiteSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Units
#         fields = ('pk' , 'name')


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



class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class UnitSuperLiteSerializer(serializers.ModelSerializer):
    children = RecursiveField(many=True)
    # station_count = serializers.SerializerMethodField()
    # name = serializers.SerializerMethodField()
    # responsible = serializers.SerializerMethodField()
    class Meta:
        model = Unit
        fields = ( 'pk' , 'children', 'name' )

class UnitLiteSerializer(serializers.ModelSerializer):
    child_count = serializers.SerializerMethodField()
    # division = UnitSuperLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Unit
        fields = ( 'pk' , 'pincode' , 'parent', 'l1', 'name', 'child_count', 'l2' , 'mobile' ,'division', 'telephone','fax', )
    def get_child_count(self, obj):
        return Unit.objects.filter(parent__in = [obj.pk]).count()

class UnitFullSerializer(serializers.ModelSerializer):
    # parent = UnitLiteSerializer(read_only = True, many = True)
    children = UnitSuperLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Unit
        fields = ( 'pk' , 'name' , 'pincode' , 'l1' , 'l2' , 'mobile','telephone','fax', 'children', 'division')

class UnitSerializer(serializers.ModelSerializer):
    division = DivisionLiteSerializer(many = False , read_only = True)
    # child_count = serializers.SerializerMethodField()
    parent = UnitLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Unit
        fields = ('pk' , 'name','address','pincode','l1','l2','mobile','telephone','contacts','fax','division','parent', )
        read_only_fields=('contacts','parent')
    def create(self , validated_data):
        print '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
        d = Unit(**validated_data)
        d.division=Division.objects.get(pk=self.context['request'].data['division'])
        # d.units=Units.objects.get(pk=self.context['request'].data['units'])
        if 'parent' in self.context['request'].data:
            d.parent = Unit.objects.get(id=self.context['request'].data['parent'])
            # d.save()
            # for i in self.context['request'].data['parent']:
            #     d.parent.add(Units.objects.get(pk = i))
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
    def get_child_count(self, obj):
        return Unit.objects.filter(parent__in = [obj.pk]).count()



class DepartmentsSerializer(serializers.ModelSerializer):
    unit = UnitLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Departments
        fields = ('pk','dept_name','mobile','telephone','fax','contacts','unit','picture')
        read_only_fields=('contacts','unit')
    def create(self , validated_data):

        print '3333333333333333333333',self.context['request'].data
        # a=self.context['request'].data['units'].split(',')
        # for i in a:
        #     print i,type(i)
        # print validated_data
        # del validated_data['unit']
        d = Departments(**validated_data)
        # d.units=Units.objects.get(pk=self.context['request'].data['units'])
        d.save()
        print '111111111111111111'
        # a=self.context['request'].data['contacts'].split(',')
        # b=self.context['request'].data['units'].split(',')
        for i in str(self.context['request'].data['contacts']).split(','):
            d.contacts.add(User.objects.get(pk = i))
            print 'endddddddddddddddddddddddd'
        for i in self.context['request'].data['unit'].split(','):
            print '%%%%%%%%%%%%%%%%%%%%%',self.context['request'].data['unit']
            print i,type(i)
            d.unit.add(Unit.objects.get(pk = i))
            print '@@@@@@@@@@@@@@@@@',validated_data
        return d

    def update(self ,instance, validated_data):
        for key in ['dept_name','mobile','telephone','fax','picture','contacts','unit']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        # instance.units=Units.objects.get(pk=self.context['request'].data['units'])
        if 'contacts' in self.context['request'].data:
            a=self.context['request'].data['contacts'].split(',')
            for i in a:
                instance.contacts.add(User.objects.get(pk = i))
        if 'unit' in self.context['request'].data:
            b=self.context['request'].data['unit'].split(',')
            for i in b:
                instance.unit.add(Unit.objects.get(pk = i))
        instance.save()
        return instance


class RoleSerializer(serializers.ModelSerializer):
    department = DepartmentsLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Role
        fields = ('pk','name','department')
    def create(self , validated_data):
        d = Role(**validated_data)
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
        instance.unit=Unit.objects.get(pk=self.context['request'].data['unit'])
        if 'contacts' in self.context['request'].data:
            a=self.context['request'].data['contacts'].split(',')
            for i in a:
                instance.contacts.add(User.objects.get(pk = i))
        instance.save()
        return instance

class ResponsibilitySerializer(serializers.ModelSerializer):
    departments = DepartmentsSerializer(many = True , read_only = True)
    class Meta:
        model = Responsibility
        fields = ('pk' , 'title', 'departments','data')
        read_only_fields = ('departments', )
    def create(self , validated_data):
        print '************',validated_data
        r = Responsibility(**validated_data)
        if 'data' in validated_data:
            match=re.match(r'\d,|\d',r.data)
            if match:
                r.data = r.data
            else:
                raise ValidationError({'Not valid data'})
        r.user = self.context['request'].user
        r.save()
        r.departments.clear()
        for d in self.context['request'].data['depList']:
            r.departments.add(Departments.objects.get(pk = d))
        return r
    def update(self , instance , validated_data):
        for key in ['title', 'data' ]:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'data' in validated_data:
            match=re.match(r'\d,|\d',instance.data)
            if match:
                instance.data = instance.data
            else:
                raise ValidationError({'Not valid data'})
        instance.departments.clear()
        for d in self.context['request'].data['depList']:
            instance.departments.add(Departments.objects.get(pk = d))
        instance.save()
        return instance

class ResponsibilityLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responsibility
        fields = ('pk' , 'title')

class KRASerializer(serializers.ModelSerializer):
    responsibility = ResponsibilityLiteSerializer(many = False , read_only = True)
    class Meta:
        model = KRA
        fields = ('pk' ,'created' , 'responsibility', 'target' , 'assignedBy' , 'user' , 'period', 'weightage')
        read_only_fields = ('assignedBy', )
    def create(self , validated_data):
        kra = KRA(**validated_data)
        kra.responsibility_id = self.context['request'].data['responsibility']
        already = KRA.objects.filter(responsibility_id =  self.context['request'].data['responsibility'] , user = validated_data['user']).count()
        if already > 0:
            raise ValidationError({'ALREADY_ADDED'})
        kra.assignedBy = self.context['request'].user
        kra.save()
        return kra
    def update(self , instance , validated_data):
        instance.target = validated_data['target']
        instance.period = validated_data['period']
        if 'weightage' in validated_data:
            instance.weightage = validated_data['weightage']
        instance.save()
        return instance
