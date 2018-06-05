from django.contrib import admin

# Register your models here.
from .models import *

admin.site.register(application)
admin.site.register(module)
admin.site.register(appSettingsField)
