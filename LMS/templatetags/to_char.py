from django import template

register = template.Library()

@register.filter
def to_char(value):
    return chr(98-value)
