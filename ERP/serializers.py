from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
from HR.serializers import userSearchSerializer
from rest_framework.response import Response
from fabric.api import *
import os
from django.conf import settings as globalSettings

class addressSerializer(serializers.ModelSerializer):
    class Meta:
        model = address
        fields = ('pk' , 'street' , 'city' , 'state' , 'pincode', 'lat' , 'lon', 'country')

class serviceSerializer(serializers.ModelSerializer):
    # user = userSearchSerializer(many = False , read_only = True)
    address = addressSerializer(many = False, read_only = True)
    class Meta:
        model = service
        fields = ('pk' , 'created' ,'name' , 'user' , 'cin' , 'tin' , 'address' , 'mobile' , 'telephone' , 'logo' , 'about', 'doc', 'web')

    def assignValues(self , instance , validated_data):
        if 'cin' in validated_data:
            instance.cin = validated_data['cin']
        if 'tin' in validated_data:
            instance.tin = validated_data['tin']
        if 'mobile' in validated_data:
            instance.mobile = validated_data['mobile']
        if 'telephone' in validated_data:
            instance.telephone = validated_data['telephone']
        if 'logo' in validated_data:
            instance.logo = validated_data['logo']
        if 'about' in validated_data:
            instance.about = validated_data['about']
        if 'doc' in validated_data:
            instance.doc = validated_data['doc']
        if 'web' in validated_data:
            instance.web = validated_data['web']
        if 'address' in self.context['request'].data and self.context['request'].data['address'] is not None:
            instance.address_id = int(self.context['request'].data['address'])
        instance.save()

    def create(self , validated_data):
        s = service(name = validated_data['name'] , user =validated_data['user'])
        self.assignValues(s, validated_data)
        return s
    def update(self , instance , validated_data):
        self.assignValues(instance , validated_data)
        return instance

class serviceLiteSerializer(serializers.ModelSerializer):
    address = addressSerializer(many = False, read_only = True)
    class Meta:
        model = service
        fields = ('pk'  ,'name' , 'address' , 'mobile' )

class deviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = device
        fields = ('pk', 'sshKey' , 'created' , 'name')

class profileSerializer(serializers.ModelSerializer):
    devices = deviceSerializer(many = True , read_only = True)
    class Meta:
        model = profile
        fields = ('pk', 'user' , 'devices')

class moduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = module
        fields = ( 'pk', 'name' , 'icon' , 'haveJs' , 'haveCss')

class applicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = application
        fields = ( 'pk', 'name', 'module' , 'description' , 'icon', 'canConfigure'  ,  'haveJs' , 'haveCss' , 'inMenu')

class applicationSettingsSerializer(serializers.ModelSerializer):
    # non admin mode
    class Meta:
        model = appSettingsField
        fields = ( 'pk', 'name', 'flag' , 'value' , 'fieldType')

class applicationAdminSerializer(serializers.ModelSerializer):
    module = moduleSerializer(read_only = True , many = False)
    owners = userSearchSerializer(read_only = True , many = True)
    class Meta:
        model = application
        fields = ( 'pk', 'name', 'module' , 'owners' , 'description' , 'created' , 'icon', 'canConfigure', 'haveJs' , 'haveCss' , 'inMenu')
    def create(self , validated_data):
        app =  application(**validated_data)
        app.module = module.objects.get(pk = self.context['request'].data['module']);
        # create the folder too as well as the folowing structure
        # app
        #     ---static
        #         -----js
        #         -----css
        #         -----ngTemplates
        parts = app.name.split('.')
        appName = parts[1]
        if len(parts)>=3:
            app.save()
            return app
        app.save()
        if len(app.name.split('.'))==2:
            with lcd(globalSettings.BASE_DIR):
                cmd = 'python manage.py startapp %s' %(appName)
                local(cmd)

        # adding the new app definition in the settings.py and creating the folders and files
        fileName = os.path.join(globalSettings.BASE_DIR , 'libreERP' , 'settings.py') # filepath for settings.py
        f = open(fileName , 'r')
        search = False
        lines = f.readlines()
        for l in lines:
            if l.find('INSTALLED_APPS') != -1:
                search = True
            if search:
                if l.find(')') != -1:
                    index = lines.index(l)
                    break
        lines.insert(index , ("\t'%s',# %s\n" %(appName , app.description)))
        f = open(fileName, "w")
        f.writelines(lines)
        f.close()
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static'))
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static', 'js'))
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static', 'css'))
        os.makedirs(os.path.join(globalSettings.BASE_DIR ,appName,'static', 'ngTemplates'))
        if app.haveJs:
            # create a JS file
            jsPath = os.path.join(globalSettings.BASE_DIR ,appName,'static', 'js' , ('%s.js' %(app.name)))
            f = open(jsPath, 'w')
            f.write('// you need to first configure the states for this app')
            f.close()
        if app.haveCss:
            #create a css file too
            jsPath = os.path.join(globalSettings.BASE_DIR ,appName,'static', 'css' , ('%s.css' %(app.name)))
            f = open(jsPath, 'w')
            f.write('/*here you can place all your app specific css class*/')
            f.close()
        app.save()
        return app

    def update (self, instance, validated_data):
        instance.owners.clear()
        for pk in self.context['request'].data['owners']:
            instance.owners.add(User.objects.get(pk = pk))
        instance.save()
        return instance

class applicationSettingsAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = appSettingsField
        fields = ( 'pk', 'name', 'flag' , 'value' , 'description' , 'created' , 'app', 'fieldType')
    def create(self , validated_data):
        s = appSettingsField()
        s.name = validated_data.pop('name')
        s.flag = validated_data.pop('flag')
        if 'value' in self.context['request'].data:
            s.value = self.context['request'].data['value']
        s.description = validated_data.pop('description')
        s.fieldType = validated_data.pop('fieldType')
        if s.fieldType == 'flag':
            s.value = ""
        s.app = validated_data.pop('app')
        s.save()
        return s

class permissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = permission
        fields = ( 'pk' , 'app' , 'user' )
    def create(self , validated_data):
        user = self.context['request'].user
        if not user.is_superuser and user not in app.owners.all():
            raise PermissionDenied(detail=None)
        u = validated_data['user']
        permission.objects.filter(user = u).all().delete()
        for a in self.context['request'].data['apps']:
            app = application.objects.get(pk = a)
            p = permission.objects.create(app =  app, user = u , givenBy = user)
        return p

class groupPermissionSerializer(serializers.ModelSerializer):
    app = applicationSerializer(read_only = True, many = False)
    class Meta:
        model = groupPermission
        fields = ( 'pk' , 'app' , 'group' )
