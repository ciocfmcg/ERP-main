from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'jobs' , JobsViewSet , base_name = 'jobs')
urlpatterns = [
     url(r'^', include(router.urls)),
 ]
