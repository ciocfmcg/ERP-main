from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from ERP.models import service
from time import time
from django.dispatch import receiver
from django.db.models.signals import pre_save
from datetime import datetime
import pytz
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

def getClientRelationshipContract(instance , filename ):
    return 'clientRelationships/contracts/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


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
    doc = models.FileField(upload_to= getClientRelationshipContract , null = True)
    rate = models.PositiveIntegerField(null=True , default=0)
    duePenalty = models.PositiveIntegerField(null=True , default=0)
    duePeriod = models.PositiveIntegerField(null = False , default=7) #  7 days by default

def getClientRelationshipActivity(instance , filename ):
    return 'clientRelationships/activity/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

CONTRACT_STATE_CHOICES = (
    ('cancelled' , 'cancelled'),
    ('quoted' , 'quoted'),
    ('approved' , 'approved'),
    ('billed' , 'billed'),
    ('received' , 'received'),
    ('dueElapsed' , 'dueElapsed'),
)

PRODUCT_META_TYPE_CHOICES = (
    ('HSN' , 'HSN'),
    ('SAC' , 'SAC')
)

class ProductMeta(models.Model):
    description = models.CharField(max_length = 500 , null = False)
    typ = models.CharField(max_length = 5 , default = 'HSN' , choices = PRODUCT_META_TYPE_CHOICES)
    code = models.PositiveIntegerField(null=False)
    taxRate = models.PositiveIntegerField(null = False)

class Contract(models.Model): # invoices actually
    user = models.ForeignKey(User , related_name = 'contracts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True) # quoted date
    updated = models.DateTimeField(auto_now=True)
    value = models.PositiveIntegerField(default=0)
    deal = models.ForeignKey(Deal , null = False , related_name='contracts')
    status = models.CharField(choices = CONTRACT_STATE_CHOICES , max_length=10 , default = 'quoted')
    dueDate = models.DateField(null = True)
    details = models.TextField(max_length=10000 , null=True)
    # relation = models.CharField(choices = RELATION_CHOICES , default = 'onetime' , max_length = 10)
    data = models.CharField(null = True , max_length = 10000)
    billedDate = models.DateTimeField(null = True)
    recievedDate = models.DateTimeField(null = True)
    archivedDate = models.DateTimeField(null = True)
    grandTotal = models.PositiveIntegerField(default=0)

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

@receiver(pre_save, sender=Contract, dispatch_uid="update_contract_details")
def update_contract_details(sender, instance, **kwargs):
    print "setting the dates"
    if instance.status == 'billed':
        instance.billedDate = datetime.now(pytz.timezone('Asia/Kolkata'))
    elif instance.status == 'received':
        instance.recievedDate = datetime.now(pytz.timezone('Asia/Kolkata'))
    elif instance.status == 'cancelled':
        instance.archivedDate = datetime.now(pytz.timezone('Asia/Kolkata'))
