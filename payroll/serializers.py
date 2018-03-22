from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *


class payslipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payslip
        fields = ('pk','user', 'created','updated','adHoc','month','year','tds','days','deffered' , 'report' ,'amount','totalPayable','reimbursement')

class payrollReportSerializer(serializers.ModelSerializer):
    payslips = payslipSerializer(many=True , read_only=True)
    class Meta:
        model = PayrollReport
        fields = ('pk','user', 'created','updated','total','month','year','totalTDS','status','dateOfProcessing','payslips')
        read_only_fields = ('user',)

    def create(self , validated_data):
        pr = PayrollReport(**validated_data)
        pr.user = self.context['request'].user
        pr.save()
        return pr
