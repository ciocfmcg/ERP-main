from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from ERP.models import service
from time import time
# Create your models here.
def getClientRelationshipContactDP(instance , filename ):
    return 'clientRelationships/dp/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class Contact(models.Model):
    user = models.ForeignKey(User , related_name = 'contacts' , null = False) # the user created it
    name = models.CharField(max_length = 100 , null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    company = models.ForeignKey(service , null = True , related_name='contacts')
    email = models.EmailField(null = True)
    emailSecondary = models.EmailField(null = True)
    mobile = models.CharField(max_length = 12 , null = True)
    mobileSecondary = models.CharField(max_length = 12 , null = True)
    designation = models.CharField(max_length = 30 , null = True)
    notes = models.TextField(max_length=300 , null=True)
    linkedin = models.CharField(max_length = 100 , null = True)
    facebook = models.CharField(max_length = 100 , null = True)
    dp = models.FileField(null = True , upload_to = getClientRelationshipContactDP)
    male = models.BooleanField(default = True)

CURRENCY_CHOICES = (
    ('INR' , 'INR'),
    ('USD' , 'USD')
)


DEAL_STATE_CHOICES = (
    ('created' , 'created'),
    ('contacted' , 'contacted'),
    ('demo' , 'demo'),
    ('requirements' , 'requirements'),
    ('proposal' , 'proposal'),
    ('negotiation' , 'negotiation'),
    ('conclusion' , 'conclusion'),
)

RELATION_CHOICES = (
    ('onetime' , 'onetime'),
    ('request' , 'request'),
    ('day' , 'day'),
    ('hour' , 'hour'),
    ('monthly' , 'monthly'),
    ('yearly' , 'yearly')
)

RESULT_CHOICES = (
    ('na' , 'na'),
    ('won' , 'won'),
    ('lost' , 'lost'),
)

class Deal(models.Model):
    user = models.ForeignKey(User , related_name = 'dealsCreated' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 100 , null = False)
    updated = models.DateTimeField(auto_now=True)
    company = models.ForeignKey(service , null = False , related_name='deals')
    value = models.PositiveIntegerField(null=True , default=0)
    currency = models.CharField(choices = CURRENCY_CHOICES , max_length = 4 , default = 'INR')
    state = models.CharField(choices = DEAL_STATE_CHOICES , max_length = 13 , default = 'created')
    contacts = models.ManyToManyField(Contact , related_name='deals' , blank = True)
    internalUsers = models.ManyToManyField(User , related_name='deals' , blank = True)
    requirements = models.TextField(max_length=10000 , null=True)
    probability = models.SmallIntegerField(default=100)
    closeDate = models.DateTimeField(null = True)
    active = models.BooleanField(default = True)
    result = models.CharField(choices = RESULT_CHOICES , max_length = 4 , default = 'na')
    relation = models.CharField(choices = RELATION_CHOICES , default = 'onetime' , max_length = 10)


def getClientRelationshipContract(instance , filename ):
    return 'clientRelationships/contracts/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)



def getClientRelationshipActivity(instance , filename ):
    return 'clientRelationships/activity/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

CONTRACT_STATE_CHOICES = (
    ('quoted' , 'quoted'),
    ('approved' , 'approved'),
    ('billed' , 'billed'),
    ('received' , 'received'),
)

class Contract(models.Model):
    user = models.ForeignKey(User , related_name = 'contracts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    doc = models.FileField(upload_to= getClientRelationshipContract , null = False)
    value = models.PositiveIntegerField(default=0)
    deal = models.ForeignKey(Deal , null = False)
    status = models.CharField(choices = CONTRACT_STATE_CHOICES , max_length=10 , default = 'quoted')
    details = models.TextField(max_length=10000 , null=False)

ACTIVITY_CHOICES = (
    ('call', 'call'),
    ('meeting', 'meeting'),
    ('mail', 'mail'),
    ('todo', 'todo'),
    ('note', 'note'),
    ('stateChange', 'stateChange'),
)

class Activity(models.Model):
    user = models.ForeignKey(User , related_name = 'activities' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    typ = models.CharField(choices = ACTIVITY_CHOICES , default = 'call', max_length =11 )
    data = models.CharField(max_length = 300 , null = False)
    deal = models.ForeignKey(Deal, related_name = 'activities' , null = True)
    contact = models.ForeignKey(Contact, related_name = 'activities' , null = True)
    notes = models.TextField(max_length= 1000 , null = True)
    doc = models.FileField(upload_to= getClientRelationshipActivity , null = True)
    contacts = models.ManyToManyField(Contact , related_name='activitiesMentioned', blank=True)
    internalUsers = models.ManyToManyField(User , related_name='activitiesMentioned', blank=True)
