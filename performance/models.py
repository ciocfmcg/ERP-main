# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from projects.models import project
from django.contrib.auth.models import User
from datetime import datetime



# Create your models here.

STATUS_CHOICES = (
    ('created','created'),
    ('saved','saved'),
    ('submitted','submitted'),
    ('approved','approved')
)

class TimeSheet(models.Model):
    user = models.ForeignKey(User , related_name = "timeSheetCreated" , null=True)
    created = models.DateTimeField(auto_now_add = True)
    date = models.DateField(null=True)
    approved = models.BooleanField(default = False)
    approvedBy = models.ManyToManyField(User , related_name='times' , blank = True)
    status = models.CharField(choices = STATUS_CHOICES , max_length = 10 ,default='created', null = True)

    class Meta:
        unique_together = ('user', 'date',)



class TimeSheetItem(models.Model):
    parent = models.ForeignKey(TimeSheet , null = True , related_name='items')
    project = models.ForeignKey(project , related_name = 'projectsTime' ,null = True )
    duration = models.FloatField(null=False)
    comment = models.CharField(max_length = 10000 , null = True)
    approvalComment = models.CharField(max_length = 10000 , null = True)
