from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings


class ContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = ('pk' , 'created' , 'referenceId' , 'name', 'email', 'mobile' , 'source' , 'notes')
