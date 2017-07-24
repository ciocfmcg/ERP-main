# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-07-23 13:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0048_auto_20161017_1736'),
    ]

    operations = [
        migrations.AddField(
            model_name='genericproduct',
            name='minCost',
            field=models.PositiveIntegerField(default=0, max_length=8),
        ),
        migrations.AddField(
            model_name='genericproduct',
            name='visual',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='ecommerce.media'),
        ),
    ]