from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.models import profile
from LMS.models import Subject,Topic
from PIL import Image


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

class tutors24ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionImage
        fields = ('pk' , 'image')
    def create(self , validated_data):
        s=SessionImage(**validated_data)
        # s.sessionID=Session.objects.get(pk=self.context['request'].data['sessionID'])
        s.save()

        # print 'pathhhhh', s.image.path

        MAX_SIZE = 520
        image = Image.open(s.image.path)
        print 'iiiiiiiimmmmmmmmaaaaaageee',image.size;
        original_size = max(image.size[0], image.size[1])
        if original_size >= MAX_SIZE:
            print s.image.path
            if (image.size[0] > image.size[1]):
                resized_width = MAX_SIZE
                resized_height = int(round((MAX_SIZE/float(image.size[0]))*image.size[1]))
            else:
                resized_height = MAX_SIZE
                resized_width = int(round((MAX_SIZE/float(image.size[1]))*image.size[0]))

            image = image.resize((resized_width, resized_height), Image.ANTIALIAS)
        extension = s.image.path.split('.')[-1]
        newPath = s.image.path.replace('.' + extension , '_scaled.' + extension)
        image.save(newPath ,quality=50,optimize=True)
        return s

        # else:
        #     extension = s.image.path.split('.')[-1]
        #     newPath = s.image.path.replace('.' + extension , '_scaled.' + extension)
        #     image.save(newPath ,quality=50,optimize=True)
        #     return s
