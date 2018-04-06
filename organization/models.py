# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

from django.contrib.auth.models import User
# Create your models here.
from time import time




def getDivisionLogoAttachmentPath(instance , filename ):
    return 'org/LOGO/%s_%s' % (str(time()).replace('.', '_'), filename)

def getDepartmentsLogoAttachmentPath(instance , filename ):
    return 'org/LOGO/%s_%s' % (str(time()).replace('.', '_'), filename)

def getRolesLogoAttachmentPath(instance , filename ):
    return 'org/LOGO/%s_%s' % (str(time()).replace('.', '_'), filename)

# Create your models here.
class Division(models.Model):
    name = models.CharField(max_length = 200 , null = False)
    website = models.CharField(max_length = 200 , null = False)
    contacts = models.ManyToManyField(User , related_name='divisionsHeading' )
    logo = models.FileField(upload_to = getDivisionLogoAttachmentPath , null = True)
    gstin = models.CharField(max_length = 200 , null = False)
    pan = models.CharField(max_length = 200 , null = False)
    cin = models.CharField(max_length = 200 , null = False)
    l1 = models.CharField(max_length = 200 , null = False)
    l2 = models.CharField(max_length = 200 , null = False)





class Units(models.Model):
    name = models.CharField(max_length = 200 , null = False)
    address = models.CharField(max_length = 400 , null = False)
    pincode = models.PositiveIntegerField(null=False)
    l1 = models.CharField(max_length = 200 , null = False)
    l2 = models.CharField(max_length = 200 , null = False)
    mobile = models.PositiveIntegerField(null=True , default=0)
    telephone = models.PositiveIntegerField(null=True , default=0)
    fax = models.PositiveIntegerField(null=True , default=0)
    contacts = models.ManyToManyField(User , related_name='unitsHeading' )
    division = models.ForeignKey(Division , null = True , related_name = "units")




class Departments(models.Model):
    dept_name = models.CharField(max_length = 400 , null = False)
    mobile = models.PositiveIntegerField(null=False)
    telephone = models.PositiveIntegerField(null=True , default=0)
    fax = models.PositiveIntegerField(null=True , default=0)
    contacts = models.ManyToManyField(User , related_name='departmentsHeading' )
    # units = models.ForeignKey(Units , null = True , related_name = "departments")
    picture = models.FileField(upload_to = getDepartmentsLogoAttachmentPath , null = True)
    units = models.ManyToManyField(Units , related_name='departmentsUnits' )



class Roles(models.Model):
    name = models.CharField(max_length = 200 , null = False)
    department = models.ForeignKey(Departments , null = True , related_name = "department")
