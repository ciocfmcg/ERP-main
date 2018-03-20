from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from django.db.models import Q
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from gitweb.views import generateGitoliteConf
import requests

class SendSMSApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        print "came"
        if 'number' not in request.data or 'text' not in request.data:
            return Response(status = status.HTTP_400_BAD_REQUEST)
        else:
            url = globalSettings.SMS_API_PREFIX + 'number=%s&message=%s'%(request.data['number'] , request.data['text'])
            # print url
            requests.get(url)
            return Response(status = status.HTTP_200_OK)

def serviceRegistration(request): # the landing page for the vendors registration page
    return render(request , 'app.ecommerce.register.partner.html')

class serviceRegistrationApi(APIView):
    permission_classes = (permissions.AllowAny ,)

    def get(self, request , format = None):
        u = request.user
        if service.objects.filter(user = u).count() == 0:
            return Response(status = status.HTTP_404_NOT_FOUND)
        else:
            print service.objects.get(user = u).pk
        return Response(status = status.HTTP_200_OK)


    def post(self, request, format=None):
        u = request.user
        if not u.is_anonymous():
            if service.objects.filter(user = u).count() == 0:
                cp = customerProfile.objects.get(user = u)
                ad = cp.address
                if cp.mobile is None:
                    if 'mobile' in request.data:
                        mob = request.data['mobile']
                    else:
                        return Response({'mobile' : 'No contact number found in the account'}, status = status.HTTP_400_BAD_REQUEST)
                else:
                    mob = cp.mobile
                s = service(name = u.get_full_name() , user = u , cin = 0 , tin = 0 , address = ad , mobile = mob, telephone = mob , about = '')
            else:
                s = service.objects.get(user = u)
            s.save()
            add_application_access(u , ['app.ecommerce' , 'app.ecommerce.orders' , 'app.ecommerce.offerings','app.ecommerce.earnings'] , u)
            return Response( status = status.HTTP_200_OK)

        first_name = request.data['first_name']
        last_name = request.data['last_name']
        email = request.data['email']
        password = request.data['password']

        # serviceForm1 data
        name = request.data['name'] # company's name
        cin = request.data['cin']
        tin = request.data['tin']
        mobile = request.data['mobile']
        telephone = request.data['telephone']

        # serviceForm2 data
        street = request.data['street']
        pincode = request.data['pincode']
        city = request.data['city']
        state = request.data['state']
        about = request.data['about']

        if User.objects.filter(email = email).exists():
            content = { 'email' : 'Email ID already exists' }
            return Response(content, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = User.objects.create(username = email.replace('@' , '').replace('.' ,''))
            user.first_name = first_name
            user.last_name = last_name
            user.email = email
            user.set_password(password)
            user.is_active = False
            user.save()
            ad = address(street = street , city = city , state = state , pincode = pincode )
            ad.save()
            se = service(name = name , user = user , cin = cin , tin = tin , address = ad , mobile = mobile, telephone = telephone , about = about)
            se.save()

            salt = hashlib.sha1(str(random.random())).hexdigest()[:5]
            activation_key = hashlib.sha1(salt+email).hexdigest()
            key_expires = datetime.datetime.today() + datetime.timedelta(2)

            ak = accountsKey(user=user, activation_key=activation_key,
                key_expires=key_expires)
            link = globalSettings.SITE_ADDRESS + '/token/?key=%s' % (activation_key)
            ctx = {
                'logoUrl' : 'http://design.ubuntu.com/wp-content/uploads/ubuntu-logo32.png',
                'heading' : 'Welcome',
                'recieverName' : user.first_name,
                'message': 'Thanks for signing up. To activate your account, click this link within 48hours',
                'linkUrl': link,
                'linkText' : 'Activate',
                'sendersAddress' : 'Street 101 , State, City 100001',
                'sendersPhone' : '129087',
                'linkedinUrl' : 'linkedin.com',
                'fbUrl' : 'facebook.com',
                'twitterUrl' : 'twitter.com',
            }

            # Send email with activation key
            email_subject = 'Account confirmation'
            email_body = get_template('app.ecommerce.email.html').render(ctx)

            msg = EmailMessage(email_subject, email_body, to= [email] , from_email= 'pkyisky@gmail.com' )
            msg.content_subtype = 'html'
            msg.send()
            content = {'pk' : user.pk , 'username' : user.username , 'email' : user.email}
            ak.save()
            return Response(content , status = status.HTTP_200_OK)

class addressViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin , )
    serializer_class = addressSerializer
    def get_queryset(self):
        u = self.request.user
        has_application_permission(u , ['app.ecommerce' , 'app.ecommerce.orders'])
        return address.objects.all()

class serviceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated , )
    serializer_class = serviceSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        u = self.request.user
        return service.objects.all()

class registerDeviceApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        if 'username' in request.data and 'password' in request.data and 'sshKey' in request.data:
            sshKey = request.data['sshKey']
            deviceName =sshKey.split()[2]
            mode = request.data['mode']
            print sshKey
            user = authenticate(username =  request.data['username'] , password = request.data['password'])
            if user is not None:
                if user.is_active:
                    d , n = device.objects.get_or_create(name = deviceName , sshKey = sshKey)
                    gp , n = profile.objects.get_or_create(user = user)
                    if mode == 'logout':
                        print "deleted"
                        gp.devices.remove(d)
                        d.delete()
                        generateGitoliteConf()
                        return Response(status=status.HTTP_200_OK)
                    gp.devices.add(d)
                    gp.save()
                    generateGitoliteConf()
            else:
                raise NotAuthenticated(detail=None)
            return Response(status=status.HTTP_200_OK)
        else:
            raise ValidationError(detail={'PARAMS' : 'No data provided'} )

class deviceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = deviceSerializer
    queryset = device.objects.all()

class profileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = profileSerializer
    queryset = profile.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']

class AccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        return globalSettings.ON_REGISTRATION_SUCCESS_REDIRECT

def getModules(user , includeAll=False):
    if user.is_superuser:
        if includeAll:
            return module.objects.all()
        else:
            return module.objects.filter(~Q(name='public'))
    else:
        ma = []
        for m in application.objects.filter(owners__in = [user,]).values('module').distinct():
            ma.append(m['module'])
        aa = []
        for a in user.accessibleApps.all().values('app'):
            aa.append(a['app'])
        for m in application.objects.filter(pk__in = aa).values('module').distinct():
            ma.append(m['module'])
        return module.objects.filter(pk__in = ma)

class moduleViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = module.objects.all()
    serializer_class = moduleSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        includeAll = False
        if 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'search':
                includeAll = True
        u = self.request.user
        return getModules(u , includeAll)

def getApps(user):
    aa = []
    for a in user.accessibleApps.all().values('app'):
        aa.append(a['app'])
    if user.appsManaging.all().count()>0:
        return application.objects.filter(pk__in = aa).exclude(pk__in = user.appsManaging.all().values('pk')).exclude(module = module.objects.get(name = 'public')) | user.appsManaging.all()
    return application.objects.filter(pk__in = aa)

class applicationViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly,)
    serializer_class = applicationSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' , 'module']
    def get_queryset(self):
        u = self.request.user
        if not u.is_superuser:
            return getApps(u)
        else:
            if 'user' in self.request.GET:
                return getApps(User.objects.get(username = self.request.GET['user']))
            return application.objects.filter(inMenu = True)

class applicationAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin,)
    serializer_class = applicationAdminSerializer
    # queryset = application.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        if not self.request.user.is_superuser:
            raise PermissionDenied(detail=None)
        return application.objects.all()


class applicationSettingsViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly , )
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app']

class applicationSettingsAdminViewSet(viewsets.ModelViewSet):
    # permission_classes = (isAdmin,)
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsAdminSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app' , 'name']


class groupPermissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = groupPermission.objects.all()
    serializer_class = groupPermissionSerializer

class permissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = permission.objects.all()
    serializer_class = permissionSerializer
