from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customer' , CustomerViewSet , base_name = 'customer')
router.register(r'product' , ProductViewSet , base_name = 'product')


urlpatterns = [
    url(r'^', include(router.urls)),
]
