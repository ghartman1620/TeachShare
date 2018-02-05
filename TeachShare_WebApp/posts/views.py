from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer, TagSerializer
from .models import Post, Comment, Attachment, Tag
from rest_framework import viewsets
from django_filters import rest_framework as filters


# test
from django.http import HttpResponse
from django.shortcuts import render
 

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Post model
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_fields = ('user', 'title', 'updated', 'likes', 'timestamp')


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_fields = ('post', 'text', 'user', 'timestamp')


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Attachment model
    """
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    filter_fields = ('post',)


def SimpleMethod(request):
    return render(request, 'test.html')

class TagViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Attachment model
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filter_fields = ('tag', 'post')