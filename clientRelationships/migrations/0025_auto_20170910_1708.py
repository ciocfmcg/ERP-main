# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-09-10 17:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clientRelationships', '0024_auto_20170910_1656'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contract',
            name='deal',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contracts', to='clientRelationships.Deal'),
        ),
    ]
