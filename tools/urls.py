from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'fileCache' , FileCacheViewSet , base_name ='fileCache')
router.register(r'apiAccount' , ApiAccountViewSet , base_name ='apiAccount')
router.register(r'apiAccountLog' , ApiAccountLogViewSet , base_name ='apiAccountLog')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'KNNOcr/$' , KNNOcrApi.as_view()),
    url(r'pdfReader/$' , PDFReaderApi.as_view()),
    url(r'pdfEditor/$' , PDFEditorApi.as_view()),
    url(r'kpmgAudit/$' , kpmgAuditApi.as_view()),
    url(r'nlp/$' , NLPParser.as_view()),
    url(r'nlpRelationships/$' , NLPParserRelation.as_view()),
    url(r'apiAccountPublic/$' , ApiAccountPublicApi.as_view()),
    url(r'nlpGetPara/$' , NLPGetParaByTitle.as_view()),
    url(r'externalFileCache/$' , FileCacheAPI.as_view()),
]
