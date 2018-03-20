# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
from time import time
from django.dispatch import receiver
from django.db.models.signals import pre_save
import pytz
from ERP.models import service

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

class Space(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now = True)
    user = models.ForeignKey(User , related_name = 'spaces' , null = False)
    name = models.CharField(max_length = 100 , null = False)
    areas = models.CharField(max_length = 50000 , null = False)
    code = models.CharField(max_length = 100 , null = False)

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
    occupancy = models.CharField(max_length = 50000, null = False)
    areas = models.ForeignKey(Space , related_name='contractSpace' , null=True)
    contractPaper = models.FileField(upload_to=getWareHouseContractUploadPath, null=True)
    otherDocs = models.FileField(upload_to=getWareHouseDocUploadPath, null = True)
    occupancy_screenshort = models.CharField(max_length = 100000 , null = True)
    dueDate = models.DateField(null = True)

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

class Checkin(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now = True)
    # user = models.ForeignKey(User , related_name = 'contract' , null = False)
    contract = models.ForeignKey(Contract , null = True , related_name="checkins")
    description = models.CharField(max_length = 10000 , null = False)
    height = models.PositiveIntegerField(null = True)
    width = models.PositiveIntegerField(null = True)
    length = models.PositiveIntegerField(null = True)
    weight = models.PositiveIntegerField(null = True)
    checkedin = models.BooleanField(default = True)
    qty = models.FloatField(null = True)

CHECKOUT_TYPE_CHOICES = (
    ('qty', 'qty'),
    ('percent', 'percent'),
)

class Checkout(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now = True)
    user = models.ForeignKey(User , related_name = 'wareHouseCheckouts' , null = False)
    parent = models.ForeignKey(Checkin , related_name='checkouts' , null= False)
    typ = models.CharField(max_length = 10 , default = 'qty' , choices = CHECKOUT_TYPE_CHOICES )
    initial = models.FloatField(null = False)
    value = models.FloatField(null = False)
    final = models.FloatField(null = False)
