# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-17 20:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='checkboxStr',
            field=models.CharField(default='', max_length=100),
        ),
    ]
