from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User
from organization.models import *
from time import time


JOB_TYPE_CHOICES = (
        ('Full Time' , 'Full Time'),
        ('Contract' , 'Contract'),
        ('Intern' , 'Intern')
)

STATUS_TYPE_CHOICES = (
        ('Created' , 'Created'),
        ('Approved' , 'Approved'),
        ('Active' , 'Active'),
        ('Closed' , 'Closed'),
)

class Jobs(models.Model):
    jobtype = models.CharField(max_length = 15 , choices = JOB_TYPE_CHOICES  , default = 'Intern' )
    unit = models.ForeignKey(Unit , null = True , related_name = "unit_a")
    department = models.ForeignKey(Departments , null = True , related_name = "department_a")
    role = models.ForeignKey(Role , null = True , related_name = "position_a")
    contacts = models.ManyToManyField(User , related_name='jobHeading' )
    skill = models.CharField(max_length = 200 , null = False)
    approved = models.BooleanField(default = False)
    maximumCTC = models.CharField(max_length = 15 , null = True)
    status = models.CharField(max_length = 15 , choices = STATUS_TYPE_CHOICES  , default = 'Created' )

STATUS_LIST_CHOICES = (
        ('Created' , 'Created'),
        ('Screening' , 'Screening'),
        ('SelfAssesmenent' , 'SelfAssesmenent'),
        ('TechInterviewing' , 'TechInterviewing'),
        ('HrInterviewing' , 'HrInterviewing'),
        ('Shortlisted' , 'Shortlisted'),
        ('Negotiation' , 'Negotiation'),
        ('Onboarding' , 'Onboarding'),
        ('Closed' , 'Closed'),
)

class JobApplication(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    firstname = models.CharField(max_length = 30 , null = True)
    lastname = models.CharField(max_length = 30 , null = True)
    email = models.EmailField(null = True)
    mobile = models.CharField(null=True , max_length=15)
    resume = models.FileField(upload_to = getDepartmentsLogoAttachmentPath , null = True)
    coverletter =  models.CharField(max_length = 4000 , null = True)
    status = models.CharField(max_length = 15 , choices = STATUS_LIST_CHOICES  , default = 'Created' )
    job = models.ForeignKey(Jobs , null = True , related_name = "jobs_applied")
    aggree = models.BooleanField(default = False)
