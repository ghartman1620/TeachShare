from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer
from .models import Post, Comment, Attachment
from rest_framework import viewsets

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Post model
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    

class AttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Attachment model
    """
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
