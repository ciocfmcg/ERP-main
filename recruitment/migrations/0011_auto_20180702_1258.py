# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-07-02 12:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recruitment', '0010_auto_20180702_0747'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobapplication',
            name='coverletter',
            field=models.CharField(max_length=4000, null=True),
        ),
    ]