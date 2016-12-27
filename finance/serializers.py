from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from gitweb.serializers import repoLiteSerializer
from ERP.serializers import serviceSerializer
from projects.serializers import projectLiteSerializer

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ('pk', 'created' , 'number' , 'ifsc' , 'bank'  , 'bankAddress' , 'contactPerson' , 'authorizedSignaturies')

class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostCenter
        fields = ('head' , 'name' , 'code' , 'created' , 'account' , 'projects')

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('pk', 'fromAcc' , 'toAcc' , 'ammount' , 'user' , 'balance')


class InvoiceSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = Invoice
        fields = ('pk', 'user' , 'created' , 'service' , 'amount' , 'currency' , 'dated' , 'attachment' , 'sheet', 'description', 'approved')
        read_only_fields = ('user',)

    def create(self , validated_data):
        u = self.context['request'].user
        print 'came to create an Invoce' , u
        inv = Invoice(**validated_data)
        inv.user = u
        inv.service = service.objects.get(pk = self.context['request'].data['service'])
        inv.approved = False
        inv.save()
        return inv

    def update(self, instance, validated_data):
        # if the user is manager or something then he can update the approved flag
        instance.service = service.objects.get(pk = self.context['request'].data['service'])
        for f in ['amount' , 'currency' , 'dated' , 'attachment' , 'sheet' , 'description']:
            setattr(instance , f , validated_data.pop(f))
        instance.save()
        return instance


class ExpenseSheetSerializer(serializers.ModelSerializer):
    invoices = InvoiceSerializer(many = True , read_only = True)
    project = projectLiteSerializer(many = False , read_only = True)
    class Meta:
        model = ExpenseSheet
        fields = ('pk','user' , 'created' , 'approved' , 'approvalMatrix' , 'approvalStage' , 'dispensed' , 'notes' , 'project' , 'transaction', 'invoices')
