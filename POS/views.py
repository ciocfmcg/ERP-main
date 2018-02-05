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
