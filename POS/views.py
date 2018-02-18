# from django.shortcuts import render
# from rest_framework import viewsets , permissions , serializers
# from url_filter.integrations.drf import DjangoFilterBackend
# from .serializers import *
# from API.permissions import *
# from .models import *
# # Create your views here.
#
# class CustomerViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated, )
#     serializer_class = CustomerSerializer
#     queryset = Customer.objects.all()
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name']
#
# class ProductViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated, )
#     serializer_class = ProductSerializer
#     queryset = Product.objects.all()
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name']
#
# class InvoiceViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated, )
#     serializer_class = ProductSerializer
#     queryset = Product.objects.all()
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name']

from django.shortcuts import render
from rest_framework import viewsets , permissions , serializers
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from django.http import HttpResponse
import datetime
import json
import pytz
from .models import *
# Create your views here.

class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']

# class InvoiceViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated, )
#     serializer_class = ProductSerializer
#     queryset = Product.objects.all()
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['name']
class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = InvoiceSerializer
    queryset = Invoice.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['customer' , 'id']

class DownloadInvoice(APIView):
    renderer_classes = (JSONRenderer,)
    def get(self , request , format = None):
        print '******************'
        if 'invoice' not in request.GET:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(content_type='application/pdf')
        i = Invoice.objects.get(id = request.GET['invoice'])
        response['Content-Disposition'] = 'attachment; filename="pos_invoice%s_%s.pdf"' %(i.pk, datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year )
        genInvoice(response , i , request)
        f = open('./media_root/pos_invoice%s%s_%s.pdf'%(i.pk,datetime.datetime.now(pytz.timezone('Asia/Kolkata')).year) , 'wb')
        f.write(response.content)
        f.close()
        if 'saveOnly' in request.GET:
            return Response(status=status.HTTP_200_OK)
        return response
