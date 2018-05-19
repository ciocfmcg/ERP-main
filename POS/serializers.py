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
from ERP.models import service




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
        # print int(self.context['request'].data['productMeta'])
        p = Product(**validated_data)
        p.user = self.context['request'].user
        # p.productMeta = ProductMeta.objects.get(pk=int(self.context['request'].data['productMeta']))
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

        if 'typ' in self.context['request'].data and self.context['request'].data['typ']=='user':
            il = InventoryLog(before = instance.inStock , after = validated_data['inStock'],product = instance,typ = 'user' , user = self.context['request'].user)
            il.save()

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



class VendorProfileSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = VendorProfile
        fields = ('pk','created','updated','service','contactDoc','paymentTerm','contactPersonName','contactPersonNumber','contactPersonEmail')
    def create(self , validated_data):
        p = VendorProfile(**validated_data)
        p.service = service.objects.get(pk=self.context['request'].data['service'])

        try:
            p.save()
        except:
            raise ValidationError(detail={'PARAMS' : 'Service Profile already exists'} )
        return p

class PurchaseOrderSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    class Meta:
        model = PurchaseOrder
        fields = ('pk','user','created','updated','status','products','totalamount','service')
    def create(self , validated_data):
        p = PurchaseOrder(**validated_data)
        p.user = self.context['request'].user
        p.service = service.objects.get(pk=self.context['request'].data['service'])
        p.save()
        return p

class VendorServicesSerializer(serializers.ModelSerializer):
    product = ProductSerializer(many = False , read_only = True)
    class Meta:
        model = VendorServices
        fields = ('pk','vendor','product','rate','fulfilmentTime','logistics')
        read_only_fields = ( 'vendor' , 'product')
    def create(self , validated_data):
        p = VendorServices(**validated_data)
        p.vendor = VendorProfile.objects.get(pk=self.context['request'].data['vendor'])
        p.product = Product.objects.get(pk=self.context['request'].data['product'])
        p.save()
        return p

class VendorServicesLiteSerializer(serializers.ModelSerializer):
    service = serviceSerializer(many = False , read_only = True)
    vendor = VendorProfileSerializer(many = False , read_only = True)
    class Meta:
        model = VendorServices
        fields = ('pk','vendor','product','rate','fulfilmentTime','logistics','service')


class ProductVerientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVerient
        fields = ('pk','created','updated','sku','unitPerpack')
    def create(self , validated_data):
        v = ProductVerient(**validated_data)
        v.parent = Product.objects.get(pk=int(self.context['request'].data['parent']))
        v.save()
        return v



class ExternalOrdersSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalOrders
        fields = ('pk','created','updated','marketPlace','orderID','products','status','buyersPrice','tax','shipper','shipperAWB','shippingFees','shippingTax','marketPlaceTax','earnings','buyerPincode')
    # def create(self , validated_data):
    #     e = ExternalOrders(**validated_data)
    #     e.user = self.context['request'].user
    #     e.save()
    #     return e

class ExternalOrdersliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalOrders
        fields = ('pk','marketPlace','orderID')

class InventoryLogSerializer(serializers.ModelSerializer):
    externalOrder = ExternalOrdersliteSerializer(many = False , read_only = True)
    class Meta:
        model = InventoryLog
        fields = ('pk','user','created','updated','product','typ','before','after','externalOrder')

class ExternalOrdersQtyMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalOrdersQtyMap
        fields = ('pk','product','qty')
