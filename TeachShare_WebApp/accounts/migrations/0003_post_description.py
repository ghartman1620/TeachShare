# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-15 00:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_post'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='description',
            field=models.TextField(default=''),
        ),
    ]