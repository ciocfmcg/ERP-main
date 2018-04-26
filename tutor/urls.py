from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'tutors24Profile' , tutors24ProfileViewSet , base_name ='tutors24Profile')
router.register(r'tutors24Session' , tutors24SessionViewSet , base_name ='tutors24Session')
router.register(r'tutors24Transaction' , tutors24TransactionViewSet , base_name ='tutors24Transaction')
router.register(r'tutors24Message' , tutors24MessageViewSet , base_name ='tutors24Message')
router.register(r'tutors24Image' , tutors24ImageViewSet , base_name ='tutors24Image')



urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'Tutor24User/$' , Tutor24UserView.as_view()),
]
