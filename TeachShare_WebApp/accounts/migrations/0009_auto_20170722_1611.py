# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-22 23:11
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_likedpost'),
    ]

    operations = [
        migrations.AddField(
            model_name='likedpost',
            name='postId',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='likedpost',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='likedpost',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]