from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from ERP.models import service

# Create your models here.

def getInvoicesPath(instance , filename ):
    return 'finance/invoices/%s_%s_%s' % (str(time()).replace('.', '_'),instance.user.username, filename)

class Transaction(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    fromAcc = models.PositiveIntegerField()
    fromIFSC = models.CharField(max_length = 10)
    toAcc = models.PositiveIntegerField()
    toIFSC = models.CharField(max_length = 10)
    ammount = models.PositiveIntegerField()
    user = models.ForeignKey(User , related_name='transactions' , null = False)

CURRENCY_CHOICES = (
    ('INR' , 'INR'),
    ('USD' , 'USD'),
)

class ExpenseSheet(models.Model):
    user = models.ForeignKey(User , related_name='expenseGeneratedOrSubmitted' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    approved = models.BooleanField(default = False)
    approvalMatrix = models.PositiveSmallIntegerField(default=1)
    approvalStage = models.PositiveSmallIntegerField(default=0)
    dispensed = models.BooleanField(default = False)
    settlement = models.ForeignKey(Transaction , null = True)


class Invoice(models.Model):
    user = models.ForeignKey(User , related_name='invoiceGeneratedOrSubmitted' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    service = models.ForeignKey(service , null = False)
    amount = models.PositiveIntegerField(null=False , default=0)
    currency = models.CharField(max_length = 5 , choices = CURRENCY_CHOICES)
    dated = models.DateTimeField(null = False)
    attachment = models.FileField(upload_to = getInvoicesPath ,  null = True)
    sheet = models.ForeignKey(ExpenseSheet , related_name='invoices' , null = False)
