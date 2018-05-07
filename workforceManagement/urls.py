from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'leavesToApprove/$' ,LeavesToApprove.as_view())
]
