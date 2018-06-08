from django.shortcuts import render
from PIM.models import blogPost
from django.conf import settings as globalSettings

def index(request):
    return render(request, 'index.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def crmHome(request):
    return render(request, 'crm.html', {"home": True , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})


def blogDetails(request, blogname):
    blogobj = blogPost.objects.get(title=blogname)
    title = blogobj.title
    header = blogobj.header
    us = ''
    blogId = blogobj.pk
    count = 0
    for j in blogobj.users.all():
        if count == 0:
            us = j.first_name + ' ' + j.last_name
        else:
            us += ' , ' + j.first_name + ' ' + j.last_name
        count += 1
    date = blogobj.created
    body = blogobj.source
    return render(request, 'blogdetails.html', {"home": False, 'user': us, 'header': header, 'title': title, 'date': date, 'blogId': blogId, 'body': body , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def blog(request):

    blogObj = blogPost.objects.all()
    pagesize = 1
    try:
        page = int(request.GET.get('page', 1))
    except ValueError as error:
        page = 1
    total = blogObj.count()
    last = total/pagesize + (1 if total%pagesize !=0 else 0)
    # data = blogObj[(page-1)*pagesize:(page*pagesize)]
    pages = {'first':1,
			'prev':(page-1) if page >1 else 1,
			'next':(page+1) if page !=last else last,
			'last':last,
			'currentpage':page}

    data = [ ]
    for i in blogObj:
        title = i.title
        header = i.header
        us = ''
        blogId = i.pk
        for j in i.users.all():
            us = j.first_name + ' ' + j.last_name
        date = i.created
        # body = i.source
        data.append({'user':us , 'header' : header , 'title' : title , 'date' : date , 'blogId' : blogId})
    data = data[(page-1)*pagesize:(page*pagesize)]
    return render(request,"blog.html" , {"home" : False ,'data' : data ,'pages':pages , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def news(request):
    return render(request,"newssection.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def team(request):
    return render(request,"team.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def career(request):
    return render(request,"career.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def policy(request):
    return render(request,"policy.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "site" : globalSettings.SITE_ADDRESS , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def terms(request):
    return render(request,"terms.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME  , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def refund(request):
    return render(request,"refund.html" , {"home" : False , "brandName" : globalSettings.BRAND_NAME , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def contacts(request):
    return render(request,"contacts.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})

def registration(request):
    return render(request,"registration.html" , {"home" : False , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT})
