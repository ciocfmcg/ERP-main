# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Asset(models.Model):
    user = models.ForeignKey(User , related_name = "assetCreated" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = True)
    brand =  models.CharField(max_length = 100 , null = True)
    modelNo = models.CharField(max_length = 50 , null = True)

class Checkin(models.Model):
    user = models.ForeignKey(User , related_name = 'assetsCheckedIn' , null = False)
    serialNos = models.CharField(max_length = 500 , null = True)
    warrantyTill  = models.DateField(null=True)
    manufacturedOn = models.DateField(null=True)
    qty = models.PositiveIntegerField(null = True)
    poNumber = models.PositiveIntegerField(null = True)
    asset = models.ForeignKey(Asset , related_name ="checkins" , null = False)

class Allotment(models.Model):
    user = models.ForeignKey(User , related_name = 'allotment' , null = False)
    to = models.ForeignKey(User , related_name = 'assetsAlloted' , null = False)
    serialNo = models.CharField(max_length = 500 , null = True)
    approvedBy = models.ForeignKey(User , related_name = 'approvedBy' , null = False)
    comments = models.CharField(max_length = 100 , null = True)
    refurbished = models.BooleanField(default = False)
    asset = models.ForeignKey(Asset , related_name ="allotments" , null = False)
    returned = models.BooleanField(default = False)
    returnComment = models.CharField(max_length = 200 , null = True)

class Checkout(models.Model):
    user = models.ForeignKey(User , related_name = 'assetsCheckedOut' , null = False)
    reason = models.CharField(max_length = 200 , null = True)
    sentTo = models.CharField(max_length = 100 , null = True)
    quantity = models.PositiveIntegerField(null = True)
