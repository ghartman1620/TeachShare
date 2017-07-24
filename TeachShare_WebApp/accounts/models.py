# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save

from django.utils.timezone import now as timezone_now



import random
import string
import os

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


class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    text = models.TextField()
    user = models.CharField(max_length=100, default='')
    timestamp = models.DateTimeField(auto_now=False, auto_now_add= True)

    def __str__(self):
        return self.text

def create_random_string(length=30):
    if length <= 0:
        length = 30
		  
def upload_to(instance, filename):
    now = timezone_now()
    filename_base, filename_ext = os.path.splitext(filename)
    return 'my_uploads/{}{}/{}{}'.format(
        now.strftime("%Y/%m/%d/%Y%m%d%H%M%S/"),
        create_random_string(),
		  filename_base,
        filename_ext.lower())

'''    
class Post(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, default=1)
	title = models.CharField(max_length=100, default='')
	user = models.CharField(max_length=100, default='')
	content = models.TextField(default="")
	updated = models.DateTimeField(auto_now=True, auto_now_add=False)
	timestamp = models.DateTimeField(auto_now=False, auto_now_add= True)
'''

class Attachment(models.Model):
	post = models.ForeignKey(Post, on_delete=models.CASCADE)
	file = models.FileField(null=True, blank=True, upload_to = upload_to)

post_save.connect(create_profile, sender=User)
