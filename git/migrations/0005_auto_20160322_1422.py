# -*- coding: utf-8 -*-
# Generated by Django 1.9.3 on 2016-03-22 08:52
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('git', '0004_auto_20160321_1602'),
    ]

    operations = [
        migrations.AlterField(
            model_name='repo',
            name='groups',
            field=models.ManyToManyField(null=True, to='git.groupPermission'),
        ),
        migrations.AlterField(
            model_name='repo',
            name='perms',
            field=models.ManyToManyField(null=True, to='git.repoPermission'),
        ),
    ]