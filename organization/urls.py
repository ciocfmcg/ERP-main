from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'divisions' , DivisionViewSet , base_name = 'division')
router.register(r'unit' , UnitViewSet , base_name = 'unit')
router.register(r'unitLite' , UnitLiteViewSet , base_name = 'unitLite')
router.register(r'firstLevelUnit' , FirstLevelUnitViewSet , base_name = 'firstLevelUnit')
router.register(r'unitFull' , UnitFullViewSet , base_name = 'unitFull')
router.register(r'unitSuperLite' , UnitSuperliteViewSet , base_name = 'unitSuperLite')
router.register(r'departments' , DepartmentsViewSet , base_name = 'departments')
router.register(r'role' , RoleViewSet , base_name = 'role')
router.register(r'responsibility' , ResponsibilityViewSet , base_name = 'responsibility')
router.register(r'KRA' , KRAViewSet , base_name = 'KRA')
urlpatterns = [
     url(r'^', include(router.urls)),
 ]
