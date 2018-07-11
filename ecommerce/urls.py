from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'field' , fieldViewSet , base_name = 'field')
router.register(r'genericProduct' , genericProductViewSet , base_name = 'genericProduct')
router.register(r'media' , mediaViewSet , base_name = 'media')
router.register(r'listing' , listingViewSet , base_name = 'listing')
router.register(r'listingLite' , listingLiteViewSet , base_name = 'listingLite')
router.register(r'category' , CategoryViewSet , base_name = 'category')
router.register(r'offerBanner' , offerBannerViewSet , base_name='offerBanner')
router.register(r'cart' , CartViewSet , base_name='cart')
router.register(r'activities' , ActivitiesViewSet , base_name='activities')
router.register(r'address' , AddressViewSet , base_name='address')
router.register(r'promocode' , PromocodeViewSet , base_name='promocode')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'searchProduct/$' , SearchProductAPI.as_view()),
]
