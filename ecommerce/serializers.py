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
import json
from HR.models import profile


class fieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = field
        fields = ( 'pk', 'fieldType' , 'unit' ,'name' , 'helpText' , 'default' ,'data')

class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class genericProductLiteSerializer(serializers.ModelSerializer):
    parent = RecursiveField(many=False)
    class Meta:
        model = genericProduct
        fields = ('pk' ,  'name' ,  'parent')

class genericProductSerializer(serializers.ModelSerializer):
    fields = fieldSerializer(many = True, read_only = True)
    parent = genericProductLiteSerializer(many = False, read_only = True)
    class Meta:
        model = genericProduct
        fields = ('pk' , 'fields' , 'name' , 'minCost' , 'visual' , 'parent')
    def create(self , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.configure'])
        gp = genericProduct(**validated_data)
        if 'parent' in self.context['request'].data:
            gp.parent = genericProduct.objects.get(pk=int(self.context['request'].data['parent']))

        # try:
        #     gp.visual = self.context['request'].FILES['visual']
        # except:
        #     pass

        gp.save()
        flds = self.context['request'].data['fields']
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
        if 'parent' in self.context['request'].data:
            instance.parent = genericProduct.objects.get(pk=int(self.context['request'].data['parent']))
        instance.fields.clear()
        instance.save()
        flds = self.context['request'].data['fields']
        if isinstance(flds , str) or isinstance(flds , unicode):
            flds = flds.split(',')
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
    discountedPrice = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = ('pk' , 'user' ,'name' , 'price' , 'discount','discountedPrice')
    def get_discountedPrice(self, obj):
        if obj.discount>0:
            # discountedPrice = obj.price - ((obj.discount / obj.price )* 100)
            print obj.discount , obj.price
            discountedPrice =  obj.price - (obj.discount / 100.00 ) *  obj.price
            print 'gggggggggggg',discountedPrice
            return discountedPrice
        else:
            return obj.price

class listingSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    product = POSProductSerializer(many = False , read_only = True)
    # parentType = genericProductSerializer(many = False , read_only = True)
    class Meta:
        model = listing
        fields = ('pk' , 'user' , 'product'  , 'approved' ,  'specifications' , 'files' , 'parentType' , 'source','dfs' )
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])
        # print validated_data
        # print self.context['request'].data['parentType'] , self.context['request'].data['product']
        l = listing(**validated_data)
        l.user =  u
        l.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        l.product = Product.objects.get(pk = self.context['request'].data['product'])
        l.save()
        if 'files' in self.context['request'].data:
            for m in self.context['request'].data['files']:
                l.files.add(media.objects.get(pk = m))

        for s in json.loads(l.specifications):
            dF = DataField(name = s['name'], value = s['value'] , typ = s['fieldType'] )
            dF.save()
            l.dfs.add(dF)

        l.save()
        return l

    def update(self , instance , validated_data):
        u = self.context['request'].user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.listings'])

        instance.parentType = genericProduct.objects.get(pk = self.context['request'].data['parentType'])
        instance.source = self.context['request'].data['source']
        instance.product = Product.objects.get(pk = self.context['request'].data['product'])
        instance.save()

        if 'specifications' in self.context['request'].data:
            instance.specifications = self.context['request'].data['specifications']
            instance.save()

            for d in instance.dfs.all():
                DataField.objects.get(pk = d.pk).delete()

            instance.dfs.clear()
            print json.loads(instance.specifications)
            for s in json.loads(instance.specifications):
                dF = DataField(name = s['name'], value = s['value'] , typ = s['fieldType'] )
                dF.save()
                instance.dfs.add(dF)

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
        fields = ('pk' ,  'approved' ,  'files' , 'parentType'  ,'specifications', 'product','source')

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ( 'pk', 'created' , 'title' ,'dp' , 'parent')


class offerBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = offerBanner
        fields = ('pk' , 'user' , 'created'  , 'level' , 'image' ,'imagePortrait' , 'title' , 'subtitle' , 'state' , 'params' , 'active')
        read_only_fields = ('user',)
    def create(self ,  validated_data):
        u = self.context['request'].user
        b = offerBanner(**validated_data)
        b.user = u
        b.save()
        return b

class CartSerializer(serializers.ModelSerializer):
    product = listingSerializer(many = False , read_only = True)
    class Meta:
        model = Cart
        fields = ( 'pk', 'product' , 'user' ,'qty' , 'typ')
    def create(self , validated_data):
        c = Cart(**validated_data)
        c.product = listing.objects.get(pk = self.context['request'].data['product'])
        c.save()
        return c


class ActivitiesSerializer(serializers.ModelSerializer):
    product = listingSerializer(many = False , read_only = True)
    class Meta:
        model = Activities
        fields = ( 'pk','created','product', 'user', 'typ' ,'data')
    def create(self , validated_data):
        a = Activities(**validated_data)
        if 'product' in self.context['request'].data:
            a.product = listing.objects.get(pk = self.context['request'].data['product'])
        a.save()
        return a

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('pk' ,'user' , 'title' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon', 'country')
    def create(self , validated_data):
        print '******************'
        a = Address(**validated_data)
        a.user=User.objects.get(pk=self.context['request'].user.pk)
        a.save()
        profObj = profile.objects.get(user = self.context['request'].user)
        if self.context['request'].data['primary']:
            profObj.primaryAddress = a
        profObj.addresses.add(a)
        profObj.save()
        return a
    def update(self ,instance, validated_data):
        for key in ['title' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon', 'country']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.save()
        profObj = profile.objects.get(user = self.context['request'].user)
        if self.context['request'].data['primary']:
            print 'trueeeeeeeeeee'
            profObj.primaryAddress = instance
        elif profObj.primaryAddress and profObj.primaryAddress.pk == instance.pk:
            profObj.primaryAddress = None
        profObj.save()
        return instance

class TrackingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingLog
        fields = ( 'pk', 'logTxt' , 'time')

class OrderQtyMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderQtyMap
        fields = ( 'pk', 'trackingLog' , 'product', 'qty' ,'totalAmount' , 'status' , 'updated' ,'refundAmount' ,'discountAmount' , 'refundStatus' , 'cancellable')

class OrderQtyMapLiteSerializer(serializers.ModelSerializer):
    productName = serializers.SerializerMethodField()
    class Meta:
        model = OrderQtyMap
        fields = ( 'pk', 'product', 'qty' ,'totalAmount' , 'status','productName')
    def get_productName(self, obj):
        return obj.product.product.name

class OrderSerializer(serializers.ModelSerializer):
    orderQtyMap = OrderQtyMapLiteSerializer(many = True , read_only = True)
    class Meta:
        model = Order
        fields = ( 'pk', 'created' , 'updated', 'totalAmount' ,'orderQtyMap' , 'paymentMode' , 'paymentRefId','paymentChannel', 'modeOfShopping' , 'paidAmount', 'paymentStatus' ,'promoCode' , 'approved' , 'status','landMark', 'street' , 'city', 'state' ,'pincode' , 'country' , 'mobileNo',)
        read_only_fields = ('user',)

class PromocodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocode
        fields = ( 'pk', 'created' , 'updated', 'name' ,'endDate' , 'discount' , 'validTimes')

class FrequentlyQuestionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = FrequentlyQuestions
        fields = ('pk' ,'created' , 'user' , 'ques' , 'ans')
        read_only_fields = ('user',)
    def create(self , validated_data):
        print '******************'
        f = FrequentlyQuestions(**validated_data)
        f.user=self.context['request'].user
        f.save()
        return f
