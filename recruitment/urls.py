from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'job' , JobsViewSet , base_name = 'jobs')
router.register(r'applyJob' , JobApplicationViewSet , base_name = 'applyJob')
urlpatterns = [
     url(r'^', include(router.urls)),
     url(r'downloadResume/$' , DownloadResume.as_view()),
 ]
