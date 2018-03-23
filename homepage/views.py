from django.shortcuts import render

def index(request):
    return render(request , 'index.html', {"home": True})

def blog(request):
    return render(request,"blog.html" , {"home" : False})

def news(request):
    return render(request,"newssection.html" , {"home" : False})

def team(request):
    return render(request,"team.html" , {"home" : False})

def career(request):
    return render(request,"career.html" , {"home" : False})

def policy(request):
    return render(request,"policy.html" , {"home" : False})

def terms(request):
    return render(request,"terms.html" , {"home" : False})

def refund(request):
    return render(request,"refund.html" , {"home" : False})

def contacts(request):
    return render(request,"contacts.html" , {"home" : False})

def registration(request):
    return render(request,"registration.html" , {"home" : False})
