from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'contact' , ContactViewSet , base_name = 'contact')
router.register(r'contactLite' , ContactLiteViewSet , base_name = 'contactLite')
router.register(r'deal' , DealViewSet , base_name = 'deal')
router.register(r'contract' , ContractViewSet , base_name = 'contract')
router.register(r'activity' , ActivityViewSet , base_name = 'activity')

urlpatterns = [
    url(r'^', include(router.urls)),
    # url(r'serviceRegistration/$' , serviceRegistrationApi.as_view() ),
]
