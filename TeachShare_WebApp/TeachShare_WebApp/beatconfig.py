import os
from datetime import timedelta
from channels.layers import get_channel_layer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TeachShare_WebApp.settings')

BEAT_SCHEDULE = {
    # 'print-sumer': {
    #     'channel_name': 'print-sumer',
    #     'schedule': timedelta(seconds=2),
    #     'message': {'type': 'test.print', 'msg': 'heyyyy there'}
    # },
    'cleanup-uploads': {
        'channel_name': 'garbage-truck',
        'schedule': timedelta(seconds=10),
        'message': {'type': 'clean.uploads', 'msg': ''}
    },
}

channel_layers = get_channel_layer()

