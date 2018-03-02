from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from django.conf import settings
from django.utils.timezone import now as timezone_now
import random
import string
from uuid import uuid4
import os

class Post(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=100, default='')
    content = JSONField()
    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    likes = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)
    tags = JSONField()


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
    # filename_base, filename_ext = os.path.splitext(filename)
    return '../media/uploads/{}{}/{}'.format(
        now.strftime("%Y/%m/%d/"),
        str(uuid4()),
        filename)


class Attachment(models.Model):
    post = models.ForeignKey(
        Post, related_name='attachments', on_delete=models.SET_NULL, null=True)
    file = models.FileField(null=True, blank=True, upload_to=upload_to)
# Creates list of tags for every post


