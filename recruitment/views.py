
from __future__ import unicode_literals

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from .models import *
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.template.loader import render_to_string, get_template
from django.core.mail import send_mail, EmailMessage
# Create your views here.


class JobsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = JobsSerializer
    queryset = Jobs.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['jobtype','status']

class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = JobApplicationSerializer
    queryset = JobApplication.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['job','status' ,'email' ,'mobile']

class JobsList(APIView):
    permission_classes = (permissions.AllowAny, )
    def get(self , request , format = None):
        print 'ccccccccccccccccccccc'
        print request.GET
        if 'status' in request.GET:
            querySet = Jobs.objects.filter(status = str(request.GET['status']))
        else:
            querySet = Jobs.objects.all()
        toReturn = list(querySet.values('pk','jobtype','department__dept_name','skill','maximumCTC','unit__name','role__name'))
        print toReturn

        return Response(toReturn )
    def post(self , request , format = None):
        print 'ccccccccccccccccccccc'
        data = request.POST
        print data
        d = {'firstname':data['firstname'],'email':data['email'],'mobile':data['mobile'],'job':Jobs.objects.get(pk = int(data['job'])),'resume':request.FILES['resume']}
        if 'lastname' in data:
            d['lastname'] = data['lastname']
        if 'coverletter' in data:
            d['coverletter'] = data['coverletter']
        if 'aggree' in data:
            d['aggree'] = True
        print d
        try:
            obj = JobApplication.objects.create(**d)
            toSend = 'Sucess'
        except:
            toSend = 'Error'
        print toSend
        return Response({'res':toSend}, status = status.HTTP_200_OK)

class InterviewViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = InterviewSerializer
    queryset = Interview.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['candidate','interviewer']


class SendLinkAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self, request, format=None):
        contactData=[]
        email_subject ="On Response to the post you have applied for:"
        msgBody= "Hi" + request.data['first_name'] + " " + request.data['last_name'] + ",\n\n\t\t We are glad to inform you that you are been selected for the next level of interview i.e., Online Assesment. Please find the Assesment Link to complete as part of our interview process.\n\n Best of luck.\n\nThank You"
        email=request.data['emailID']
        contactData.append(str(email))
        msg = EmailMessage(email_subject, msgBody,  to= contactData )
        msg.send()
        return Response({}, status = status.HTTP_200_OK)
