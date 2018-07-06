# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-06-22 06:50
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('patients', '0033_dischargesummary_treatingconsultant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dischargesummary',
            name='advice',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='complaintsAndReason',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='complications',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='courseInHospital',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='familyHistory',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='finalDiagnosis',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='historyOfAlchohol',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='keyFindings',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='pastHistory',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='patientCondition',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='provisionalDiagnosis',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='reviewOn',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='summIllness',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
        migrations.AlterField(
            model_name='dischargesummary',
            name='summaryKeyInvestigation',
            field=models.CharField(blank=True, max_length=2000, null=True),
        ),
    ]