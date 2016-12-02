from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from gitweb.serializers import repoLiteSerializer


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('created' , 'number' , 'ifsc' , 'bank'  , 'bankAddress' , 'contactPerson' , 'authorizedSignaturies')

class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCenter
        fields = ('head' , 'name' , 'code' , 'created' , 'account' , 'projects')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('fromAcc' , 'toAcc' , 'ammount' , 'user' , 'balance')

class ExpenseSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseSheet
        fields = ('user' , 'created' , 'approved' , 'approvalMatrix' , 'approvalStage' , 'dispensed' , 'notes' , 'project' , 'transaction')

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ('user' , 'created' , 'service' , 'amount' , 'currency' , 'dated' , 'attachment' , 'sheet')
