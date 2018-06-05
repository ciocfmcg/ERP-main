from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'contacts' , ContactsViewSet , base_name = 'contacts')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'bulkContacts/$' , BulkContactsAPIView.as_view()),
]
