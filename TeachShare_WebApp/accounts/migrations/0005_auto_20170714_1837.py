# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-15 01:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_remove_post_description'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='ident',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='post',
            name='content',
            field=models.TextField(default=''),
        ),
    ]