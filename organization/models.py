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
    l1 = models.CharField(max_length = 200 , null = True)
    l2 = models.CharField(max_length = 200 , null = True)





class Unit(models.Model):
    name = models.CharField(max_length = 200 , null = False)
    address = models.CharField(max_length = 400 , null = False)
    pincode = models.PositiveIntegerField(null=False)
    l1 = models.CharField(max_length = 200 , null = True)
    l2 = models.CharField(max_length = 200 , null = True)
    mobile = models.CharField(null=True , max_length=15)
    telephone = models.CharField(null=True , max_length=15)
    fax = models.CharField(null=True , max_length=15)
    contacts = models.ManyToManyField(User , related_name='unitsHeading' )
    division = models.ForeignKey(Division , null = True , related_name = "units")
    parent = models.ForeignKey("self" , related_name="children" , null = True )




class Departments(models.Model):
    dept_name = models.CharField(max_length = 400 , null = False)
    mobile = models.CharField(null=False, max_length = 15)
    telephone = models.PositiveIntegerField(null=True , default=0)
    fax = models.PositiveIntegerField(null=True , default=0)
    contacts = models.ManyToManyField(User , related_name='departmentsHeading' )
    # units = models.ForeignKey(Units , null = True , related_name = "departments")
    picture = models.FileField(upload_to = getDepartmentsLogoAttachmentPath , null = True)
    unit = models.ManyToManyField(Unit , related_name='departmentsUnits' )



class Role(models.Model):
    name = models.CharField(max_length = 200 , null = False)
    department = models.ForeignKey(Departments , null = True , related_name = "department")

class Responsibility(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User , related_name="responsibilitiesCreated" , null = False)
    title = models.CharField(max_length = 200 , null = False)
    departments = models.ManyToManyField(Departments , blank = True , related_name="responsibilities")
    data = models.CharField(max_length = 200 , null = True ,blank = True )

class KRAProgress(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    value = models.IntegerField(null=False)
    source = models.CharField(null = False , max_length= 200)
    user = models.ForeignKey(User , related_name="KRAAwarded")

KRA_TARGET_CHOICES = (
    ('yearly' , 'yearly'),
    ('quaterly' , 'quaterly'),
    ('monthly' , 'monthly'),
    ('weekly' , 'weekly'),
    ('daily' , 'daily'),
)


class KRA(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    responsibility = models.ForeignKey(Responsibility , null = False , related_name="KRAs")
    target = models.PositiveIntegerField(null = False)
    assignedBy = models.ForeignKey(User , related_name="KRAAssigned")
    progress = models.ManyToManyField(KRAProgress , related_name="KRA" , blank = True)
    user = models.ForeignKey(User , null = False , related_name="KRA")
    period = models.CharField(max_length = 20 , default = 'yearly' , choices = KRA_TARGET_CHOICES)
    weightage = models.IntegerField(null = True)
    class Meta:
        unique_together = ("user", "responsibility")
