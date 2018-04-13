from django.db import models
from django.contrib import admin
# Create your models here.

class Registration(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    token = models.CharField(max_length = 50 , null = False)
    emailOTP = models.CharField(max_length = 6 , null = False)
    mobileOTP = models.CharField(max_length = 6 , null = False)
    email = models.CharField(max_length = 60 , null = True)
    mobile = models.CharField(max_length = 15 , null = True)

class EnquiryAndContacts(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    name = models.CharField(max_length = 100 , null = False)
    mobile = models.CharField(max_length = 20 , null = False)
    email = models.CharField(max_length = 100 , null = False)
    notes = models.CharField(max_length = 100 , null = True) # somtimes company name or sometimes message

class EnquiryAndContactsAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'mobile', 'email', 'notes')
    list_display_links = ('id',)
    search_fields = ('name',)
    list_per_page = 25

admin.site.register(EnquiryAndContacts , EnquiryAndContactsAdmin)
