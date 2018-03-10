# test
from urllib.parse import unquote

import django_filters
# test
from django.http import HttpResponse
from django.shortcuts import render
from django_filters import rest_framework as filters
from rest_framework import views, viewsets
from rest_framework.parsers import FileUploadParser, JSONParser
from rest_framework.response import Response

from .documents import PostDocument
from .models import Attachment, Comment, Post
from .serializers import (AttachmentSerializer, CommentSerializer,
                          PostSerializer)
from .tasks import add

# Post search parameters
# Contains a keyword
# Contains all/any of multiple keywords

class SearchPostsView(views.APIView):

    # queryset = Post.objects.all() #this isn't used but it makes rest framework happy
    #s = PostDocument.search()
    def get_queryset(self):
        queryset = PostDocument.search()

        termParam = self.request.query_params.get('term', None)
        if termParam is not None:
            terms = unquote(termParam)
            termlist = terms.split(' ')
            for term in termlist:
                print('querying' + term)
                queryset = queryset.query('multi_match', query=term, fields=[
                                          'title', 'content', 'tags'])
        return queryset

    def get(self, request, format=None):
        response = []
        queryset = self.get_queryset()
        for hit in queryset:
            try:
                response.append(Post.objects.get(id=hit._d_['id']))
            except Post.DoesNotExist as e:
                pass

        return Response(PostSerializer(response, many=True).data)


class PostFilter(filters.FilterSet):
    beginIndex = django_filters.NumberFilter(
        name='beginIndex', label="beginIndex", method='filterNumberPosts')

    class Meta:
        model = Post
        fields = ('user', 'title', 'updated', 'likes', 'timestamp', 'comments')

    def filterNumberPosts(self, queryset, name, value):
        return queryset[value:value+10]


class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Post model
    """
    queryset = Post.objects.filter()
    serializer_class = PostSerializer
    filter_class = PostFilter

    def get_queryset(self):
        return self.queryset


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_fields = ('post', 'text', 'user', 'timestamp')


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Attachment model
    """
    parser_classes = (JSONParser, )
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    filter_fields = ('post',)

    def create(self, request):
        # grab upload identifier and post primary key
        id = request.query_params.get('uid', '')
        post_id = request.data['post']

        # grab the post instance and create the attachment instance
        p = Post.objects.get(id=post_id)
        a = Attachment.objects.create(post=p)

        # return the post id, status and unique identifier
        return Response(data={
            'status': 'OK',
            'uid': id,
            'post': p.pk,
        }, status=201)


def SimpleMethod(request):
    return render(request, 'test.html')

# Known issues with backend upload:
# Files removed from the post are not deleted
# Attachment objects that are deleted do not delete the corresponding file

class FileUploadView(views.APIView):
    parser_classes = (FileUploadParser, JSONParser)

    def put(self, request, filename, format=None):
        post_id = request.query_params['post']
        file_obj = request.data['file']
        p = Post.objects.get(pk=post_id) # this is where we need to actually know the post.
        a = Attachment.objects.create(post=p, file=file_obj)
        file_obj.close()

        return Response(data={
            'status': 'OK',
            'id': a.pk,
            'request_id': request.query_params['id'],
            'url': a.file.url,
            'filename': a.file.name
        },
            status=201)
