from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.views.decorators.csrf import csrf_exempt, csrf_protect
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from ERP.models import application, permission , module , CompanyHolidays
from ERP.views import getApps, getModules
from django.db.models import Q
from django.http import JsonResponse
import random, string
from django.utils import timezone
from rest_framework.views import APIView
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta
import calendar
from rest_framework.response import Response

def documentView(request):
    docID = None
    if request.method == 'POST':
        templt = 'documentVerify.external.showDetails.html'
        docID = request.POST['id']
        passKey = request.POST['passkey']

    elif request.method == 'GET':
        if 'id' in request.GET:
            docID = request.GET['id']
            passKey = request.GET['passkey']
            templt = 'documentVerify.external.showDetails.html'
        else:
            templt = 'documentVerify.external.getPassKey.html'

    if docID is not None:
        if len(docID)<5:
            raise ObjectDoesNotExist("Document ID not correct")
        doc = get_object_or_404(Document , pk = int(docID[4:]), passKey = passKey)
        templt = 'documentVerify.external.showDetails.html'
        eml = doc.email
        prts = eml.split('@')
        eml = prts[0][0:4]+ "*******@" + prts[1]
        data = {
            "id":doc.pk,
            "issuedTo" : doc.issuedTo,
            "issuedBy" : doc.issuedBy,
            "created" : doc.created,
            "description" : doc.description,
            "email": eml
        }

    else:
        data = {}

    return render(request , templt, data)

def generateOTPCode():
    length = 4
    chars = string.digits
    rnd = random.SystemRandom()
    return ''.join(rnd.choice(chars) for i in range(length))

def tokenAuthentication(request):

    ak = get_object_or_404(accountsKey, activation_key=request.GET['key'] , keyType='hashed')
    #check if the activation key has expired, if it hase then render confirm_expired.html
    if ak.key_expires < timezone.now():
        raise SuspiciousOperation('Expired')
    #if the key hasn't expired save user and set him as active and render some template to confirm activation
    user = ak.user
    user.is_active = True
    user.save()
    user.accessibleApps.all().delete()
    for a in globalSettings.DEFAULT_APPS_ON_REGISTER:
        app = application.objects.get(name = a)
        p = permission.objects.create(app =  app, user = user , givenBy = User.objects.get(pk=1))
    login(request , user)
    authStatus = {'status' : 'success' , 'message' : 'Account actived, please login.' }
    return render(request , globalSettings.LOGIN_TEMPLATE , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN})


def generateOTP(request):
    print request.POST
    key_expires = timezone.now() + datetime.timedelta(2)
    otp = generateOTPCode()
    user = get_object_or_404(User, username = request.POST['id'])
    ak = accountsKey(user= user, activation_key= otp,
        key_expires=key_expires , keyType = 'otp')
    ak.save()
    print ak.activation_key
    # send a SMS with the OTP
    return JsonResponse({} ,status =200 )

import json


@csrf_exempt
def loginView(request):
    if globalSettings.LOGIN_URL != 'login':
        return redirect(reverse(globalSettings.LOGIN_URL))
    authStatus = {'status' : 'default' , 'message' : '' }
    statusCode = 200
    if request.user.is_authenticated():
        if 'next' in request.GET:
            return redirect(request.GET['next'])
        else:
            return redirect(reverse(globalSettings.LOGIN_REDIRECT))
    if request.method == 'POST':

    	usernameOrEmail = request.POST['username']
        otpMode = False
        if 'otp' in request.POST:
            print "otp"
            otp = request.POST['otp']
            otpMode = True
        else:
            password = request.POST['password']
        if '@' in usernameOrEmail and '.' in usernameOrEmail:
            u = User.objects.get(email = usernameOrEmail)
            username = u.username
        else:
            username = usernameOrEmail
            try:
                u = User.objects.get(username = username)
            except:
                statusCode = 404
        if not otpMode:
            user = authenticate(username = username , password = password)
        else:
            print "OTP Mode"
            ak = None
            try:
                aks = accountsKey.objects.filter(activation_key=otp , keyType='otp')
                ak = aks[len(aks)-1]
                print "Aks", aks,ak
            except:
                pass
            print ak
            if ak is not None:
                #check if the activation key has expired, if it has then render confirm_expired.html
                if ak.key_expires > timezone.now():
                    user = ak.user
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                else:
                    user = None
            else:
                authStatus = {'status' : 'danger' , 'message' : 'Incorrect OTP'}
                statusCode = 401

    	if user is not None:
            login(request , user)
            if request.GET and 'next' in request.GET:
                return redirect(request.GET['next'])
            else:
                if 'mode' in request.GET and request.GET['mode'] == 'api':
                    return JsonResponse({} , status = 200)
                else:
                    return redirect(reverse(globalSettings.LOGIN_REDIRECT))
        else:
            if statusCode == 200 and not u.is_active:
                authStatus = {'status' : 'warning' , 'message' : 'Your account is not active.'}
                statusCode = 423
            else:
                authStatus = {'status' : 'danger' , 'message' : 'Incorrect username or password.'}
                statusCode = 401

    if 'mode' in request.GET and request.GET['mode'] == 'api':
        return JsonResponse(authStatus , status = statusCode)


    return render(request , globalSettings.LOGIN_TEMPLATE , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT}, status=statusCode)

def registerView(request):
    if globalSettings.REGISTER_URL != 'register':
        return redirect(reverse(globalSettings.REGISTER_URL))
    msg = {'status' : 'default' , 'message' : '' }
    if request.method == 'POST':
    	name = request.POST['name']
    	email = request.POST['email']
    	password = request.POST['password']
        if User.objects.filter(email = email).exists():
            msg = {'status' : 'danger' , 'message' : 'Email ID already exists' }
        else:
            user = User.objects.create(username = email.replace('@' , '').replace('.' ,''))
            user.first_name = name
            user.email = email
            user.set_password(password)
            user.save()
            user = authenticate(username = email.replace('@' , '').replace('.' ,'') , password = password)
            login(request , user)
            if request.GET:
                return redirect(request.GET['next'])
            else:
                return redirect(globalSettings.LOGIN_REDIRECT)
    return render(request , 'register.simple.html' , {'msg' : msg})


def logoutView(request):
    logout(request)
    return redirect(globalSettings.LOGOUT_REDIRECT)

def root(request):
    return redirect(globalSettings.ROOT_APP)


@login_required(login_url = globalSettings.LOGIN_URL)
def home(request):
    u = request.user
    if u.is_superuser:
        apps = application.objects.all()
        modules = module.objects.filter(~Q(name='public'))
    else:
        apps = getApps(u)
        modules = getModules(u)
    apps = apps.filter(~Q(name__startswith='configure.' )).filter(~Q(name='app.users')).filter(~Q(name__endswith='.public'))
    return render(request , 'ngBase.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'appsWithJs' : apps.filter(haveJs=True) \
    ,'appsWithCss' : apps.filter(haveCss=True) , 'modules' : modules , 'useCDN' : globalSettings.USE_CDN , 'BRAND_LOGO' : globalSettings.BRAND_LOGO \
    ,'BRAND_NAME' :  globalSettings.BRAND_NAME})

class userProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = userProfileSerializer
    queryset = profile.objects.all()

class userProfileAdminModeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    serializer_class = userProfileAdminModeSerializer
    queryset = profile.objects.all()

class userDesignationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = designation.objects.all()
    serializer_class = userDesignationSerializer

class userAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    queryset = User.objects.all()
    serializer_class = userAdminSerializer

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSerializer
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.all().order_by('-date_joined')

class UserSearchViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSearchSerializer
    queryset = User.objects.all()
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.all().order_by('-date_joined')

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Group.objects.all()
    serializer_class = groupSerializer

class rankViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = rank.objects.all()
    serializer_class = rankSerializer

class payrollViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = payroll.objects.all()
    serializer_class = payrollSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user' ]


class leaveViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = leaveSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user']
    def get_queryset(self):
        if self.request.user.is_superuser:
            return Leave.objects.all()
        desigs = self.request.user.managing.all()
        reportees = []
        for d in desigs:
            reportees.append(d.user)
        return Leave.objects.filter(user__in = reportees )


class LeavesCalAPI(APIView):
    def get(self , request , format = None):
        payrollObj = payroll.objects.get(user = self.request.user.pk)
        print payrollObj,payrollObj.off
        fromDate = self.request.GET['fromDate'].split('-')
        toDate = self.request.GET['toDate'].split('-')
        fd = date(int(fromDate[0]), int(fromDate[1]), int(fromDate[2]))
        td = date(int(toDate[0]), int(toDate[1]), int(toDate[2]))
        fromDate = fd + relativedelta(days=1)
        toDate = td + relativedelta(days=1)
        chObj = CompanyHolidays.objects.filter(date__range=(str(fromDate),str(toDate)))
        print fromDate,toDate
        total = (toDate-fromDate).days + 1
        if toDate<fromDate:
            total = 0
        holidays = []
        sundays = []
        saturdays = []
        leaves = 0

        if total > 0:
            daysList = [fromDate + relativedelta(days=i) for i in range(total)]
            print daysList
            for i in daysList:
                print i,i.weekday()
                if i.weekday() < 5:
                    print 'holidays',holidays
                    for j in chObj:
                        if j.date == i:
                            holidays.append({'date':i,'name':j.name})
                elif payrollObj.off and i.weekday() == 5:
                    print 'saturday'
                    saturdays.append(i)
                elif i.weekday() == 6:
                    print 'sunday'
                    sundays.append(i)
            leaves = total - (len(holidays) + len(sundays) + len(saturdays))
        print total
        print holidays
        print sundays
        print saturdays
        print leaves
        toSend = {'total':total,'holidays':holidays,'sundays':sundays,'saturdays':saturdays,'leaves':leaves,'fromDate':fromDate,'toDate':toDate}
        return Response({'data':toSend}, status = status.HTTP_200_OK)

# class ProfileOrgChartsViewSet(viewsets.ModelViewSet):
#     permission_classes = (permissions.IsAuthenticated,)
#     queryset = designation.objects.all()
#     serializer_class = ProfileOrgChartsSerializer

def findChild(d, pk = None):
    toReturn = []
    sameLevel = False
    for des in  d.user.managing.all():
        try:
            dp = des.user.profile.displayPicture.url
            if dp == None:
                dp = '/static/images/userIcon.png'
        except:
            dp = '/static/images/userIcon.png'

        if des.role:
            role = des.role.name
        else:
            role = ''

        if str(des.user.pk) == pk:
            clsName = 'middle-level'
            sameLevel = True
        else:
            clsName = 'product-dept'
            if sameLevel:
                clsName = 'rd-dept'


        toReturn.append({
            "id" : des.user.pk,
            "name" : des.user.first_name + ' ' +  des.user.last_name,
            "dp" : dp,
            "children" : findChild(des),
            "role" : role,
            "className" :  clsName
        })

    return toReturn



class OrgChartAPI(APIView):
    def get(self , request , format = None):
        d = User.objects.get(pk = request.GET['user']).designation
        print d.role,d.reportingTo
        if d.reportingTo is not None:
            d = d.reportingTo.designation
        try:
            dp = d.user.profile.displayPicture.url
            if dp == None:
                dp = '/static/images/userIcon.png'

        except:
            dp = '/static/images/userIcon.png'

        if d.role:
            role = d.role.name
        else:
            role = ''


        if str(d.user.pk) == request.GET['user']:
            clsName = 'middle-level'
        else:
            clsName = 'frontend1'


        toReturn = {
            "id" : d.user.pk,
            "name" : d.user.first_name + ' ' +  d.user.last_name,
            "dp" : dp,
            "children" : findChild(d , pk = request.GET['user']),
            "role" : role,
            "className" :  clsName
            # "parent" : findChild(d),
        }

        print toReturn


        return Response(toReturn )
