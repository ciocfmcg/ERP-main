from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models
from time import time



# Create your models here.
def getToolsFilePath(instance , filename ):
    return 'tools/fileChache/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getArchivedFilePath(instance , filename ):
    return 'tools/archive/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


API_ACCOUNT_TYPES = (
    ('trial' , 'trial'),
    ('community' , 'community'),
    ('commercial', 'commercial')
)

class ApiAccount(models.Model):
    user = models.ForeignKey(User , related_name='apiAccountsCreatedOrOwned' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    accountType = models.CharField(max_length = 10 , choices = API_ACCOUNT_TYPES , default = 'trial')
    remaining = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default = False)
    apiKey = models.CharField(max_length = 100, null = False)
    email = models.EmailField(null=True) # say this is an external user and to identify the owner this email can be used

class ApiAccountLog(models.Model):
    updated = models.DateTimeField(auto_now_add=True)
    usageAdded = models.PositiveIntegerField(default=0)
    accActive = models.BooleanField(default = True)
    account = models.ForeignKey(ApiAccount, related_name='logs', null = False)
    actor = models.ForeignKey(User, null = False)
    refID = models.CharField(max_length = 50, null = True)


class FileCache(models.Model):
    user = models.ForeignKey(User , related_name='fileChaches' , null = True)
    created = models.DateTimeField(auto_now_add=True)
    expiresOn = models.DateField(null=False)
    attachment = models.FileField(upload_to = getToolsFilePath , null = False)
    fileID = models.CharField(max_length = 100, null = False)
    # this is a hashed indentifier for this file
    account = models.ForeignKey(ApiAccount , related_name='files', null = True)


class ArchivedDocument(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    pdf = models.FileField(upload_to = getToolsFilePath , null = False)
    user = models.ForeignKey(User , related_name='filesArchived' , null = True)
    description = models.CharField(max_length = 500, null = True)
    title = models.CharField(max_length = 100, null = True)
    docID = models.CharField(max_length = 50, null = True)

DOCUMENT_PART_TYPES = (
    ('text' , 'text'),
    ('img' , 'img'),
)

DOCUMENT_PART_CATEGORY = (
    ('title', 'title'),
    ('para', 'para'),
    ('footnote', 'footnote'),
    ('table', 'table'),
    ('tableHeader', 'tableHeader'),
    ('other', 'other'),
)

class DocumentContent(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    doc = models.ForeignKey(ArchivedDocument , null =False)
    typ = models.CharField(default = 'text' , choices = DOCUMENT_PART_TYPES , max_length = 10)
    x = models.FloatField(null = True)
    y = models.FloatField(null = True)
    w = models.FloatField(null = True)
    h = models.FloatField(null = True)
    category = models.CharField(default = 'other' , choices = DOCUMENT_PART_CATEGORY , max_length = 10)
    pageNo = models.PositiveIntegerField(null = False)
    nlpResult = models.CharField(max_length = 3000 , null = True)
    text = models.CharField(max_length = 3000 , null = True)
