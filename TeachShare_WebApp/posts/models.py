from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from django.conf import settings
from django.utils.timezone import now as timezone_now
import random
import string
from uuid import uuid4
import os


class Subject(models.Model):
    name = models.CharField(max_length=80)


class Post(models.Model):
    GRADES = (
        (0, 'Preschool'),
        (1, 'Kindergarten'),
        (2, 'First Grade')
    )

    CONTENT_TYPE = (
        (0, 'Game'),
        (1, 'Lab'),
        (2, 'Lecture')
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="posts")
    title = models.CharField(max_length=100, default='', blank=True)
    content = JSONField()
    updated = models.DateTimeField(auto_now=True, auto_now_add=False)
    likes = models.IntegerField(default=0)
    draft = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now=False, auto_now_add=True)
    tags = JSONField()
    grade = models.IntegerField(choices=GRADES)
    subject = models.ForeignKey(
        Subject, on_delete=models.DO_NOTHING, null=True)
    length = models.DurationField()
    content_type = models.IntegerField(choices=CONTENT_TYPE)


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
