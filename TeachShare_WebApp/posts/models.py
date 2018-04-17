from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from django.conf import settings
from django.utils.timezone import now as timezone_now
import random
import string
from uuid import uuid4
import os


class Standard(models.Model):
    


class Post(models.Model):
    GRADES = (
        (0, 'Preschool'),
        (1, 'Kindergarten'),
        (2, 'First Grade'),
        (3, 'Second Grade'),
        (4, 'Third Grade'),
        (5, 'Fourth Grade'),
        (6, 'Fifth Grade'),
        (7, 'Sixth Grade'),
        (8, 'Seventh Grade'),
        (9, 'Eighth Grade'),
        (10, 'Ninth Grade'),
        (11, 'Tenth Grade'),
        (12, 'Eleventh Grade'),
        (13, 'Twelfth Grade'),
    )

    CONTENT_TYPE = (
        (0, 'Game'),
        (1, 'Lab'),
        (2, 'Lecture')
    )

    SUBJECTS = (
        (0, 'Math'),
        (1, 'English Language Arts'),
        (2, 'Physical Sciences'),
        (3, 'Life Sciences'),
        (4, 'Earth and Space Sciences'),
        (5, 'Engineering, Technology, and the Applications of Science'),
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
    grade = models.IntegerField(choices=GRADES, default=0)
    subject = models.IntegerField(choices=SUBJECTS, default=0)
    length = models.DurationField()
    content_type = models.IntegerField(choices=CONTENT_TYPE,default=0)


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
    last_updated = models.DateTimeField(auto_now=True, auto_now_add=False)
# Creates list of tags for every post
