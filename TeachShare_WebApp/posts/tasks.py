from celery import shared_task
from django.core.management import call_command

@shared_task
def add(x, y):
    print('Add task: ' + str(x) + ', ' + str(y))
    return x+y

@shared_task
def garbage_man():
    print('Garbage truck\'s a coming')

@shared_task
def rebuild_index():
    call_command('search_index', '--rebuild', '-f')