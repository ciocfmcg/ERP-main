from django.conf.urls import include, url

urlpatterns = [
    url(r'^HR/', include('HR.urls')),
    url(r'^ERP/', include('ERP.urls')),
    url(r'^social/', include('social.urls')),
    url(r'^mail/', include('mail.urls')),
    url(r'^PIM/', include('PIM.urls')),
    url(r'^ecommerce/', include('ecommerce.urls')),
    url(r'^finance/', include('finance.urls')),
    url(r'^events/', include('events.urls')),
    url(r'^clientRelationships/', include('clientRelationships.urls')),
    url(r'^POS/', include('POS.urls')),
    url(r'^organization/', include('organization.urls')),
    url(r'^recruitment/', include('recruitment.urls')),
    url(r'^payroll/', include('payroll.urls')),
    url(r'^homepage/', include('homepage.urls')),
]
