from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'divisions' , DivisionViewSet , base_name = 'division')
router.register(r'units' , UnitsViewSet , base_name = 'units')
router.register(r'departments' , DepartmentsViewSet , base_name = 'departments')
router.register(r'roles' , RolesViewSet , base_name = 'roles')
urlpatterns = [
     url(r'^', include(router.urls)),
 ]
