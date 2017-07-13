# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class UserProfile(models.Model):
	user = models.OneToOneField(User)
	description = models.CharField(max_length=100, default='')
	phone = models.IntegerField( default=0)
	city = models.CharField(max_length=100, default='')

