from django.db import models

# Create your models here.

class Registration(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    token = models.CharField(max_length = 50 , null = False)
    emailOTP = models.CharField(max_length = 6 , null = False)
    mobileOTP = models.CharField(max_length = 6 , null = False)
    email = models.CharField(max_length = 60 , null = True)
    mobile = models.CharField(max_length = 15 , null = True)
