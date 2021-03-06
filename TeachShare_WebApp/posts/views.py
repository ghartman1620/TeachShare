# test
from urllib.parse import unquote

import django_filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Post, Comment, Attachment
from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer
from .documents import PostDocument

# test
from django.http import HttpResponse
from django.shortcuts import render
from django.db.models import Q
from urllib.parse import unquote
from enum import Enum
from elasticsearch_dsl.query import MultiMatch
from django_filters import rest_framework as filters
from rest_framework import status, views, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FileUploadParser, JSONParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .documents import PostDocument
from .models import Attachment, Comment, Post
from .serializers import (AttachmentSerializer, CommentSerializer,
                          PostSerializer)
from .tasks import add
import os 

#Post search parameters
#?term=string - searching for this string
#?in=string - a list containing some of "title" "filenames" "content" "tags"
#?sort=string - one of "date" "score" TODO - likes
#?exclude=string - some keywords to discard some search results
#?termtype=string - either 'and' or 'or' - says whether multiple words
    #should try to match every one of the words or any of the words
#?excludetype=string - either 'and' or 'or' - says whether to exclude 
    #posts with all of the words listed or any of the words listed
# test


# Post search parameters
# Contains a keyword
# Contains all/any of multiple keywords

class Term(Enum):
    AND = 0
    OR = 1
    @staticmethod
    def fromString(str):
        if(str=='and'):
            print('retuning and term')
            return Term.AND
        else:
            print('returning or term')
            return Term.OR
    def joinQueries(self, query1, query2):
        print(self)
        
        if(self.value == Term.AND.value):
            print('retruning and')
            return query1 & query2
        else: #or
            print('returning or')
            return query1 | query2
class SearchPostsView(views.APIView):
    searchIn = ['title', 'content', 'tags'] #default
    termType = Term.OR
    excludeType = Term.OR
    permission_classes = (AllowAny,)
    '''
    Each of these parameter dicts defines a function to 
    deal with a particular query parameter. The params among
    each list will be dealt with in any order, if they exist.
    Each of these functions takes two arguments - the query param
    value and the queryset.
    '''
    #optionParams will be dealt with first. They affect filtering. 
    def setSearchIn(self, value, queryset):
        self.searchIn = value.split(" ")
        return queryset
    def setTermType(self, value, queryset):
        print(value)
        self.termType = Term.fromString(value)
        return queryset
    def setExcludeType(self, value, queryset):
        print('in exclude type')
        print(value)
        self.excludeType = Term.fromString(value)
        return queryset

    optionParams = {
        'in'      : setSearchIn,
        'termtype': setTermType,
        'excludetype' : setExcludeType,
    }
    
    #filterParams come next. they perform filters.
    def filterByTerm(self, value, queryset):
        terms = value.split(' ')
        myQuery = MultiMatch(query=terms[0], fields=self.searchIn)

        for term in terms[1:]:
            myQuery = self.termType.joinQueries(myQuery, MultiMatch(query=term, fields=self.searchIn))
        return queryset.query(myQuery)

    def filterByExcludedTerm(self, value, queryset):
        terms = value.split(' ')
        myQuery = MultiMatch(query=terms[0], fields=self.searchIn)
        print('in exclude filter')
        print(value)
        for term in terms[1:]:
            myQuery = self.excludeType.joinQueries(myQuery, MultiMatch(query=term, fields=self.searchIn))
        return queryset.exclude(myQuery)

    filterParams = {
        'term'    : filterByTerm,
        'exclude' : filterByExcludedTerm,
    }

    
    #sort parameters are last. They sort results.  
    def sortBy(self, value, queryset):
        return queryset.sort(
            'title'
        )
    sortParams = {
        'sort'    : sortBy,
    }

    def parseParams(self, paramSet, queryset):
        for param, func in paramSet.items():
            arg = self.request.query_params.get(param, None)
            if arg != None:
                queryset = func(self, unquote(arg), queryset)
        return queryset

    def get_queryset(self):
        queryset = PostDocument.search()
        queryset = self.parseParams(self.optionParams, queryset)
        queryset = self.parseParams(self.filterParams, queryset)
        queryset = self.parseParams(self.sortParams,   queryset)
        return queryset


    def get(self, request, format=None):
        response = []
        queryset = self.get_queryset()
        for hit in queryset.scan():
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
        fields = ('draft', 'user', 'title', 'updated', 'likes', 'timestamp', 'comments')

    def filterNumberPosts(self, queryset, name, value):
        return queryset[value:value+10]


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Post model
    """
    # permission_classes = (IsAuthenticated,)
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_class = PostFilter
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return self.queryset


class CommentViewSet(viewsets.ModelViewSet):
    # permission_classes = (IsAuthenticated,)
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_fields = ('post', 'text', 'user', 'timestamp')


class AttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Attachment model
    """
    permission_classes = (IsAuthenticated,)
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

# @TODO: figure out how to deal with bad url characters

# @TODO: write tests for uploading restricted files
def isBinary(f):
    chunk = f.read(1024)
    if '\0' in chunk:
        return True
    else:
        return False
 
def fileExt(filename):
    ext = ""
    for i in reversed(range(0, len(filename))):
        if filename[i] == '.':
            break
        ext = filename[i] + ext

    print(ext)
    return ext
#these are allowed binary filetypes
whitelist = ['pdf','doc', 'ppt','docx', 'odt', 'xlsx', 'xls', 'xlt', 'csv', 'ods', 'ots', 'fods', 'tex']


class FileUploadView(views.APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = (FileUploadParser, JSONParser)

    def put(self, request, filename, format=None):
        post_id = request.query_params['post']
        file_obj = request.data['file']
        p = Post.objects.get(pk=post_id) # this is where we need to actually know the post.
        a = Attachment.objects.create(post=p, file=file_obj)
        
        # print(os.path.dirname(os.path.realpath(__file__)) + a.file.url[1:])
        # with open(os.path.dirname(os.path.realpath(__file__)) + a.file.url, encoding='latin1') as f:
        #     if isBinary(f) and not fileExt(a.file.url) in whitelist:
        #         print('bad filetype!') 
        #         return Response(data={
        #             'error' : fileExt(a.file.url) + ' files are allowed. Allowed filetypes are: ' + str(whitelist)
        #         }, status=status.HTTP_400_BAD_REQUEST)
        # print(a.file.name)
        file_obj.close()

        return Response(data={
            'status': 'OK',
            'id': a.pk,
            'request_id': request.query_params['id'],
            'url': a.file.url,
            'filename': a.file.name
        },
            status=201)
