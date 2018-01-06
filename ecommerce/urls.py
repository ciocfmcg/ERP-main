from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'field' , fieldViewSet , base_name = 'field')
router.register(r'genericType' , genericTypeViewSet , base_name = 'genericType')
router.register(r'genericProduct' , genericProductViewSet , base_name = 'genericProduct')
router.register(r'genericProductLite' , genericProductLiteViewSet , base_name = 'genericLiteProduct')
router.register(r'media' , mediaViewSet , base_name = 'media')
router.register(r'listing' , listingViewSet , base_name = 'listing')
router.register(r'listingLite' , listingLiteViewSet , base_name = 'listing')
router.register(r'listingSearch' , listingSearchViewSet , base_name = 'listing')
router.register(r'order' , orderViewSet , base_name = 'order')
router.register(r'saved' , savedViewSet , base_name = 'saved')
router.register(r'profile' , customerProfileViewSet , base_name = 'customerProfile')
router.register(r'choiceLabel' , choiceLabelViewSet , base_name = 'choiceLabel')
router.register(r'choiceOption' , choiceOptionViewSet , base_name = 'choiceOption')
router.register(r'offering' , offeringViewSet , base_name = 'offering')
router.register(r'offeringAdmin' , offeringAdminViewSet , base_name = 'offeringAdmin')
router.register(r'feedback' , feedbackViewSet , base_name = 'feedback')
router.register(r'offerBanner' , offerBannerViewSet , base_name='offerBanner')
router.register(r'review' , reviewViewSet , base_name='review')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'support/$' , supportApi.as_view() ),
    url(r'suggestLocations/$' , locationAutoCompleteApi.as_view() ),
    url(r'locationDetails/$' , locationDetailsApi.as_view() ),
    url(r'offeringAvailability/$' , offeringAvailabilityApi.as_view() ),
    url(r'printInvoice/$' , printInvoiceApi.as_view() ),
    url(r'earnings/$' , earningsApi.as_view() ),
    url(r'insight/$' , insightApi.as_view() ),
    url(r'requestConfirmation/$' , requestConfirmationApi.as_view() ),
]
