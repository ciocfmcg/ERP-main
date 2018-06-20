from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.



class Patient(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    firstName = models.CharField(max_length = 100 , null = False)
    lastName = models.CharField(max_length = 100 , null = False)
    gender = models.CharField(max_length = 100 , null = False)
    dateOfBirth = models.DateField( null= True )
    uniqueId = models.CharField(max_length = 100 , null = False)
    email = models.CharField(max_length = 100 , null = True)
    phoneNo = models.PositiveIntegerField(null=True)
    emergencyContact1 = models.PositiveIntegerField(null=True)
    emergencyContact2 = models.PositiveIntegerField(null=True)
    street = models.TextField(max_length = 100 , null= True )
    city = models.CharField(max_length = 15 , null= True )
    pin = models.IntegerField(null= True )
    state = models.CharField(max_length = 20 , null= True )
    country = models.CharField(max_length = 20 , null= True )

class PatientComments(models.Model):
    heading = models.CharField(max_length = 100 , null = False)
    data = models.CharField(max_length = 100 , null = False)
    user = models.ForeignKey(Patient , related_name='user')

STATUS_CHOICES = (
    ('checkedIn','checkedIn'),
    ('onGoingTreatment','onGoingTreatment'),
    ('operation','operation'),
    ('observation','observation'),
    ('readyToDischarged','readyToDischarged'),
    ('dishcharged','dishcharged'),
    ('settled','settled'),
)

class ActivePatient(models.Model):
    patient = models.ForeignKey(Patient , related_name='patient')
    inTime = models.DateTimeField( null= True )
    outTime = models.DateTimeField( null= True )
    status = models.CharField(choices = STATUS_CHOICES , max_length = 100 , null = False ,default='checkedIn')
    comments = models.ManyToManyField(PatientComments , related_name='comments' , blank = True)

class Product(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    rate = models.PositiveIntegerField(null=True)

class Invoice(models.Model):
    activePatient = models.ForeignKey(ActivePatient , related_name='activePatient')
    invoiceName = models.CharField(max_length = 20 , null= True )
    grandTotal = models.PositiveIntegerField(null=True, default = 0)
    quantity = models.CharField(max_length = 100 , default=1)
    products = models.CharField(max_length=10000,null=True)
