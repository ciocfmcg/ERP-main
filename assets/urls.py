from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'assets' , AssetsViewSet , base_name = 'assets')
router.register(r'checkin' , CheckinViewSet , base_name = 'checkin')
router.register(r'allotment' , AllotmentViewSet , base_name = 'allotment')
router.register(r'checkout' , CheckoutViewSet , base_name = 'checkout')



urlpatterns = [
     url(r'^', include(router.urls)),
 ]
