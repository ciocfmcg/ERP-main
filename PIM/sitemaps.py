from django.contrib.sitemaps import Sitemap
from .models import *


class BlogsSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
       return blogPost.objects.all()

    def lastmod(self, obj):
       return obj.updated
