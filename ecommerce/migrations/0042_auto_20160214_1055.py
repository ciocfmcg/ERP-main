# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-14 05:25
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0041_review_heading'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='text',
            field=models.TextField(max_length=1000, null=True),
        ),
    ]
