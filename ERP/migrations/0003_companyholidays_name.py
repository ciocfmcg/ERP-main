# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-30 09:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ERP', '0002_companyholidays'),
    ]

    operations = [
        migrations.AddField(
            model_name='companyholidays',
            name='name',
            field=models.CharField(max_length=50, null=True),
        ),
    ]
