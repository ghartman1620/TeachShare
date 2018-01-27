from django.db import models
from django.contrib.postgres.fields import JSONField
from django.conf import settings
from django.utils.timezone import now as timezone_now
import random
import string
import os
# Create your models here.


class Post(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='posts',
                             default=1, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, default='')
    content = JSONField()
    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    likes = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)

 
class Comment(models.Model):
    post = models.ForeignKey( 
        Post, related_name='comments', 
        on_delete=models.CASCADE)
    text = models.TextField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='comments',
                             default=1, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)

    def __str__(self):
        return self.text 


def upload_to(instance, filename):
    now = timezone_now()
    filename_base, filename_ext = os.path.splitext(filename)
    return 'my_uploads/{}{}/{}{}'.format(
        now.strftime("%Y/%m/%d/%Y%m%d%H%M%S/"),
        create_random_string(),
        filename_base,
        filename_ext.lower())


def create_random_string(length=30):
    if length <= 0:
        length = 30


class Attachment(models.Model):
    post = models.ForeignKey(
        Post, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(null=True, blank=True, upload_to=upload_to)

# Creates list of tags for every post


class Tag(models.Model):
    tag = models.CharField(max_length=100, default='')
    post = models.ForeignKey(Post, related_name='tags',
                             on_delete=models.CASCADE)
