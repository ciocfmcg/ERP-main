# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
# Create your models here.

PAYROLL_REPORT_STATUS_CHOICE = (
    ('created' , 'created'),
    ('submitted' , 'submitted'),
    ('approved' , 'approved'),
    ('processed' , 'processed'),
    ('reconciled' , 'reconciled')
)

class PayrollReport(models.Model):
    user = models.ForeignKey(User , related_name = "payrollReportsCreated" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    month = models.PositiveIntegerField(null = False)
    year = models.PositiveIntegerField(null = False)
    total = models.PositiveIntegerField(null = True)
    totalTDS = models.PositiveIntegerField(null = True)
    status = models.CharField(max_length = 30 , default = 'created' , choices = PAYROLL_REPORT_STATUS_CHOICE)
    dateOfProcessing = models.DateField(null = True)
    class Meta:
        unique_together = ('year', 'month',)

class Payslip(models.Model):
    user = models.ForeignKey(User , related_name = "payslips" , null=False)
    created = models.DateTimeField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    adHoc = models.PositiveIntegerField(default = 0)
    month = models.PositiveIntegerField(null = False)
    year = models.PositiveIntegerField(null = False)
    tds = models.FloatField(null=False)
    report = models.ForeignKey(PayrollReport , related_name = "payslips" , null = True)
    days = models.PositiveIntegerField(null = False)
    deffered = models.BooleanField(default = False)    
    amount = models.FloatField(null=False)
    totalPayable = models.FloatField(null=False)
    reimbursement = models.PositiveIntegerField(default = 0)
    class Meta:
        unique_together = ('year', 'month', 'user')
