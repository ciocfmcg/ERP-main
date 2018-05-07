# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
import datetime
import requests
from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.utils import timezone
import random, string
from django.http import JsonResponse


from django.shortcuts import render
from HR.models import Leave
from rest_framework.response import Response


# Create your views her




# class LeavesToApprove(APIView):
#     renderer_classes = (JSONRenderer,)
#
#     def get(self , request , format = None):
#         leaveObj=Leave.objects.filter(user_id=request.GET['user'] , approved = 'Yes')
#         # amt = 0
#         # for i in leaveObj:
#         #     for j in i.invoices.all():
#         #         if j.approved:
#         #             amt += j.amount
#         # tosend = {'amount':amt}
#
#         return JsonResponse(tosend,status = status.HTTP_200_OK)
