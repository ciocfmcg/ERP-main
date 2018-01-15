from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'module' , moduleViewSet , base_name = 'module')
router.register(r'application' , applicationViewSet , base_name = 'application')
router.register(r'applicationAdminMode' , applicationAdminViewSet , base_name = 'applicationAdminMode')
router.register(r'device' , deviceViewSet , base_name = 'device')
router.register(r'appSettings' , applicationSettingsViewSet , base_name = 'applicationSettings')
router.register(r'appSettingsAdminMode' , applicationSettingsAdminViewSet , base_name = 'applicationSettingsAdminMode')
router.register(r'groupPermission' , groupPermissionViewSet , base_name = 'groupAccess')
router.register(r'permission' , permissionViewSet , base_name = 'access')
router.register(r'profile' , profileViewSet , base_name = 'profile')
router.register(r'address' , addressViewSet , base_name = 'address')
router.register(r'service' , serviceViewSet , base_name = 'service')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'registerDevice/$' , registerDeviceApi.as_view()),
    url(r'serviceRegistration/$' , serviceRegistrationApi.as_view() ),
    url(r'sendSMS/$' , SendSMSApi.as_view()),
]
