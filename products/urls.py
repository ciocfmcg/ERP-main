from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'product' , ProductViewSet , base_name = 'product')
router.register(r'ticket' , TicketViewSet , base_name = 'ticket')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'getQuote/$' , GenerateQuote.as_view() ),
]
