'''
Created on Jan 23, 2018

@author: ghart
'''

from rest_framework import serializers
from posts.models import Post, Comment, Attachment
from accounts.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    # user = UserSerializer(required=True)

    class Meta:
        model = Comment
        fields = ('pk', 'post', 'text', 'user', 'timestamp')


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('pk', 'post', 'file')



class PostSerializer(serializers.ModelSerializer):
    # user = serializers.HyperlinkedRelatedField(many=False, read_only=True, view_name='users')
    # comments = CommentSerializer(many=True)
    # user = UserSerializer(required=True, read_only=True)
    # attachments = AttachmentSerializer(many=True)
    # tags = TagSerializer(many=True, required=False, read_only=True)
    # pk = serializers.ReadOnlyField()
        
    class Meta:
        model = Post
        fields = ('pk', 'title', 'content', 'updated',
                  'likes', 'timestamp', 'user', 'comments', 'attachments', 'tags')
