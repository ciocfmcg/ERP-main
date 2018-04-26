from django.conf import settings # import the settings file

def global_settings(request):
    # return the value you want as a dictionnary. you may add multiple values in there.
    return {'USE_CDN': settings.USE_CDN}
