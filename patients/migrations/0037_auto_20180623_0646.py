# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-23 06:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0036_auto_20180623_0621'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activepatient',
            name='modeOfPayment',
        ),
        migrations.AddField(
            model_name='activepatient',
            name='cash',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='activepatient',
            name='insurance',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='activepatient',
            name='mlc',
            field=models.BooleanField(default=False),
        ),
    ]
