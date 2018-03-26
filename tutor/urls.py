from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'tutors24Profile' , tutors24ProfileViewSet , base_name ='tutors24Profile')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'Tutor24User/$' , Tutor24UserView.as_view()),
]
