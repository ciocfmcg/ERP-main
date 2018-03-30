# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from django.contrib.auth.models import User
from organization.models import *
# Create your models here.
from time import time

def getDivisionLogoAttachmentPath(instance , filename ):
    return 'org/LOGO/%s_%s' % (str(time()).replace('.', '_'), filename)

def getDepartmentsLogoAttachmentPath(instance , filename ):
    return 'org/LOGO/%s_%s' % (str(time()).replace('.', '_'), filename)

def getRolesLogoAttachmentPath(instance , filename ):
    return 'org/LOGO/%s_%s' % (str(time()).replace('.', '_'), filename)

JOB_TYPE_CHOICES = (
        ('Full Time' , 'Full Time'),
        ('Contract' , 'Contract'),
        ('Intern' , 'Intern')
)

class Jobs(models.Model):
    jobtype = models.CharField(max_length = 15 , choices = JOB_TYPE_CHOICES  , default = 'Intern' )
    unit = models.ForeignKey(Units , null = True , related_name = "unit_a")
    department = models.ForeignKey(Departments , null = True , related_name = "department_a")
    role = models.ForeignKey(Roles , null = True , related_name = "position_a")
    contacts = models.ManyToManyField(User , related_name='jobHeading' )
    skill = models.CharField(max_length = 200 , null = False)
