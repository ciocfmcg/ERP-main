from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from ERP.serializers import serviceLiteSerializer , serviceSerializer , addressSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings
from clientRelationships.models import ProductMeta
from clientRelationships.serializers import ProductMetaSerializer



class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('pk' , 'user' ,'name', 'company', 'email', 'mobile' , 'notes' , 'pan' , 'gst' , 'street' , 'city' , 'state' , 'pincode' , 'country' ,  'streetBilling' , 'cityBilling' , 'stateBilling' , 'pincodeBilling' , 'countryBilling' , 'sameAsShipping')
        read_only_fields = ( 'user' , )
    def create(self , validated_data):
        c = Customer(**validated_data)
        c.user = self.context['request'].user
        c.save()
        return c

class ProductSerializer(serializers.ModelSerializer):
    productMeta=ProductMetaSerializer(many=False,read_only=True)
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name', 'productMeta', 'price', 'displayPicture', 'serialNo', 'description', 'inStock','cost','logistics','serialId','reorderTrashold')
        read_only_fields = ( 'user' , 'productMeta')
    def create(self , validated_data):
        print 'entered','***************'
        print self.context['request'].data
        print int(self.context['request'].data['productMeta'])
        p = Product(**validated_data)
        p.user = self.context['request'].user
        p.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
        p.save()
        return p
    # def update(self ,instance, validated_data):
    #     print 'entered','***************'
    #     # print self.context['request'].data
    #     # print int(self.context['request'].data['productMeta'])
    #     # p = Product(**validated_data)
    #     # p.user = self.context['request'].user
    #     instance.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
    #     instance.save()
    #     return instance
    def update(self ,instance, validated_data):
        print 'entered in updating ************************************'
        for key in ['name', 'price', 'displayPicture', 'serialNo', 'description', 'inStock','cost','logistics','serialId','reorderTrashold']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'productMeta' in self.context['request'].data:
            instance.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
        instance.save()
        return instance

class InvoiceSerializer(serializers.ModelSerializer):
    customer=CustomerSerializer(many=False,read_only=True)
    class Meta:
        model = Invoice
        fields = ('pk' , 'serialNumber', 'invoicedate' ,'reference' ,'duedate' ,'returnquater' ,'customer' ,'products', 'amountRecieved','modeOfPayment','received','grandTotal','totalTax','paymentRefNum','receivedDate')
        read_only_fields = ( 'user' , 'customer')
    def create(self , validated_data):
        print validated_data,'**************'
        print self.context['request'].data
        i = Invoice(**validated_data)
        i.customer = Customer.objects.get(pk=int(self.context['request'].data['customer']))
        i.save()
        return i
    # def update(self ,instance, validated_data):
    #     for key in ['serialNumber', 'invoicedate' ,'reference' ,'duedate' ,'returndate' ,'returnquater' ,'products']:
    #         try:
    #             setattr(instance , key , validated_data[key])
    #         except:
    #             pass
    #     if 'customer' in self.context['request'].data:
    #         instance.customer = Customer.objects.get(pk=int(self.context['request'].data['customer']))
    #     instance.save()
    #     return instance

class ProductVerientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVerient
        fields = ('pk','created','updated','sku','unitPerpack')
        # read_only_fields = ( 'user' , )
    def create(self , validated_data):
        v = ProductVerient(**validated_data)
        # v.parent = self.context['request'].parent
        v.parent = Product.objects.get(pk=int(self.context['request'].data['parent']))
        v.save()
        return v

class ProductMetaListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMetaList
        fields = ('pk','created','updated','description','code','taxRate','hsn','sac')
         # read_only_fields = ('user')

    def create(self , validated_data):
        r = ProductMetaList(**validated_data)
        # r.ProductMetaList = self.context['request'].ProductMetaList
        r.user = self.context['request'].user
        # v.productMetaList = ProductMetaList.objects.get(pk=int(self.context['request'].data['ProductMetaList']))
        r.save()
        return r
