from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

# router.register(r'urlendswith' , viewsetclass , base_name ='basename')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'KNNOcr/$' , KNNOcrApi.as_view()),
    url(r'pdfReader/$' , PDFReaderApi.as_view()),
]
