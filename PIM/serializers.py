from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from social.serializers import commentLikeSerializer
from social.models import commentLike
from clientRelationships.models import Contact


class ContactLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ('pk' , 'user' ,'name', 'company', 'email', 'mobile' , 'designation', 'dp', 'male')
        read_only_fields = ( 'user' ,'name', 'company', 'email', 'mobile' , 'designation', 'dp', 'male')


class themeSerializer(serializers.ModelSerializer):
    class Meta:
        model = theme
        fields = ( 'pk' , 'main' , 'highlight' , 'background' , 'backgroundImg')

class settingsSerializer(serializers.ModelSerializer):
    theme = themeSerializer(many = False , read_only = True)
    class Meta:
        model = settings
        fields = ('pk' , 'user', 'theme', 'presence')

class notificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = notification
        fields = ('pk' , 'message' ,'shortInfo','domain','onHold', 'link' , 'originator' , 'created' ,'updated' , 'read' , 'user')

class calendarSerializer(serializers.ModelSerializer):
    clients = ContactLiteSerializer(many = True , read_only = True)
    class Meta:
        model = calendar
        fields = ('pk' , 'eventType' , 'followers' ,'originator', 'duration' , 'created', 'updated', 'user' , 'text' , 'notification' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes', 'clients', 'data')
        read_only_fields = ('followers', 'user' , 'clients')
    def create(self , validated_data):
        cal = calendar(**validated_data)
        cal.user = self.context['request'].user
        cal.save()
        if 'followers' in  self.context['request'].data:
            tagged = self.context['request'].data['followers']
            if not isinstance(tagged , list):
                for tag in tagged.split(','):
                    cal.followers.add( User.objects.get(pk = tag))
            else:
                for tag in tagged:
                    cal.followers.add( User.objects.get(pk = tag))

        if 'clients' in  self.context['request'].data:
            clients = self.context['request'].data['clients']
            for c in clients:
                cal.clients.add( Contact.objects.get(pk = c))
        cal.save()
        return cal
    def update(self, instance, validated_data): # like the comment
        for key in ['eventType', 'duration' , 'text' ,'when' , 'read' , 'deleted' , 'completed' , 'canceled' , 'level' , 'venue' , 'attachment' , 'myNotes', 'data']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.followers.clear()
        if 'followers' in  self.context['request'].data:
            tagged = self.context['request'].data['followers']
            if not isinstance(tagged , list):
                for tag in tagged.split(','):
                    instance.followers.add( User.objects.get(pk = tag))
            else:
                for tag in tagged:
                    instance.followers.add( User.objects.get(pk = tag))
        instance.save()
        return instance

class chatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = chatMessage
        fields = ('pk' , 'message' ,'attachment', 'originator' , 'created' , 'read' , 'user')
        read_only_fields = ('originator' , )
    def create(self , validated_data):
        im = chatMessage.objects.create(**validated_data)
        im.originator = self.context['request'].user
        try:
            im.attachment = self.context['request'].FILES['attachment']
        except:
            pass
        if im.originator == im.user:
            im.delete()
            raise ParseError(detail=None)
        else:
            im.save()
            return im


class blogLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = blogLike
        fields = ('pk' , 'user' , 'created' , 'parent')
    def create(self , validated_data):
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        l, new = blogLike.objects.get_or_create(parent = parent , user = user)
        return l

class blogCommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = blogCommentLike
        fields = ('pk' , 'user' , 'created' , 'parent')
    def create(self , validated_data):
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        l, new = blogLike.objects.get_or_create(parent = parent , user = user)
        return l

class blogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = blogCategory
        fields = ('pk', 'title' )

class blogCommentsSerializer(serializers.ModelSerializer):
    likes = blogCommentLikeSerializer(many = True , read_only = True)
    class Meta:
        model = blogComment
        fields = ('pk' , 'user' , 'parent' , 'created' , 'text' , 'likes')
        read_only_fields = ('tagged', 'likes',)
    def create(self , validated_data):
        text = validated_data.pop('text')
        parent = validated_data.pop('parent')
        user =  self.context['request'].user
        comment = blogComment(text = text , parent = parent , user = user)
        comment.save()
        return comment
    def update(self, instance, validated_data): # like the comment
        user =  self.context['request'].user
        # print commentLike.parent.__class__
        l , new = blogCommentLike.objects.get_or_create(user = user , parent = instance)
        return instance

class blogSerializer(serializers.ModelSerializer):
    likes = blogLikeSerializer(many = True , read_only = True)
    comments = blogCommentsSerializer(many = True , read_only = True)
    tags = blogCategorySerializer(many = True , read_only = True)
    class Meta:
        model = blogPost
        fields = ( 'pk' ,'public', 'source' , 'likes' , 'comments' , 'created' , 'sourceFormat' , 'users' , 'tags' , 'title' , 'header' , 'state' , 'contentType')
        read_only_fields = ('tags',)
    def create(self , validated_data):
        b = blogPost()
        for key in ['source', 'sourceFormat', 'title' , 'header' , 'state']:
            try:
                setattr(b , key , validated_data[key])
            except:
                pass
        b.save()
        b.users.add (self.context['request'].user)
        for tag in self.context['request'].data['tags']:
            b.tags.add(blogCategory.objects.get(pk = tag))
        b.save()
        return b


class notebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = notebook
        fields = ('pk' , 'user', 'created' , 'pages' , 'title')
        read_only_fields = ('pages' , )
    def create(self , validated_data):
        n = notebook.objects.create(**validated_data)
        n.user = self.context['request'].user
        n.save()
        return n
    def update(self, instance, validated_data): # like the comment
        instance.title = validated_data['title']
        instance.save()
        return instance

class pageSerializer(serializers.ModelSerializer):
    class Meta:
        model = page
        fields = ('pk' , 'user', 'source' , 'parent' , 'title')
    def create(self , validated_data):
        p = page.objects.create(**validated_data)
        p.user = self.context['request'].user
        p.save()
        return p
    def update(self, instance, validated_data): # like the comment
        instance.title = validated_data['title']
        instance.source = validated_data['source']
        instance.save()
        return instance
