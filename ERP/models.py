from __future__ import unicode_literals
from django.contrib.auth.models import User, Group
from time import time
from django.db import models

# Create your models here.

def getERPPictureUploadPath(instance , filename ):
    return 'ERP/pictureUploads/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


class device(models.Model):
    sshKey = models.CharField(max_length = 500 , null = True)
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 50)

class profile(models.Model):
    user = models.ForeignKey(User , null =False , related_name='gitProfile')
    devices = models.ManyToManyField(device)

class module(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False , unique = True)
    description = models.CharField(max_length = 500 , null = False)
    icon = models.CharField(max_length = 20 , null = True )
    haveCss = models.BooleanField(default = True)
    haveJs = models.BooleanField(default = True)

class application(models.Model):
    # each application in a module will have an instance of this model
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False , unique = True)
    owners = models.ManyToManyField(User , related_name = 'appsManaging' , blank = True)
    icon = models.CharField(max_length = 20 , null = True )
    haveCss = models.BooleanField(default = True)
    haveJs = models.BooleanField(default = True)
    inMenu = models.BooleanField(default = True)
    # only selected users can assign access to the application to other user
    module = models.ForeignKey(module , related_name = "apps" , null=False)
    description = models.CharField(max_length = 500 , null = False)
    canConfigure = models.ForeignKey("self" , null = True, related_name="canBeConfigureFrom")
    def __unicode__(self):
        return self.name

class appSettingsField(models.Model):
    FIELD_TYPE_CHOICES = (
        ('flag' , 'flag'),
        ('value' , 'value')
    )
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 50 , null = False )
    flag = models.BooleanField(default = False)
    value = models.CharField(max_length = 5000 , null = True)
    description = models.CharField(max_length = 500 , null = False)
    app = models.ForeignKey(application , related_name='settings' , null = True)
    fieldType = models.CharField(choices = FIELD_TYPE_CHOICES , default = 'flag' , null = False , max_length = 5)
    def __unicode__(self):
        return self.name
    class Meta:
        unique_together = ('name', 'app',)

class PublicApiKeys(models.Model):
    active = models.BooleanField(default = False)
    user = models.ForeignKey(User , related_name='publicApiKeysOwned') # the user who is authorized to use this api
    key = models.CharField(max_length = 30 , null = False)
    created = models.DateTimeField(auto_now_add=True)
    admin = models.ForeignKey(User , related_name = 'apiKeyAdministrator') # who kind of created it and can toggle active flag
    usageRemaining = models.PositiveIntegerField(default=0) # balance remaining
    app = models.ForeignKey(application , null = False)

class ApiUsage(models.Model): # to store the monthly api usage for the api
    api = models.ForeignKey(PublicApiKeys, related_name= 'usages')
    count = models.PositiveIntegerField(default=0)
    month = models.PositiveIntegerField(default=0) # assuming 0 for the month of January 2017 and 1 for february and so on

class permission(models.Model):
    app = models.ForeignKey(application , null=False , related_name="permissions")
    user = models.ForeignKey(User , related_name = "accessibleApps" , null=False)
    givenBy = models.ForeignKey(User , related_name = "approvedAccess" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    def __unicode__(self):
        return self.app.name

class groupPermission(models.Model):
    app = models.ForeignKey(application , null=False)
    group = models.ForeignKey(Group , related_name = "accessibleApps" , null=False)
    givenBy = models.ForeignKey(User , related_name = "approvedGroupAccess" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    def __unicode__(self):
        return self.app

MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'serviceDocsUploaded' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getERPPictureUploadPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')

class address(models.Model):
    street = models.CharField(max_length=300 , null = True)
    city = models.CharField(max_length=100 , null = True)
    state = models.CharField(max_length=50 , null = True)
    pincode = models.PositiveIntegerField(null = True)
    lat = models.CharField(max_length=15 ,null = True)
    lon = models.CharField(max_length=15 ,null = True)
    country = models.CharField(max_length = 50 , null = True)

    def __unicode__(self):
        return '< street :%s>,<city :%s>,<state :%s>' %(self.street ,self.city, self.state)

class service(models.Model): # contains other companies datails
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 100 , null = False, unique = True)
    user = models.ForeignKey(User , related_name = 'servicesCreated' , null = False) # the responsible person for this service
    address = models.ForeignKey(address , null = True )
    mobile = models.CharField(max_length = 20 , null = True)
    telephone = models.CharField(max_length = 20 , null = True)
    about = models.TextField(max_length = 2000 , null = True)
    cin = models.CharField(max_length = 100 , null = True) # company identification number
    tin = models.CharField(max_length = 100 , null = True) # tax identification number
    logo = models.CharField(max_length = 200 , null = True) # image/svg link to the logo
    web = models.TextField(max_length = 100 , null = True) # image/svg link to the logo
    doc  = models.ForeignKey(media , related_name = 'services' , null = True)

    def __unicode__(self):
        return '< name :%s>,<user :%s>,<address :%s>' %(self.name ,self.user.username, self.address)
