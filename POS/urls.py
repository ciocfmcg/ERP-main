from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customer' , CustomerViewSet , base_name = 'customer')
router.register(r'product' , ProductViewSet , base_name = 'product')
router.register(r'invoice' , InvoiceViewSet , base_name = 'invoice')
router.register(r'productVerient' , ProductVerientViewSet , base_name = 'productVerient')
router.register(r'productMetaList' , ProductMetaListViewSet , base_name = 'productMetaList')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'invoicePrint/$' , InvoicePrint.as_view() ),
    url(r'bulkProductsCreation/$' , BulkProductsCreationAPI.as_view() ),
    url(r'externalEmailOrders/$' , ExternalEmailOrders.as_view() ),

]
