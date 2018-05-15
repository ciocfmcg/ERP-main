from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'customer' , CustomerViewSet , base_name = 'customer')
router.register(r'product' , ProductViewSet , base_name = 'product')
router.register(r'invoice' , InvoiceViewSet , base_name = 'invoice')
router.register(r'vendorProfile' , VendorProfileViewSet , base_name = 'vendorProfile')
router.register(r'vendorServices' , VendorServicesViewSet , base_name = 'vendorServices')
router.register(r'purchaseOrder' , PurchaseOrderViewSet , base_name = 'purchaseOrder')
router.register(r'VendorServicesLite' , VendorServicesLiteViewSet , base_name = 'VendorServicesLite')
router.register(r'productVerient' , ProductVerientViewSet , base_name = 'productVerient')
router.register(r'externalOrders' , ExternalOrdersViewSet , base_name = 'externalOrders')
router.register(r'inventoryLog' , InventoryLogViewSet , base_name = 'inventoryLog')
router.register(r'externalOrdersQtyMap' , ExternalOrdersQtyMapViewSet , base_name = 'externalOrdersQtyMap')



urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'invoicePrint/$' , InvoicePrint.as_view() ),
    url(r'productPrint/$' , ProductPrint.as_view() ),
    url(r'bulkProductsCreation/$' , BulkProductsCreationAPI.as_view() ),
    url(r'externalEmailOrders/$' , ExternalEmailOrders.as_view() ),
    url(r'reorderingReport/$' , ReorderingReport.as_view() ),
    url(r'stockReport/$' , StockReport.as_view() ),
]
