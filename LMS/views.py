from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from API.permissions import *
from django.db.models import Q
from django.http import HttpResponse
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
import datetime
import json
import pytz
import requests
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
from .models import *
from .serializers import *



class QPartViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QPartSerializer
    queryset = QPart.objects.all()

class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

class DownloadQuesPaper(APIView):
    permission_classes = (permissions.AllowAny, )
    def get(self , request , format = None):
        ids = request.GET.get('questions',None)
        ques=Question.objects.filter(id__in = ids.split(',')) if ids is not None else Question.objects.all()
        tex_body = get_template('my_latex_template.tex').render({"ques" : ques})
        print str(tex_body)
        return Response(status=status.HTTP_200_OK)

        # with tempfile.TemporaryDirectory() as tempdir:
        #     # Create subprocess, supress output with PIPE and
        #     # run latex twice to generate the TOC properly.
        #     # Finally read the generated pdf.
        #     for i in range(2):
        #         process = Popen(['pdflatex', '-output-directory', tempdir],stdin=PIPE,stdout=PIPE,shell=True)
        #         process.communicate(rendered_tpl)
        #     # with open(os.path.join(tempdir, 'texput.pdf'), 'rb') as f:
        #     #     pdf = f.read()
        # return queryset

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
