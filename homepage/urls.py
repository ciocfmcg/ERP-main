from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'registration' , RegistrationViewSet , base_name = 'registration')
router.register(r'enquireOrContact' , EnquiryAndContactsViewSet , base_name = 'enquireOrContact')

urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'register/$' , DownloadQuesPaper.as_view() ),
]
