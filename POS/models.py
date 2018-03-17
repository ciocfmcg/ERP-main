
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from time import time

def getPOSProductUploadPath(instance,filename):
    return "POS/displayPictures/%s_%s_%s"% (str(time()).replace('.','_'),instance.user.username,filename)

class Customer(models.Model):
    user = models.ForeignKey(User , related_name = 'posContacts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    company = models.CharField(max_length = 100 , null = True)
    email = models.EmailField(null = True)
    mobile = models.CharField(max_length = 12 , null = True)
    notes = models.TextField(max_length=10000 , null=True)
    pan = models.CharField(max_length = 100 , null = True)
    gst = models.CharField(max_length = 100 , null = True)
    street = models.CharField(max_length = 100 , null = True)
    city = models.CharField(max_length = 100 , null = True)
    state = models.CharField(max_length = 100 , null = True)
    pincode = models.CharField(max_length = 100 , null = True)
    country = models.CharField(max_length = 100 , null = True)
    sameAsShipping = models.BooleanField(default = False)
    streetBilling = models.CharField(max_length = 100 , null = True)
    cityBilling = models.CharField(max_length = 100 , null = True)
    stateBilling = models.CharField(max_length = 100 , null = True)
    pincodeBilling = models.CharField(max_length = 100 , null = True)
    countryBilling = models.CharField(max_length = 100 , null = True)

    def __str__(self):
        return self.name

from clientRelationships.models import ProductMeta

class Product(models.Model):
    user = models.ForeignKey(User , related_name = 'posProducts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    productMeta = models.ForeignKey(ProductMeta , related_name="POSProducts" , null = True)
    price = models.FloatField(null=False)
    displayPicture = models.ImageField(upload_to=getPOSProductUploadPath,null=True)
    serialNo = models.CharField(max_length = 30, null=True)
    description = models.TextField(max_length=10000,null=True)
    inStock = models.IntegerField(default = 0)
    cost = models.PositiveIntegerField(default= 0)
    logistics = models.PositiveIntegerField(default = 0)

PAYMENT_CHOICES = (
    ('card' , 'card'),
    ('netBanking' , 'netBanking'),
    ('cash' , 'cash'),
    ('cheque' , 'cheque'),
    ('wallet' , 'wallet')
)

MONTH_CHOICES = (
    ('jan-march' , 'jan-march'),
    ('april-june' , 'april-june'),
    ('july-sep' , 'july-sep'),
    ('oct-dec' , 'oct-dec')
)


class Invoice(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    serialNumber = models.CharField(max_length = 100 , null = True)
    invoicedate = models.DateField(null=True)
    reference =   models.CharField(max_length = 100 , null = True)
    duedate =  models.DateField(null=True)
    # returndate =  models.DateField(null=True)
    returnquater =  models.CharField(choices = MONTH_CHOICES , max_length = 10 , null = True)
    customer=models.ForeignKey(Customer,null=True)
    products=models.CharField(max_length=10000,null=True)
    amountRecieved = models.PositiveIntegerField(default = 0)
    modeOfPayment = models.CharField(choices = PAYMENT_CHOICES , max_length = 10 , null = True)
    received = models.BooleanField(default = True)
    grandTotal = models.FloatField(null=False)
    totalTax = models.FloatField(null=False)
    paymentRefNum = models.PositiveIntegerField(default = 0)
    receivedDate = models.DateField(null=True)
