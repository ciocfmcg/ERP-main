from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
# Create your views here.



class QPartViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QPartSerializer
    queryset = QPart.objects.all()

class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

class SubjectViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = SubjectSerializer
    queryset = Subject.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class TopicViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = TopicSerializer
    queryset = Topic.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']


class PaperViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = PaperSerializer
    queryset = Paper.objects.all()

class AnswerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = AnswerSerializer
    queryset = Answer.objects.all()

class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = CourseSerializer
    queryset = Course.objects.all()

class EnrollmentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = EnrollmentSerializer
    queryset = Enrollment.objects.all()

class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = CommentSerializer
    queryset = Comment.objects.all()

class LikeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = LikeSerializer
    queryset = Like.objects.all()

class StudyMaterialViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = StudyMaterialSerializer
    queryset = StudyMaterial.objects.all()
