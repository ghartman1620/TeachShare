from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer
from .models import Post, Comment, Attachment
from rest_framework import viewsets, views
from rest_framework.parsers import FileUploadParser

from django_filters import rest_framework as filters
from rest_framework.response import Response
from uuid import uuid4


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


# @TODO: figure out how to deal with bad url characters
class FileUploadView(views.APIView):
    parser_classes = (FileUploadParser,)

    def put(self, request, filename, format=None):
        file_obj = request.data['file']
        p = Post.objects.first()
        a = Attachment.objects.create(post=p, file=file_obj)
        file_obj.close()
        
        return Response(data={
                'status': 'OK', 
                'id': a.pk,
                'url': a.file.url,
                'filename': a.file.name
            }, 
            status=201)

