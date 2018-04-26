# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from LMS.models import Subject,Topic
from django.core.validators import MaxValueValidator, MinValueValidator
from time import time

# Create your models here.

def getAttachmentPath(instance , filename ):
    return 'tutor/attachments/%s_%s' % (str(time()).replace('.', '_'), filename)
def getMessageAttachmentPath(instance , filename ):
    return 'tutor/msgAttachment/%s_%s' % (str(time()).replace('.', '_'), filename)
def getImageUploadPath(instance , filename ):
    return 'tutor/imageAttachment/%s_%s' % (str(time()).replace('.', '_'), filename)


class Tutors24Profile(models.Model):

    user = models.OneToOneField(User)

    SCHOOL_CHOICES = (
        ('S' , 'School'),
        ('C' , 'College'),
    )
    Class_CHOICES = (
        ('1' , 'Class 1'),
        ('2' , 'Class 2'),
        ('3' , 'Class 3'),
        ('4' , 'Class 4'),
        ('5' , 'Class 5'),
        ('6' , 'Class 6'),
        ('7' , 'Class 7'),
        ('8' , 'Class 8'),
        ('9' , 'Class 9'),
        ('10' , 'Class 10'),
        ('11' , 'Class 11'),
        ('12' , 'Class 12'),
        ('13' , 'Entrence Exam Preparation'),
        ('14' , 'Undergraduates Programs'),

    )
    USER_TYPE = (
        ('S' , 'Student'),
        ('T' , 'Tutor'),
    )
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    school = models.CharField(choices = SCHOOL_CHOICES , default = 'S' , max_length = 10, null=True)
    schoolName = models.CharField(max_length = 100 , null = True)
    standard = models.CharField(choices = Class_CHOICES , default = '1' , max_length = 30 , null=True)
    street = models.TextField(max_length = 100 , null= True  )
    city = models.CharField(max_length = 25 , null= True  )
    pinCode = models.IntegerField(null= True )
    state = models.CharField(max_length = 20 , null= True )
    country = models.CharField(max_length = 20 , null= True )
    balance = models.IntegerField(default = 60)
    typ = models.CharField(choices = USER_TYPE , default = 'S' , max_length = 10 , null=True)
    parentEmail = models.EmailField(null = True)
    parentMobile = models.CharField(null = True , max_length = 14)

User.tutors24Profile = property(lambda u : Tutors24Profile.objects.get_or_create(user = u)[0])


class Session(models.Model):

    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    student = models.ForeignKey(User , related_name = 'studentSession' , null = False)
    tutor = models.ForeignKey(User , related_name = 'tutorSession' , null = True)
    start = models.DateTimeField(auto_now_add = True)
    end = models.DateTimeField(null = True)
    attachments = models.FileField(upload_to = getAttachmentPath ,  null = True)
    initialQuestion = models.CharField(max_length=4000, null=False)
    subject = models.ForeignKey(Subject , related_name = 'sessionSubject' , null = False)
    topic = models.ForeignKey(Topic , related_name = 'sessionTopic' , null = False)
    minutes = models.IntegerField(null= True )
    idle = models.IntegerField(null= True )
    ratings = models.IntegerField(null=True,validators=[MaxValueValidator(5), MinValueValidator(1)])
    ratingComments = models.CharField(max_length = 1000 , null= True )
    started = models.BooleanField(default=False)

class Transaction (models.Model):

    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    ref_id = models.IntegerField(null=True)
    mid = models.CharField(max_length=50)
    status = models.CharField(max_length=20 )
    source = models.CharField(max_length=50)
    amount = models.IntegerField(null= True)
    txn_id = models.CharField(max_length=50, null= True)
    bank_refno = models.CharField(max_length=50, null= True)
    name = models.CharField(max_length=60, null= True)
    email = models.EmailField(null = True)
    mobile = models.CharField(null = True , max_length = 14)
    Product_info = models.CharField(null = True , max_length = 60)
    before = models.PositiveIntegerField(null= True)
    after = models.PositiveIntegerField(null= True)
    value = models.PositiveIntegerField(null= True)
    promoCode = models.CharField(max_length=10, null= True)
    discount = models.FloatField(null= True)

class Message(models.Model):

    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    session = models.ForeignKey(Session , related_name = 'sessionMessage' , null = False)
    sender = models.ForeignKey(User , related_name = 'userSession' , null = False)
    attachment = models.FileField(upload_to = getMessageAttachmentPath ,  null = True)
    msg= models.CharField(max_length=300,null=True)

class SessionImage(models.Model):
    image = models.ImageField(null = False , upload_to = getImageUploadPath)
