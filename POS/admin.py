# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

# Register your models here.
from .models import *
# Register your models here.
admin.site.register(Invoice)
admin.site.register(Customer)
admin.site.register(Product)
