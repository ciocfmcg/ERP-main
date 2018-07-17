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
        ('TechicalInterview' , 'TechicalInterviewing'),
        ('HRInterview' , 'HRInterview'),
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
    joiningDate = models.DateField(null = True)
    basic = models.PositiveIntegerField(default=0)
    hra = models.PositiveIntegerField(default=0)
    lta = models.PositiveIntegerField(default=0)
    special = models.PositiveIntegerField(default=0)
    taxSlab = models.PositiveIntegerField(default=0)
    adHoc = models.PositiveIntegerField(default=0)
    al = models.PositiveIntegerField(default=0)
    ml = models.PositiveIntegerField(default=0)
    adHocLeaves = models.PositiveIntegerField(default=0)
    amount = models.PositiveIntegerField(default=0)
    notice = models.PositiveIntegerField(default=0)
    probation = models.PositiveIntegerField(default=0)
    off = models.BooleanField(default=True)
    probationNotice = models.PositiveIntegerField(default=0)
    noticePeriodRecovery = models.BooleanField(default=False)

STATUS_INTERVIEW_CHOICES = (
        ('created' , 'created'),
        ('suitable' , 'suitable'),
        ('un-suitable' , 'un-suitable'),
        ('recommand-other-job' , 'recommand-other-job'),
)

MODE_INTERVIEW_CHOICES = (
        ('online' , 'online'),
        ('telephonic' , 'telephonic'),
        ('face-to-face' , 'face-to-face'),
)

class Interview(models.Model):
    interviewer = models.ForeignKey(User , related_name='interviwer', blank = True, null = True)
    comment =  models.CharField(max_length = 1000 , null = True)
    interviewDate = models.DateTimeField(null = True)
    status = models.CharField(max_length = 15 , choices = STATUS_INTERVIEW_CHOICES , default = 'created')
    mode = models.CharField(max_length = 15 , choices = MODE_INTERVIEW_CHOICES , default = 'online', null = True )
    candidate = models.ForeignKey(JobApplication , related_name='candidates', blank = True, null = True)
