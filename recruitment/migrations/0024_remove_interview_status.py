# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-06 07:00
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0023_auto_20180705_1052'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='interview',
            name='status',
        ),
    ]
