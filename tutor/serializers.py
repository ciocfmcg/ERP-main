from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.models import profile
from LMS.models import Subject,Topic


class Tutors24ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutors24Profile
        fields = ('pk','user','created','updated','school','schoolName','standard','street','city','pinCode','state','country','balance' , 'typ' ,'parentEmail' , 'parentMobile')
        read_only_fields=('user','balance' , 'typ')

    def update(self ,instance, validated_data):
        # print 'updatingggggggggggggggggggggggggggggg'
        # print validated_data
        # print self.context['request'].data['mobile'],self.context['request'].data['gender']
        for key in ['school','schoolName','standard','street','city','pinCode','state','country' , 'parentEmail' , 'parentMobile']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        # print self.context['request'].user.pk
        hrobj = profile.objects.get(user_id=self.context['request'].user.pk)
        # print hrobj.email
        hrobj.mobile = self.context['request'].data['mobile']
        hrobj.gender = self.context['request'].data['gender']
        hrobj.save()

        return instance

class SubjectLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('pk' , 'title', )

class TopicLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('pk' , 'title', )

from django.core.exceptions import PermissionDenied

class tutors24SessionSerializer(serializers.ModelSerializer):
    subject = SubjectLiteSerializer(many = False , read_only = True)
    topic = TopicLiteSerializer(many = False , read_only = True)
    class Meta:
        model = Session
        fields = ('pk','created','updated','student','tutor','start','end','attachments','initialQuestion','subject','topic','minutes' , 'idle','ratings','ratingComments','started')
        # read_only_fields=('balance' , 'typ')
    def create(self ,validated_data):
        s = Session(**validated_data)
        s.subject_id = self.context['request'].data['subject']
        s.topic_id = self.context['request'].data['topic']
        s.save()
        return s
    def update(self , instance , validated_data):
        print instance.minutes
        if instance.minutes != None:
            raise PermissionDenied()

        for key in ['minutes','rating','ratingComments','tutor']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass

        if instance.minutes != None:
            profile = self.context['request'].user.tutors24Profile
            profile.balance -= instance.minutes
            profile.save()
        instance.save()

        return instance

class tutors24TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('pk','created','updated','ref_id','mid','status','source','amount','txn_id','bank_refno','name','email' , 'mobile','Product_info','before','after','value','promoCode','discount')
        # read_only_fields=('user','balance' , 'typ')

class tutors24MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('pk','created','updated','session','sender','msg','attachment')
