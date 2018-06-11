# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User, Group

# Create your models here.

class Tag(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 30,null = True)

class Contacts(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    referenceId = models.CharField(max_length = 20 , null = True , blank = True)
    name = models.CharField(max_length = 100 , null = True , blank = True)
    email = models.EmailField(null = True , blank = True , unique=True)
    mobile = models.CharField(max_length = 12 , null = True , blank = True , unique=True)
    source = models.CharField(max_length = 20 , null = True , blank = True)
    notes = models.TextField(max_length=500 , null=True , blank = True)
    tags = models.ManyToManyField(Tag)
    pinCode = models.CharField(max_length = 10 , null = True)

CAMPAIGN_STATUS = (
    ('created' , 'created'),
    ('started' , 'started'),
    ('closed' , 'closed')
)
CAMPAIGN_TYP = (
    ('email' , 'email'),
    ('sms' , 'sms'),
    ('call' , 'call')
)
class Campaign(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 150 , null = True , blank = True)
    tags = models.ManyToManyField(Tag)
    source = models.CharField(max_length = 1000 , null = True , blank = True)
    filterFrom = models.DateField(null = True , blank = True)
    filterTo = models.DateField(null = True , blank = True)
    status = models.CharField(choices = CAMPAIGN_STATUS , max_length = 15 , default = 'created')
    typ = models.CharField(choices = CAMPAIGN_TYP , max_length = 10 , null=True)
    participants = models.ManyToManyField(User , blank = True)
    msgBody = models.CharField(max_length = 1000 , null = True , blank = True)
    emailSubject = models.CharField(max_length = 1000 , null = True , blank = True)
    emailBody = models.CharField(max_length = 10000 , null = True , blank = True)
    directions = models.CharField(max_length = 10000 , null = True , blank = True)

LOG_TYP = (
    ('inbound' , 'inbound'),
    ('outbound' , 'smoutbounds'),
    ('emailSent' , 'emailSent'),
    ('emailRecieved' , 'emailRecieved'),
    ('smsSent' , 'smsSent'),
    ('smsRecieved' , 'smsRecieved'),
    ('task' , 'task'),
    ('comment' , 'comment'),
    ('closed' , 'closed'),
    ('converted' , 'converted')
)

class CampaignLogs(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user = models.ForeignKey(User ,related_name="CampaignLogs", null = True)
    contact = models.ForeignKey(Contacts , related_name="CampaignLogs",null=True)
    campaign = models.ForeignKey(Campaign , related_name="CampaignLogs",null=True)
    followupDate = models.DateTimeField(null = True , blank = True)
    data = models.CharField(max_length = 1000 , null = True , blank = True)
    typ = models.CharField(choices = LOG_TYP , max_length = 20 , null=True)
