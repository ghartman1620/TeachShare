from accounts.models import User
from posts.models import Post
import json
from datetime import timedelta
import django
django.setup()

Post.objects.all().delete()
with open('posts/testPostContent.json', encoding='utf8') as f:
    posts = json.loads(f.read())
    for obj in posts:
        Post.objects.create(
            title=obj['title'],
            user=User.objects.get(username="admin"),
            content=obj['content'],
            tags=obj['tags'],
            grade=0,
            content_type=0,
            length=timedelta(seconds=0),
            draft=False
        )   