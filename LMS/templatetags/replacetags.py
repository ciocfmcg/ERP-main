from django import template

register = template.Library()

@register.filter
def replacetags(value):
    return '{'+value.replace("\\","/")+'}'


# Note, the function name of templatetags and file name replacetags.py can not be other names.
