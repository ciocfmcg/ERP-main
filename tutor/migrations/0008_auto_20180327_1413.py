# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-03-27 14:13
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tutor', '0007_message_msg'),
    ]

    operations = [
        migrations.RenameField(
            model_name='message',
            old_name='MSG',
            new_name='msg',
        ),
    ]