# test
from django.shortcuts import render
from rest_framework import viewsets, views
from rest_framework.parsers import FileUploadParser, JSONParser

from django_filters import rest_framework as filters
import django_filters
from rest_framework.response import Response

from .models import Post, Comment, Attachment
from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer

# test
from django.http import HttpResponse
from django.shortcuts import render


class PostFilter(filters.FilterSet):
    beginIndex = django_filters.NumberFilter(name='beginIndex', label="beginIndex", method='filterNumberPosts')
    class Meta:
        model = Post
        fields = ('user', 'title', 'updated', 'likes', 'timestamp', 'comments')
    def filterNumberPosts(self, queryset, name, value):
        
        return queryset[value:value+10]

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Post model
    """
    queryset = Post.objects.all()
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
        print(request)
        print(dir(request))
        print(request.data)
        print(request.query_params)
        id = request.query_params.get('uid', '')
        print(id)
    
        p = Post.objects.get(id=request.data['post'])
        a = Attachment.objects.create(post=p)
        print(p)
        return Response(data={
            'status': 'OK',
            'uid': id,
            'post': p.pk,
        }, status=201 )


def SimpleMethod(request): 
    return render(request, 'test.html')

#Known issues with backend upload:
#Files removed from the post are not deleted
#Attachment objects that are deleted do not delete the corresponding file

# @TODO: figure out how to deal with bad url characters
class FileUploadView(views.APIView):
    parser_classes = (FileUploadParser, JSONParser)

    def put(self, request, filename, format=None):
        file_obj = request.data['file']
        print(request.content_type)
        print(dir(request))
        print(request.parsers)
        print(request.query_params)
        print(filename)
        print(file_obj.name)
        p = Post.objects.first()
        a = Attachment.objects.create(post=p, file=file_obj)
        print(a.file.url)
        print(a.file.name)
        file_obj.close()
        
        return Response(data={
                'status': 'OK', 
                'id': a.pk,
                'request_id': request.query_params['id'],
                'url': a.file.url,
                'filename': a.file.name
            }, 
            status=201)

