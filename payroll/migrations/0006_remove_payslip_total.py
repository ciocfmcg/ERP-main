# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-03-17 10:34
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0005_auto_20180317_1027'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='payslip',
            name='total',
        ),
    ]
