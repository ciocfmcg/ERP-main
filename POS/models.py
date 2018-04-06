
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from time import time

def getPOSProductUploadPath(instance,filename):
    return "POS/displayPictures/%s_%s_%s"% (str(time()).replace('.','_'),instance.user.username,filename)

class Customer(models.Model):
    user = models.ForeignKey(User , related_name = 'posContacts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    company = models.CharField(max_length = 100 , null = True)
    email = models.EmailField(null = True)
    mobile = models.CharField(max_length = 12 , null = True)
    notes = models.TextField(max_length=10000 , null=True)
    pan = models.CharField(max_length = 100 , null = True)
    gst = models.CharField(max_length = 100 , null = True)
    street = models.CharField(max_length = 100 , null = True)
    city = models.CharField(max_length = 100 , null = True)
    state = models.CharField(max_length = 100 , null = True)
    pincode = models.CharField(max_length = 100 , null = True)
    country = models.CharField(max_length = 100 , null = True)
    sameAsShipping = models.BooleanField(default = False)
    streetBilling = models.CharField(max_length = 100 , null = True)
    cityBilling = models.CharField(max_length = 100 , null = True)
    stateBilling = models.CharField(max_length = 100 , null = True)
    pincodeBilling = models.CharField(max_length = 100 , null = True)
    countryBilling = models.CharField(max_length = 100 , null = True)

    def __str__(self):
        return self.name

from clientRelationships.models import ProductMeta

class Product(models.Model):
    user = models.ForeignKey(User , related_name = 'posProducts' , null = False) # the user created it
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length = 100 , null = False)
    productMeta = models.ForeignKey(ProductMeta , related_name="POSProducts" , null = True)
    price = models.FloatField(null=False)
    displayPicture = models.ImageField(upload_to=getPOSProductUploadPath,null=True)
    serialNo = models.CharField(max_length = 30, null=True)
    description = models.TextField(max_length=10000,null=True)
    inStock = models.IntegerField(default = 0)
    cost = models.PositiveIntegerField(default= 0)
    logistics = models.PositiveIntegerField(default = 0)
    serialId = models.CharField(max_length = 50, null=True)
    reorderTrashold = models.PositiveIntegerField(default = 0)

PAYMENT_CHOICES = (
    ('card' , 'card'),
    ('netBanking' , 'netBanking'),
    ('cash' , 'cash'),
    ('cheque' , 'cheque'),
    ('wallet' , 'wallet')
)

MONTH_CHOICES = (
    ('jan-march' , 'jan-march'),
    ('april-june' , 'april-june'),
    ('july-sep' , 'july-sep'),
    ('oct-dec' , 'oct-dec')
)


class Invoice(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    serialNumber = models.CharField(max_length = 100 , null = True)
    invoicedate = models.DateField(null=True)
    reference =   models.CharField(max_length = 100 , null = True)
    duedate =  models.DateField(null=True)
    # returndate =  models.DateField(null=True)
    returnquater =  models.CharField(choices = MONTH_CHOICES , max_length = 10 , null = True)
    customer=models.ForeignKey(Customer,null=True)
    products=models.CharField(max_length=10000,null=True)
    amountRecieved = models.PositiveIntegerField(default = 0)
    modeOfPayment = models.CharField(choices = PAYMENT_CHOICES , max_length = 10 , null = True)
    received = models.BooleanField(default = True)
    grandTotal = models.FloatField(null=False)
    totalTax = models.FloatField(null=False)
    paymentRefNum = models.PositiveIntegerField(default = 0)
    receivedDate = models.DateField(null=True)

class ProductVerient(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey(Product , related_name='parentProducts')
    sku = models.CharField(max_length=10000,null=True)
    unitPerpack = models.PositiveIntegerField(default = 0)

class ProductMetaList(models.Model):
    user = models.ForeignKey(User ,null = False , related_name ="productMetaList")
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    description = models.CharField(max_length=10000,null=True)
    code = models.PositiveIntegerField(default = 0)
    taxRate = models.PositiveIntegerField(default = 0)
    hsn = models.BooleanField(default = True)
    sac = models.BooleanField(default = True)

class ExternalOrdersQtyMap(models.Model):
    product = models.ForeignKey(Product , related_name='externalOrders')
    qty = models.PositiveIntegerField(default=1)

EXTERNAL_ORDER_STATUS_CHOICES = (
    ('new','new'),
    ('packed','packed'),
    ('shipped','shipped'),
    ('recieved','recieved'),
    ('paid','paid'),
    ('reconciled','reconciled'),
    ('cancelled','cancelled'), # when user cancelled it
    ('rto','rto'),
    ('returned','returned'),
)

class ExternalOrders(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    marketPlace = models.CharField(max_length = 50 , null = True)
    orderID = models.CharField(max_length = 100 , null = True)
    products = models.ManyToManyField(ExternalOrdersQtyMap , blank = False)
    status = models.CharField(max_length = 10 , default = 'new' , choices = EXTERNAL_ORDER_STATUS_CHOICES)
    buyersPrice = models.FloatField(null= True)
    tax = models.FloatField(null= True)
    shipper = models.CharField(max_length = 100 , null = True)
    shipperAWB = models.CharField(max_length = 100 , null = True)
    shippingFees = models.FloatField(null= True)
    shippingTax = models.FloatField(null= True)
    marketPlaceTax = models.FloatField(null= True)
    earnings = models.FloatField(null= True)
    buyerPincode = models.CharField(null= True , max_length = 7)

from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
from django.conf import settings as globalSettings
import requests
from ERP.models import application
@receiver(post_save, sender=Product, dispatch_uid="server_post_save")
def updateProductsStock(sender, instance, **kwargs):

    try:

        for p in application.objects.get(name = 'app.productsInventory').permissions.all():
            print "Sending to : " , p.user.username
            requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
                json={
                  'topic': 'service.dashboard.' + p.user.username,
                  'args': [{'type' : 'productsInventory' , 'action' : 'updated' , 'pk' : instance.pk , 'inStock'  : instance.inStock}]
                }
            )

        for u in User.objects.filter(is_superuser=True):
            print "Sending to : " , u.username
            requests.post("http://"+globalSettings.WAMP_SERVER+":8080/notify",
                json={
                  'topic': 'service.dashboard.' + u.username,
                  'args': [{'type' : 'productsInventory' , 'action' : 'updated' , 'pk' : instance.pk , 'inStock'  : instance.inStock}]
                }
            )
    except:
        pass
