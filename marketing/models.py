# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.


class Contacts(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    referenceId = models.CharField(max_length = 20 , null = True , blank = True)
    name = models.CharField(max_length = 100 , null = True , blank = True)
    email = models.EmailField(null = True , blank = True , unique=True)
    mobile = models.CharField(max_length = 12 , null = True , blank = True , unique=True)
    source = models.CharField(max_length = 20 , null = True , blank = True)
    notes = models.TextField(max_length=500 , null=True , blank = True)
