from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'timeSheet' , TimeSheetViewSet , base_name = 'timeSheet')
router.register(r'timeSheetItem' , TimeSheetItemViewSet , base_name = 'timeSheetItem')



urlpatterns = [
    url(r'^', include(router.urls)),


]
