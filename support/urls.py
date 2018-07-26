from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customerProfile' , CustomerProfileViewSet , base_name = 'customerProfile')

urlpatterns = [
    url(r'^', include(router.urls)),
]
