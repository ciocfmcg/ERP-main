# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-09-03 03:45
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ERP', '0012_auto_20170901_1104'),
    ]

    operations = [
        migrations.AddField(
            model_name='address',
            name='country',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
