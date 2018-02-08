from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'contact' , ContactViewSet , base_name = 'contact')
router.register(r'contactLite' , ContactLiteViewSet , base_name = 'contactLite')
router.register(r'deal' , DealViewSet , base_name = 'deal')
router.register(r'dealLite' , DealLiteViewSet , base_name = 'dealLite')
router.register(r'contract' , ContractViewSet , base_name = 'contract')
router.register(r'activity' , ActivityViewSet , base_name = 'activity')
router.register(r'relationships' , RelationshipViewSet , base_name = 'relationships')
router.register(r'productMeta' , ProductMetaViewSet , base_name = 'productMeta')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'downloadInvoice/$' , DownloadInvoice.as_view() ),
    url(r'sendNotification/$' , SendNotificationAPIView.as_view() ),
]
