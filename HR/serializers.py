
from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *

class userProfileLiteSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    class Meta:
        model = profile
        fields = ('displayPicture' , 'prefix' )

class userSearchSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    profile = userProfileLiteSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ( 'pk', 'username' , 'first_name' , 'last_name' , 'profile' , 'social' , 'designation' )


class rankSerializer(serializers.ModelSerializer):
    class Meta:
        model = rank
        fields = ( 'title' , 'category' )

class userDesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = designation
        fields = ('pk' , 'user', 'reportingTo' , 'primaryApprover' , 'secondaryApprover')

        read_only_fields=('user',)
        def create(self , validated_data):
        
            d = designation()
            d.user=User.objects.get(pk=self.context['request'].user)
            d.reportingTo=User.objects.get(pk=self.context['request'].data['reportingTo'])
            d.primaryApprover=User.objects.get(pk=self.context['request'].data['primaryApprover'])
            d.secondaryApprover=User.objects.get(pk=self.context['request'].data['secondaryApprover'])
            d.save()
            return d
        #  'unitType' , 'domain' , 'rank' , 'unit' , 'department' ,
class userProfileSerializer(serializers.ModelSerializer):
    """ allow all the user """
    class Meta:
        model = profile
        fields = ( 'pk' , 'mobile' , 'displayPicture' , 'website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' )
        read_only_fields = ('website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' , )

class userProfileAdminModeSerializer(serializers.ModelSerializer):
    """ Only admin """
    class Meta:
        model = profile
        fields = ( 'pk', 'empID', 'dateOfBirth' , 'anivarsary' , 'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry' , 'prefix', 'gender' , 'email', 'email2', 'mobile' , 'emergency' , 'tele' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV',
        'note1' , 'note2' , 'note3')


class payrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = payroll
        fields = ('pk','user','created','updated','hra','special','lta','basic','adHoc','policyNumber','provider','amount','noticePeriodRecovery','al','ml','adHocLeaves','joiningDate','off','accountNumber','ifscCode','bankName','deboarded','lastWorkingDate')

    def update(self ,instance, validated_data):
        for key in ['hra','special','lta','basic','adHoc','policyNumber','provider','amount','noticePeriodRecovery','al','ml','adHocLeaves','joiningDate','off','accountNumber','ifscCode','bankName','deboarded','lastWorkingDate']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        return instance

class payrollLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = payroll
        fields = ('pk','user', 'al','ml','adHocLeaves','joiningDate','off')

class userSerializer(serializers.ModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    payroll = payrollLiteSerializer(many = False , read_only = True)
    class Meta:
        model = User
        fields = ('pk' , 'username' , 'email' , 'first_name' , 'last_name' , 'designation' ,'profile'  ,'settings' , 'password' , 'social', 'payroll')
        read_only_fields = ('designation' , 'profile' , 'settings' ,'social', 'payroll' )
        extra_kwargs = {'password': {'write_only': True} }
    def create(self , validated_data):
        raise PermissionDenied(detail=None)
    def update (self, instance, validated_data):
        user = self.context['request'].user
        if authenticate(username = user.username , password = self.context['request'].data['oldPassword']) is not None:
            user = User.objects.get(username = user.username)
            user.set_password(validated_data['password'])
            user.save()
        else :
            raise PermissionDenied(detail=None)
        return user

class userAdminSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url' , 'username' , 'email' , 'first_name' , 'last_name' , 'is_staff' ,'is_active' )
    def create(self , validated_data):
        if not self.context['request'].user.is_superuser:
            raise PermissionDenied(detail=None)
        user = User.objects.create(**validated_data)
        user.email = user.username + '@cioc.co.in'
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()
        return user
    def update (self, instance, validated_data):
        user = self.context['request'].user
        if user.is_staff or user.is_superuser:
            u = User.objects.get(username = self.context['request'].data['username'])
            if (u.is_staff and user.is_superuser ) or user.is_superuser: # superuser can change password for everyone , staff can change for everyone but not fellow staffs
                if 'password' in self.context['request'].data:
                    u.set_password(self.context['request'].data['password'])
                u.first_name = validated_data['first_name']
                u.last_name = validated_data['last_name']
                u.is_active = validated_data['is_active']
                u.is_staff = validated_data['is_staff']
                u.save()
            else:
                raise PermissionDenied(detail=None)
        try:
            return u
        except:
            raise PermissionDenied(detail=None)

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')
