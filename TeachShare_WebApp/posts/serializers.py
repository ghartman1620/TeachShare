'''
Created on Jan 23, 2018

@author: ghart
'''

from rest_framework import serializers
from posts.models import Post, Comment, Attachment, Tag


class PostSerializer(serializers.HyperlinkedModelSerializer):
    #user = serializers.HyperlinkedRelatedField(many=False, read_only=True, view_name='users')
    class Meta:
        model = Post
        fields = ('pk','user','title', 'content', 'updated', 'likes', 'comments', 'timestamp','attachments')
        # view_name='track-detail'
class CommentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Comment
        fields=('post', 'text', 'user','timestamp')
class AttachmentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model=Attachment
        fields=('post', 'file')
