# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.utils.timezone import now as timezone_now


import random
import string
import os

# Create your models here.
# userprofile & related models

class UserProfile(models.Model):
    user = models.OneToOneField(
        User, primary_key=True, on_delete=models.CASCADE)
    schoolDistrict = models.CharField(max_length=500, default='')

    def __str__(self):
        return self.user.username


class GradeTaught(models.Model):
    grade = models.CharField(max_length=100, default='')
    userProfile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)


class SubjectTaught(models.Model):
    subject = models.CharField(max_length=100, default='')
    userProfile = models.ForeignKey(UserProfile, on_delete=models.CASCADE,
                                    related_name='subjects')


def create_profile(sender, **kwargs):
    if kwargs['created']:
        user_profile = UserProfile.objects.create(user=kwargs['instance'])
        user_profile.save()


post_save.connect(create_profile, sender=User)


def create_random_string(length=30):
    if length <= 0:
        length = 30

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     if created:
#         Token.objects.create(user=instance)


post_save.connect(create_profile, sender=User)
