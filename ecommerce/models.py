from __future__ import unicode_literals
from time import time
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
from ERP.models import address , service
from POS.models import Product
# Create your models here.


def getEcommercePictureUploadPath(instance , filename ):
    return 'ecommerce/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getEcommerceProductVisualUploadPath(instance , filename ):
    return 'ecommerce/pictureUploads/%s_%s' % (str(time()).replace('.', '_'), filename)
def getEcommerceCategoryDpPath(instance , filename ):
    return 'ecommerce/CategoryDp/%s_%s' % (str(time()).replace('.', '_'), filename)

FIELD_TYPE_CHOCIE = (
    ('char' , 'char'),
    ('boolean' , 'boolean'),
    ('float' , 'float'),
    ('date' , 'date'),
    ('choice' , 'choice'),
)

class field(models.Model): # this will be used to build the form to be used to post a listing
    fieldType = models.CharField(choices = FIELD_TYPE_CHOCIE , default = 'char' , max_length = 15)
    unit = models.CharField( null = True , max_length = 50 ,blank = True)
    name = models.CharField( null = False , max_length = 50 , unique = True)
    created = models.DateTimeField(auto_now_add = True)
    helpText = models.CharField(max_length = 100 , blank = True)
    default = models.CharField(max_length = 100 , blank = True)
    data = models.CharField(max_length = 30000 , blank = True)


class genericProduct(models.Model): # such as MI5, Nokia N8 etc
    fields = models.ManyToManyField(field , related_name = 'products' , blank = True)
    name = models.CharField( null = False , max_length = 50)
    created = models.DateTimeField(auto_now_add = True)
    minCost = models.PositiveIntegerField(default=0)
    visual = models.ImageField(upload_to=getEcommerceProductVisualUploadPath , null = True)
    parent = models.ForeignKey('self' , related_name='children' , null= True)
    def __repr__(self):
        return  "Generic Product : " + self.name

MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceMediaUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getEcommercePictureUploadPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')


class DataField(models.Model):
    name = models.CharField( null = False , max_length = 100)
    value = models.CharField( null = True , max_length = 100)
    typ = models.CharField( null = True , max_length = 100)


class listing(models.Model):
    user = models.ForeignKey(User , related_name = 'ecommerceListings' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    product = models.ForeignKey(Product)
    approved = models.BooleanField(default = False)
    specifications = models.TextField(max_length = 2000 , null = False) # JSON data with key from one of the spec and value as the value for this perticular item
    files = models.ManyToManyField(media , related_name='listings' ,blank=True)
    parentType = models.ForeignKey(genericProduct , related_name='products' , null = True)
    source = models.TextField(max_length = 40000 , null = True ,blank=True)# ths may contain the html source for the description giving the admin a way to full featured webpage description
    dfs = models.ManyToManyField(DataField , blank = True)
    def __repr__(self):
        return  "Listing : " + self.product.name + self.specifications

    #l.dfs = [{name : 'screenSize' , value : '5'} , {name : 'brand' , value : 'nokia'}]



class Category(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField( null = False , max_length = 50)
    dp = models.ImageField(upload_to=getEcommerceCategoryDpPath , null = True)
    parent = models.ForeignKey('self' , related_name='parentCategory' , null= True)


def getEcommerceBannerUploadPath(instance , filename ):
    return 'ecommerce/bannerUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


class offerBanner(models.Model):
    user = models.ForeignKey(User, null = False)
    created = models.DateTimeField(auto_now_add = True)
    level = models.PositiveIntegerField(null = False) # level indicates the position of display , 1 means the main banner , 2 for side and 3 for flash messages
    image = models.ImageField(null = False , upload_to = getEcommerceBannerUploadPath)
    imagePortrait =  models.ImageField(null = True , upload_to = getEcommerceBannerUploadPath)
    title = models.CharField(max_length = 20 , null = True)
    subtitle = models.CharField(max_length = 20 , null = True)
    state = models.CharField(max_length = 20 , null = True)
    params = models.CharField(max_length = 200 , null = True) # string repr of json obj to be passed as params
    active = models.BooleanField(default = False)

CART_TYPE_CHOICES = (
    ('cart' , 'cart'),
    ('favourite' , 'favourite'),
)

class Cart(models.Model):
    product = models.ForeignKey(listing, null = False)
    user = models.ForeignKey(User, null = False)
    qty = models.PositiveIntegerField(null = True)
    typ = models.CharField(choices = CART_TYPE_CHOICES , max_length = 10 , default = 'cart')

User.cart = property(lambda u : Cart.objects.get_or_create(user = u)[0])

ACTIVITIES_TYPE_CHOICES = (
    ('productView' , 'productView'),
    ('categoryView' , 'categoryView'),
    ('checkingOut' , 'checkingOut'),
    ('loggedIn' , 'loggedIn'),
    ('productCmmts' , 'productCmmts'),
    ('removeFromCart' , 'removeFromCart'),
    ('pageView' , 'pageView'),
)


class Activities(models.Model):
    created = models.DateTimeField(auto_now_add = True , null = True)
    user = models.ForeignKey(User, null = False , related_name = 'ecommerceActivities')
    product = models.ForeignKey(listing, null = True)
    typ =  models.CharField(choices = ACTIVITIES_TYPE_CHOICES , max_length = 10 , default='loggedIn')
    data = models.CharField(max_length = 200 , null = True)

class Address(models.Model):
    user = models.ForeignKey(User , related_name = 'userAddress' , null = True , blank = True)
    title = models.CharField(max_length=100 , null = True , blank = True)
    street = models.CharField(max_length=300 , null = True , blank = True)
    city = models.CharField(max_length=100 , null = True , blank = True)
    state = models.CharField(max_length=50 , null = True , blank = True)
    pincode = models.PositiveIntegerField(null = True , blank = True)
    lat = models.CharField(max_length=15 ,null = True , blank = True)
    lon = models.CharField(max_length=15 ,null = True , blank = True)
    country = models.CharField(max_length = 50 , null = True , blank = True)

    def __unicode__(self):
        return '< street :%s>,<city :%s>,<state :%s>' %(self.street ,self.city, self.state)

PAYMENTMODE_CHOICES = (
    ('COD' , 'COD'),
    ('card' , 'card'),
    ('cash' , 'cash'),
)

ORDERSTATUS_CHOICES = (
    ('created' , 'created'),
    ('failed' , 'failed'),
    ('ordered' , 'ordered'),
    ('completed' , 'completed'),
)

SHOPPINGMODE_CHOICES = (
    ('online' , 'online'),
    ('offline' , 'offline'),
)

ORDERQTYMAP_CHOICES = (
    ('created' , 'created'),
    ('packed' , 'packed'),
    ('shipped' , 'shipped'),
    ('inTransit' , 'inTransit'),
    ('reachedNearestHub' , 'reachedNearestHub'),
    ('outForDelivery' , 'outForDelivery'),
    ('delivered' , 'delivered'),
    ('cancelled' , 'cancelled'),
    ('returnToOrigin' , 'returnToOrigin'),
    ('returned' , 'returned'),
)

class TrackingLog(models.Model):
    logTxt = models.CharField(max_length=200 ,null = True )
    time = models.DateTimeField(auto_now_add = True)

class OrderQtyMap(models.Model):
    trackingLog = models.ManyToManyField(TrackingLog , related_name='orderTrackLog' ,blank=True)
    product = models.ForeignKey(listing)
    qty = models.PositiveIntegerField(null = True , blank = True)
    totalAmount = models.PositiveIntegerField(null = True , blank = True)
    status = models.CharField(choices = ORDERQTYMAP_CHOICES , max_length = 10)
    updated = models.DateTimeField(auto_now=True)
    refundAmount = models.PositiveIntegerField(null = True , blank = True)
    discountAmount = models.PositiveIntegerField(null = True , blank = True)
    toBeRefunded = models.PositiveIntegerField(null = True , blank = True)
    cancellable = models.BooleanField(default = False)

class Order(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateTimeField(auto_now=True)
    user =  models.ForeignKey(User, null = False , related_name = 'orderUser')
    totalAmount = models.PositiveIntegerField(null = True , blank = True)
    orderQtyMap = models.ManyToManyField(OrderQtyMap , related_name='orderQty' ,blank=True)
    paymentMode = models.CharField(choices = PAYMENTMODE_CHOICES , max_length = 10)
    paymentRefId =  models.CharField(max_length=100 ,null = True , blank = True)
    paymentChannel = models.CharField(max_length=100 ,null = True , blank = True)
    modeOfShopping = models.CharField(choices = SHOPPINGMODE_CHOICES , max_length = 10)
    paidAmount = models.PositiveIntegerField(null = True , blank = True)
    paymentStatus = models.BooleanField(default = False)
    promoCode = models.CharField(max_length=100 ,null = True , blank = True)
    approved = models.BooleanField(default = False)
    status = models.CharField(choices = ORDERSTATUS_CHOICES , max_length = 10)
