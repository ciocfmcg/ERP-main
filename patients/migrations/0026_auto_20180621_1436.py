# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2018-06-21 14:36
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0025_auto_20180621_1411'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dischargesummary',
            name='patientName',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dischargeSummary', to='patients.Patient'),
        ),
    ]