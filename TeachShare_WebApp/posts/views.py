# test
from django.shortcuts import render
from rest_framework import viewsets, views
from rest_framework.parsers import FileUploadParser, JSONParser
from rest_framework.response import Response

from .models import Post, Comment, Attachment
from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer


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

