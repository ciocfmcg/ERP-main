from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from ecommerce.models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from API.permissions import has_application_permission
from ERP.serializers import serviceLiteSerializer, addressSerializer
from POS.models import Product
from POS.serializers import ProductSerializer


class fieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = field
        fields = ( 'pk', 'fieldType' , 'unit' ,'name' , 'helpText' , 'default' ,'data')

class genericProductSerializer(serializers.ModelSerializer):
    fields = fieldSerializer(many = True, read_only = True)
    class Meta:
        model = genericProduct
        fields = ('pk' , 'fields' , 'name' , 'minCost' , 'visual')
    def create(self , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.configure'])
        gp = genericProduct(**validated_data)

        # try:
        #     gp.visual = self.context['request'].FILES['visual']
        # except:
        #     pass

        gp.save()
        flds = self.context['request'].data['fields']
        print flds, type(flds)
        if isinstance(flds , str) or isinstance(flds , unicode):
            flds = flds.split(',')
        for f in flds:
            gp.fields.add(field.objects.get(pk = f))
        gp.save()
        return gp
    def update(self , instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.configure'])

        for key in ['name', 'minCost', 'visual']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.fields.clear()
        instance.save()
        flds = self.context['request'].data['fields']
        print flds, type(flds)
        if isinstance(flds , str) or isinstance(flds , unicode):
            flds = flds.split(',')
        print flds
        for f in flds:
            instance.fields.add(field.objects.get(pk = f))
        instance.save()
        return instance


class mediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ('pk' , 'link' , 'attachment' , 'mediaType')
    def create(self ,  validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        m = media(**validated_data)
        m.user = u
        m.save()
        return m

class POSProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name')


class listingSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    product = POSProductSerializer(many = False , read_only = True)
    class Meta:
        model = listing
        fields = ('pk' , 'user' , 'product'  , 'approved' ,  'specifications' , 'files' , 'parentType' , 'source' )
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        print validated_data
        print self.context['request'].data['parentType'] , self.context['request'].data['product']
        l = listing(**validated_data)
        l.user =  u
        l.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        l.product = Product.objects.get(pk = self.context['request'].data['product'])
        l.save()
        if 'files' in self.context['request'].data:
            for m in self.context['request'].data['files']:
                l.files.add(media.objects.get(pk = m))
        l.save()
        return l

    def update(self , instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])

        instance.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        instance.product = Product.objects.get(pk = self.context['request'].data['product'])
        instance.save()

        if 'files' in self.context['request'].data:
            for m in self.context['request'].data['files']:
                instance.files.add(media.objects.get(pk = m))
        instance.save()
        return instance

class listingLiteSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    product = POSProductSerializer(many = False , read_only = True)
    parentType = genericProductSerializer(many = False , read_only = True)
    class Meta:
        model = listing
        fields = ('pk' ,  'approved' ,  'files' , 'parentType'  ,'specifications', 'product')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ( 'pk', 'created' , 'title' ,'dp' , 'parent')
