from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from ERP.models import service
from time import time
# Create your models here.

def getProductDP(instance , filename ):
    return 'clientRelationships/dp/%s_%s' % (str(time()).replace('.', '_'), filename)


class Product(models.Model):
    name = models.CharField(max_length = 100 , null = False)
    rate = models.PositiveIntegerField( null = False)
    dp = models.FileField(null = False , upload_to = getProductDP)
    serial = models.CharField(max_length = 6 , null = False)


class Ticket(models.Model):
    name = models.CharField(max_length = 100 , null = False)
    ticketID = models.PositiveIntegerField(null = False)
    description = models.TextField(max_length = 2000 , null = False)
