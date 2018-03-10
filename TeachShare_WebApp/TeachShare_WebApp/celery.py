from __future__ import absolute_import, unicode_literals

import os

from celery import Celery
from celery.schedules import crontab

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TeachShare_WebApp.settings')

app = Celery('TeachShare_WebApp')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# celery beat schedule
app.conf.beat_schedule = {
    # 'search-index-full-rebuild': {
    #     'task': 'posts.tasks.rebuild_index',
    #     'schedule': crontab(minute='*/1'),
    #     'args': ()
    # }, 
}

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
