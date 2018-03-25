from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'registration' , RegistrationViewSet , base_name = 'registration')

urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'register/$' , DownloadQuesPaper.as_view() ),
]
