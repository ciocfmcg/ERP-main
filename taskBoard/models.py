from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.db import models
from projects.models import MEDIA_TYPE_CHOICES, project
from gitweb.models import commitNotification
# Create your models here.
from django.db.models.signals import post_save , pre_delete, post_init , pre_save
from django.dispatch import receiver
import requests
from django.conf import settings as globalSettings
import math
from time import time
from datetime import timedelta , datetime
from django.utils import timezone

def getTaskUploadsPath(instance , filename ):
    return 'tasks/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

class media(models.Model):
    user = models.ForeignKey(User , related_name = 'tasksUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getTaskUploadsPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')
    name = models.CharField(max_length = 100 , null = True)

class task(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField(blank = False , max_length = 200)
    description = models.TextField(max_length=2000 , blank=False)
    files = models.ManyToManyField(media , related_name='tasks', blank = True)
    followers = models.ManyToManyField(User , related_name = 'taskFollowing', blank = True)
    dueDate = models.DateTimeField(null = False)
    user = models.ForeignKey(User , null = True) # the one who created it
    to = models.ForeignKey(User , null = True , related_name='tasks')
    personal = models.BooleanField(default = False)
    project = models.ForeignKey(project , null = True)
    completion = models.PositiveIntegerField(default=0)
    archived = models.BooleanField(default = False)

TASK_STATUS_CHOICES = (
    ('notStarted','notStarted'),
    ('inProgress','inProgress'),
    ('stuck','stuck'),
    ('complete','complete'),
)

class subTask(models.Model):
    user = models.ForeignKey(User , null = True)
    task = models.ForeignKey(task , null = False, related_name='subTasks')
    title = models.CharField(blank = False , max_length = 200)
    status = models.CharField(choices = TASK_STATUS_CHOICES , default = 'notStarted' , max_length = 30)

TIMELINE_ITEM_CATEGORIES = (
    ('message' , 'message'),
    ('git' , 'git'),
    ('file' , 'file'),
    ('system' , 'system'),
)

class timelineItem(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user =  models.ForeignKey(User , null = True)
    category = models.CharField(choices = TIMELINE_ITEM_CATEGORIES , max_length = 50 , default = 'message')
    task = models.ForeignKey(task , null = False)
    text = models.TextField(max_length=2000 , null=True)
    commit = models.ForeignKey(commitNotification, related_name="tasks", null = True)

@receiver(post_save, sender=subTask, dispatch_uid="server_post_save")
def updateTask(sender, instance, **kwargs):
    t = instance.task
    percnt = 0
    for s in t.subTasks.all():
        if s.status == 'complete':
            percnt += 100
        elif s.status == 'inProgress':
            percnt += 50
        elif s.status == 'stuck':
            percnt += 25
    cnt = t.subTasks.count()
    if cnt>0:
        percnt = math.floor(percnt/cnt)
    else:
        percnt = 100
    t.completion = percnt
    t.save()
