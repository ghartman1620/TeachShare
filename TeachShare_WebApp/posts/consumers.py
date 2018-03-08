from channels.consumer import SyncConsumer, AsyncConsumer
from channels.db import database_sync_to_async
from posts.models import Attachment, Post
from django.db.models import Q
import asyncio
import time

class PrintConsumer(SyncConsumer):
    def test_print(self, message):
        print('PrintConsumer: ', message['msg'])
        print()

class AsyncPrint(AsyncConsumer):
    async def print_msg(self, msg):
        await asyncio.sleep(1)
        print('AsyncPrint: ', msg['msg'])
        print()
        return 'future is done!'
        
class GarbageTruck(AsyncConsumer):
    async def clean_uploads(self, msg):
        self.files = await database_sync_to_async(self.get_attachments)()
        self.posts = await database_sync_to_async(self.get_posts_content)()
        print(self.files)
        print()
        # print(self.posts)
        for i in self.posts:
            print(i.content)
    
    def get_attachments(self):
        return Attachment.objects.all()

    def get_posts_content(self):
        p = Post.objects.get(
            Q(content__contains=[{'type': 'file'}]) | 
            Q(content__contains=[{'type': 'video_file'}]) |
            Q(content__contains=[{'type': 'audio'}]) |   
            Q(content__contains=[{'type': 'image_file'}])
        )
        print(p)
        return p