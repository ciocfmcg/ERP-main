from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from ERP.models import service
from projects.models import project
# Create your models here.

def getInvoicesPath(instance , filename ):
    return 'finance/invoices/%s_%s_%s' % (str(time()).replace('.', '_'),instance.user.username, filename)

class Account(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    number = models.PositiveIntegerField()
    ifsc = models.CharField(max_length = 15 , null = False)
    bank = models.CharField(max_length = 50 , null = False)
    bankAddress = models.TextField(max_length = 500 , null = False)
    contactPerson = models.ForeignKey(User , null = False , related_name = 'accountsManaging')
    authorizedSignaturies = models.ManyToManyField(User , related_name = 'checkingAccounts')


class CostCenter(models.Model):
    head = models.ForeignKey(User , null = False)
    name = models.CharField(max_length = 100 , blank = False)
    code = models.CharField(max_length = 50 , blank = False)
    created = models.DateTimeField(auto_now_add=True)
    account = models.ForeignKey(Account)


class Transaction(models.Model):
    fromAcc = models.ForeignKey(Account , null = False , related_name = 'debits')
    toAcc = models.ForeignKey(Account , null = False , related_name = 'credits')
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
    notes = models.TextField(max_length = 500 , null = True)
    project = models.ForeignKey(project , null = False)

class Invoice(models.Model):
    user = models.ForeignKey(User , related_name='invoiceGeneratedOrSubmitted' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    service = models.ForeignKey(service , null = False)
    amount = models.PositiveIntegerField(null=False , default=0)
    currency = models.CharField(max_length = 5 , choices = CURRENCY_CHOICES)
    dated = models.DateTimeField(null = False)
    attachment = models.FileField(upload_to = getInvoicesPath ,  null = True)
    sheet = models.ForeignKey(ExpenseSheet , related_name='invoices' , null = False)
