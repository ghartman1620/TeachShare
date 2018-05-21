'''
Created on Jan 23, 2018

@author: ghart
'''

from rest_framework import serializers
from posts.models import Post, Comment, Attachment, Standard
from accounts.serializers import UserSerializer

class DynamicFieldsSerializer(serializers.ModelSerializer):
    """ `Dynamic` Field Serializer -
            Returns only the fields given by the 'fields' query parameter
            or all in the case of the fields query parameter being missing.
    """
    def __init__(self, *args, **kwargs):
        super(DynamicFieldsSerializer, self).__init__(*args, **kwargs)
        request = self.context.get('request')
        print(request)
        fields = None
        if request:
            fields = request.query_params.get('fields', None)
            if fields:
                fields = fields.split(',')
                allowed = set(fields)
                existing = set(self.fields.keys())
                for field_name in existing - allowed:
                    self.fields.pop(field_name)


class StandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Standard   
        fields = ('pk', 'name', 'category', 'grade', 'description', 'subject', 'code')

class CommentSerializer(serializers.ModelSerializer):
    # user = UserSerializer(required=True)

    class Meta:
        model = Comment
        fields = ('pk', 'post', 'text', 'user', 'timestamp')


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('pk', 'post', 'file', 'last_updated')


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
                  'likes', 'timestamp', 'user', 'comments',
                  'tags', 'draft', 'length', 'content_type', 
                  'standards', 'subject', 'grade', 'practices',
                  'crosscutting_concepts', 'disciplinary_core_ideas', 'color', 'layout')
