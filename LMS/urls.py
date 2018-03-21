from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'qPart' , QPartViewSet , base_name ='qPart')
router.register(r'question' , QuestionViewSet , base_name ='question')
router.register(r'subject' , SubjectViewSet , base_name ='subject')
router.register(r'topic' , TopicViewSet , base_name ='topic')
router.register(r'paper' , PaperViewSet , base_name ='paper')
router.register(r'answer' , AnswerViewSet , base_name ='answer')
router.register(r'course' , CourseViewSet , base_name ='course')
router.register(r'enrollment' , EnrollmentViewSet , base_name ='enrollment')
router.register(r'comment' , CommentViewSet , base_name ='comment')
router.register(r'like' , LikeViewSet , base_name ='like')
router.register(r'studyMaterial' , StudyMaterialViewSet , base_name ='studyMaterial')
router.register(r'quesPaper' , PaperQuesViewSet , base_name ='quesPaper')
router.register(r'channel' , ChannelViewSet , base_name ='channel')
router.register(r'video' , VideoViewSet , base_name ='video')
router.register(r'feedback' , FeedbackViewSet , base_name ='feedback')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'generateQuesPaper/$' , DownloadQuesPaper.as_view() ),
]
