# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

# Create your models here.

class Post(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, default=1)
	title = models.CharField(max_length=100, default='')
	user = models.CharField(max_length=100, default='')
	content = models.TextField(default="")
	updated = models.DateTimeField(auto_now=True, auto_now_add=False)
	likes = models.IntegerField(default=0)
	timestamp = models.DateTimeField(auto_now=False, auto_now_add= True)
	

class UserProfile(models.Model):
	user = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE)
	subjectTaught = models.CharField(max_length=200, default='')
	schoolDistrict = models.CharField(max_length=500, default='')
	favorites = models.ManyToManyField(Post)
	
	def __str__(self):
		return self.user.username
	

	
	
class GradeTaught(models.Model):
	grade = models.CharField(max_length=100, default='')
	userProfile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
	
def create_profile(sender, **kwargs):
	if kwargs['created']:
		user_profile = UserProfile.objects.create(user=kwargs['instance'])
		user_profile.save()

# Creates list of tags for every post
class Tag(models.Model):
	tag = models.CharField(max_length=100, default='')
	post = models.ForeignKey(Post, on_delete=models.CASCADE)

post_save.connect(create_profile, sender=User)