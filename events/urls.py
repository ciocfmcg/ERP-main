from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from views import *

urlpatterns = [
    # url(r'^$', blogs , name="blogs"),
    url(r'^subscribe/$', subscribe , name = 'subscribe'),
]
