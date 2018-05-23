# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-05-23 09:16
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tools', '0008_documentcomment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documentcomment',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='documentComment', to=settings.AUTH_USER_MODEL),
        ),
    ]
