# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-06-19 05:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0007_auto_20180618_1230'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='grandTotal',
            field=models.PositiveIntegerField(default=0, null=True),
        ),
    ]
