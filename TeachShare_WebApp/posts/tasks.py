import os

from celery import shared_task
from django.core.cache import cache
from django.core.management import call_command
from django.db.models import Q

from .models import Attachment, Post
from .serializers import PostSerializer
from datetime import timedelta
from django.utils import timezone


@shared_task
def add(x, y):
    print('Add task: ' + str(x) + ', ' + str(y))
    return x+y


@shared_task
def garbage_man():
    print('Garbage truck\'s a coming')
    with_files = Post.objects.filter(
        Q(content__contains=[{'type': 'file'}]) |
        Q(content__contains=[{'type': 'video_file'}]) |
        Q(content__contains=[{'type': 'audio'}]) |
        Q(content__contains=[{'type': 'image_file'}]))
    number = with_files.count()
    total = Post.objects.all().count()
    print('With Files: ' + str(number) + ' --> Total: ' + str(total))
    for p in with_files:
        print(p.content)


@shared_task
def delete_stranded_attachments():
    date_threshold = timezone.now() - timedelta(hours=2)
    stranded = Attachment.objects.filter(post=None, last_updated__lte=date_threshold)
    files = [f.file for f in stranded]
    print('Deleting files: ')
    print(files)
    print('... quantity: ' + str(len(files)))
    for f in files:
        print('attempting to remove: ' + f.name)
        try:
            os.remove(f.path)
            print('Successfully removed: ' + f.name)
        except OSError as e:
            print('ERROR!!')
            print(e)
    deleted = stranded.delete()
    print('finished removing ' + str(deleted) + '.')


@shared_task
def rebuild_index():
    call_command('search_index', '--rebuild', '-f')


@shared_task
def add_post_to_index_queue(post_id):
    p = Post.objects.get(pk=post_id)
    posts = cache.get('search_update_queue')
    print('Posts: ' + str(posts))
    if posts is None:
        posts = {}
    posts[p.pk] = True
    print(posts)
    cache.set('search_update_queue', posts, timeout=600)
