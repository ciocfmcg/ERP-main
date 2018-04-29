from django.contrib.sitemaps import Sitemap
from .models import *


class SectionsSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
       return Section.objects.all()

    def lastmod(self, obj):
       return obj.updated
