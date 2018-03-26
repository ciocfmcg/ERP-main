from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.models import profile


class Tutors24ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tutors24Profile
        fields = ('pk','user','created','updated','school','schoolName','standard','street','city','pinCode','state','country','balance' , 'typ')
        read_only_fields=('user','balance' , 'typ')

    def update(self ,instance, validated_data):
        print 'updatingggggggggggggggggggggggggggggg'
        print validated_data
        print self.context['request'].data['mobile'],self.context['request'].data['gender']
        for key in ['school','schoolName','standard','street','city','pinCode','state','country']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        print self.context['request'].user.pk
        hrobj = profile.objects.get(user_id=self.context['request'].user.pk)
        print hrobj.email
        hrobj.mobile = self.context['request'].data['mobile']
        hrobj.gender = self.context['request'].data['gender']
        hrobj.save()

        return instance
