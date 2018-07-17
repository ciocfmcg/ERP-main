# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-09 12:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0028_auto_20180706_1034'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='interview',
            name='score',
        ),
        migrations.AddField(
            model_name='interview',
            name='dateOfJoin',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='interview',
            name='sallary',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
