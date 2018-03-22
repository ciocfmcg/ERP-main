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
# import tempfile
# from backports import tempfile
from subprocess import Popen, PIPE
import os



class QPartViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QPartSerializer
    queryset = QPart.objects.all()

class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = QuestionSerializer
    queryset = Question.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['topic' , 'ques']

class PaperQuesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = PaperSerializer
    queryset = PaperQues.objects.all()

class DownloadQuesPaper(APIView):
    permission_classes = (permissions.AllowAny, )
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        p = Paper.objects.get(pk = request.GET.get('paper',None))
        print p.pk,'***************'
        ques=Question.objects.filter(id__in = [i.ques.pk for i in p.questions.all()])
        tex_body = get_template('my_latex_template.tex').render({"ques" : ques})
        content= str(tex_body)
        print content
        response = HttpResponse(content,content_type='text/plain')
        response['Content-Disposition'] = 'attachment; filename="questionPaper%s_%s.txt"' %(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year)
        f = open('./media_root/questionPaper%s_%s.txt'%(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
        f.write(response.content)
        f.close()
        return response


        # p = Paper.objects.get(pk = request.GET.get('paper',None))
        # print p.pk,'***************'
        # ques=Question.objects.filter(id__in = [i.ques.pk for i in p.questions.all()])
        # tex_body = get_template('my_latex_template.tex').render({"ques" : ques})
        # content= str(tex_body)
        # print content
        # with tempfile.TemporaryDirectory() as tempdir:
        #     # Create subprocess, supress output with PIPE and
        #     # run latex twice to generate the TOC properly.
        #     # Finally read the generated pdf.
        #     for i in range(2):
        #         process = Popen(['pdflatex', '-output-directory', tempdir],stdin=PIPE,stdout=PIPE,shell=True)
        #         process.communicate(content)
        #     with open(os.path.join(tempdir, 'texput.pdf'), 'rb') as f:
        #         pdf = f.read()
        # response = HttpResponse(content,content_type='text/plain')
        # response['Content-Disposition'] = 'attachment; filename="questionPaper%s_%s.txt"' %(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year)
        # f = open('./media_root/questionPaper%s_%s.txt'%(p.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
        # f.write(response.content)
        # f.close()
        # return response


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

class ChannelViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = ChannelSerializer
    queryset = Channel.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class VideoViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = VideoSerializer
    queryset = Video.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class FeedbackViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, isAdmin, )
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.all()
