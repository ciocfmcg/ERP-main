from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'patient' , PatientViewSet , base_name = 'patients')
router.register(r'product' , ProductViewSet , base_name = 'product')
router.register(r'activePatient' , ActivePatientViewSet , base_name = 'activePatient')
router.register(r'invoice' , InvoiceViewSet , base_name = 'invoice')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^downloadInvoice/', InvoiceSlip.as_view() , name ='downloadInvoice'),
    url(r'^downloaddischargeSummary/', DischargeSummary.as_view() , name ='downloaddischargeSummary'),
 ]
