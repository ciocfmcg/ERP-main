# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from time import time

def getWareHouseContractUploadPath(instance , filename ):
    return 'warehouse/contracts/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getWareHouseDocUploadPath(instance , filename ):
    return 'warehouse/docs/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)



class Service(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 100 , null = False, unique = True)
    user = models.ForeignKey(User , related_name = 'ServicesCreated' , null = False)
    cin = models.CharField(max_length = 100 , null = True)
    tin = models.CharField(max_length = 100 , null = True)
    telephone = models.CharField(max_length = 20 , null = True)
    street = models.CharField(max_length = 300 , null = True)
    pincode = models.PositiveIntegerField(null = True)
    city = models.CharField(max_length = 100 , null = True)
    state = models.CharField(max_length = 50 , null = True)
    country = models.CharField(max_length = 50 , null = True)

    def __str__(self):
        return self.name

class Contact(models.Model):
    user = models.ForeignKey(User , related_name = 'contactsCreated' , null = False)
    name = models.CharField(max_length = 100 , null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now = True)
    company = models.ForeignKey(Service , null = False , related_name = 'contacts')
    email = models.EmailField(null = True)
    mobile = models.CharField(max_length = 15 , null = True)
    designation = models.CharField(max_length = 30 , null = True)
    notes = models.TextField(max_length = 300 , null = True)

UNIT_TYPE = (
    ('sqft' , 'sqft'),
    ('msq' , 'msq'),

)

class Contract(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now = True)
    user = models.ForeignKey(User , related_name = 'contract' , null = False)
    company = models.ForeignKey(Service , null = False , related_name = 'contracts')
    billingFrequency = models.PositiveIntegerField(null = False)
    billingDates = models.CharField(max_length = 30, null=False)
    rate = models.IntegerField(null=False)
    quantity = models.IntegerField(null=False)
    unitType = models.CharField(choices = UNIT_TYPE, max_length = 15 , default = "sqft")
    dueDays = models.PositiveIntegerField(null = True)
    occupancy = models.CharField(max_length = 100, null = False)
    contractPaper = models.FileField(upload_to=getWareHouseContractUploadPath, null=True)
    otherDocs = models.FileField(upload_to=getWareHouseDocUploadPath, null = True)

CONTRACT_STATE_CHOICES = (
    ('quoted' , 'quoted'),
    ('cancelled' , 'cancelled'),
    ('approved' , 'approved'),
    ('billed' , 'billed'),
    ('received' , 'received'),
    ('dueElapsed' , 'dueElapsed'),
)

class Invoice(models.Model):
    contract = models.ForeignKey(Contract , null = False , related_name="invoices")
    data = models.CharField(max_length = 10000 , null = True)
    value = models.PositiveIntegerField(null = True , default=0)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now = True)
    status = models.CharField(choices = CONTRACT_STATE_CHOICES , max_length=12 , default = 'quoted')
