# test
from urllib.parse import unquote

import django_filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from django.core.exceptions import PermissionDenied
from .models import Post, Comment, Attachment, Standard
from .serializers import PostSerializer, AttachmentSerializer, CommentSerializer, StandardSerializer
from .documents import PostDocument

# test
from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.auth.models import Permission
from django.db.models import Q
from urllib.parse import unquote
from enum import Enum
from elasticsearch_dsl.query import MultiMatch, Match
from django_filters import rest_framework as filters
from rest_framework import status, views, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FileUploadParser, JSONParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .documents import PostDocument
from .models import Attachment, Comment, Post
from django.contrib.auth.models import User
from .serializers import (AttachmentSerializer, CommentSerializer,
                          PostSerializer)
from .tasks import add
import os
import google.cloud.storage
from django.conf import settings
from guardian.shortcuts import assign_perm, remove_perm, get_objects_for_user


#Post search parameters
#?term=string - searching for this string
#?in=string - a list containing some of 'title' 'filenames' 'content' 'tags'
#?sort=string - one of 'date' 'score' 
#?exclude=string - some keywords to discard some search results
#?termtype=string - either 'and' or 'or' - says whether multiple words a query
    #should try to match every one of the words or any of the words
#?excludetype=string - either 'and' or 'or' - says whether to exclude  a query
    #posts with all of the words listed or any of the words listed
#?standards=string - space separated list of standard primary keys. a query
    #returns posts with any of the standards with the pks listed

#?grades=number - a grade number. (0=P, 1=K, 2=1st, etc... 10=9th-12th) query
#?length=number - right now it must be exact, usually in 15 minute increments. query
        #@TODO find how to make this be an approximation? Perhaps our times should just be ranges?
#?subject=number - a subject. math=0, ela=1, phys=2, life=3, earth=4, eng=5. a filter
#?content_type=number - a content type: 0 game, 1 lab, 2 lecture


# Post search parameters
# Contains a keyword
# Contains all/any of multiple keywords

class Term(Enum):
    AND = 0
    OR = 1

    @staticmethod
    def fromString(str):
        if(str == 'and'):
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
        else:  # or
            print('returning or')
            return query1 | query2


class SearchPostsView(views.APIView):
    searchIn = ['title', 'content', 'tags']  # default
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
    # optionParams will be dealt with first. They affect filtering.

    def setSearchIn(self, value, queryset):
        self.searchIn = value.split(' ')
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
        'in': setSearchIn,
        'termtype': setTermType,
        'excludetype': setExcludeType,
    }
    
    #Rather than each of these functions performing filters,
    #they should instead return a set of matches.
    #These should be combined together to perform a single query.

    #The goal is that with a set of combined matches elasticsearch
    #will give us a whole bunch of posts that match any of the matches
    #ranked by relevance. Then on the frontend we can display the results
    #by relevance, and then have our search results page display in some nice
    #way to the user which matches they searched for matched posts.


    #filterParams come next. they perform filters.
    def filterByTerm(self, value, queryset):
        terms = value.split(' ')
        myQuery = MultiMatch(query=terms[0], fields=self.searchIn)

        for term in terms[1:]:
            myQuery = self.termType.joinQueries(
                myQuery, MultiMatch(query=term, fields=self.searchIn))
        return queryset.query(myQuery)

    def filterByExcludedTerm(self, value, queryset):
        terms = value.split(' ')
        myQuery = MultiMatch(query=terms[0], fields=self.searchIn)
        print('in exclude filter')
        print(value)
        for term in terms[1:]:
            myQuery = self.excludeType.joinQueries(
                myQuery, MultiMatch(query=term, fields=self.searchIn))
        return queryset.exclude(myQuery)

    def queryByStandards(self, value, queryset):
        print('filtering by standards')
        terms = value.split(' ')
        myQuery = Match(standards=terms[0])
        for term in terms[1:]:
            myQuery = Term.OR.joinQueries(myQuery, Match(standards=term))
        return queryset.query(myQuery)


        return queryset

    #test me!
    def queryByContentType(self, value, queryset):
        myQuery = Match(content_type=int(value))
        return queryset.query(myQuery)
    #test
    def queryByLength(self, value, queryset):
        myQuery = Match(length=int(value))
        return queryset.query(myQuery)

    #test
    def queryBySubject(self, value, queryset):
        myQuery = Match(subject=int(value))
        return queryset.query(myQuery)

    #test
    def queryByGrade(self, value, queryset):
        myQuery = Match(grade=int(value))
        return queryset.query(myQuery)

    filterParams = {
        'term'         : filterByTerm,
        'exclude'      : filterByExcludedTerm,
        'standard'     : queryByStandards,
        'content_type' : queryByContentType,
        'length'       : queryByLength,
        'subject'      : queryBySubject,
        'grade'        : queryByGrade,
    }

    # sort parameters are last. They sort results.
    def sortBy(self, value, queryset):
        return queryset.sort(
            'title'
        )
    sortParams = {
        'sort': sortBy,
    }

    def parseParams(self, paramSet, queryset):
        for param, func in paramSet.items():
            arg = self.request.query_params.get(param, None)
            if arg != None:
                queryset = func(self, unquote(arg), queryset)
        return queryset

    def get_queryset(self):
        queryset = PostDocument.search()
        print('[get_queryset]: ', queryset)
        queryset = self.parseParams(self.optionParams, queryset)
        queryset = self.parseParams(self.filterParams, queryset)
        queryset = self.parseParams(self.sortParams,   queryset)
    
        return queryset

    def get(self, request, format=None):
        response = []
        try:
            queryset = self.get_queryset()
        except ValueError:
            return Response({'error': 'bad query parameter type'}, status=status.HTTP_400_BAD_REQUEST)
        for hit in queryset.scan():
            try:
                response.append(Post.objects.get(id=hit._d_['id']))
            except Post.DoesNotExist as e:
                pass

        return Response(PostSerializer(response, many=True).data)

from enum import Enum
class PostPermission(Enum):
    VIEW = 'view'
    CHANGE = 'change'
    def permission(self):
        return Permission.objects.get(codename=self.value + '_post')





class PostPermissionViewSet(views.APIView):
    permission_classes=(IsAuthenticated,)

    def post(self, request):
        post = None
        try:
            post = Post.objects.get(pk=request.data['post'])
        except KeyError as e:
            return Response({'error' : 'required field: \'post\''},status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist as e:
            return Response({'error' : 'that post does not exist'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({'error' : 'invalid type for param post'}, status=status.HTTP_400_BAD_REQUEST)
        if request.user == post.user:
            permission = None
            try:
                permission = PostPermission(request.data['permission'])
            except KeyError as e:
                return Response({'error' : 'required field: \'permission\''},status=status.HTTP_400_BAD_REQUEST)
            except ValueError as e:
                return Response({'error' : 'invalid permission: \'' + str(request.data['permission']) + '\''},status=status.HTTP_400_BAD_REQUEST)
            grant = False
            try:
                if request.data['action'] == 'grant':
                    grant = True
                elif request.data['action'] != 'revoke':
                    return Response({'error' : 'invalid action - only \'grant\' or \'revoke\' a permission'}, status=status.HTTP_400_BAD_REQUEST)

            except KeyError:
                return Response({'error' : 'required field: \'permission\''},status=status.HTTP_400_BAD_REQUEST)
            users = []
            try:
                for u in request.data['users']:
                        
                    try:
                        user = None
                        if isinstance(u, str):
                            user = User.objects.get(username=u)
                        elif isinstance(u, int):
                            user = User.objects.get(pk=u)
                        else:
                            return Response({'error' : 'Users should be a string username or number pk'}, status=status.HTTP_404_BAD_REQUEST)
                    except User.DoesNotExist:
                        return Response({'error' : 'user does not exist: ' + u},status=status.HTTP_400_BAD_REQUEST)
                    
                    if grant:
                        #also allow users who can change posts to view posts
                        if(permission == PostPermission.CHANGE):
                            assign_perm(PostPermission.VIEW.permission(), user, post)
                        assign_perm(permission.permission(), user, post)
                        
                        users.append(u)
                    else: #revoke
                        if user == post.user:
                            return Response({'error' : 'You attempted to revoke permissions from the owner of this post (the user sending this request)'}, status=status.HTTP_400_BAD_REQUEST)
                        if remove_perm(permission.permission(), user, post)[0] == 1:
                            users.append(u)
                        
            except KeyError:
                return Response({'error' : 'required field: \'users\''},status=status.HTTP_400_BAD_REQUEST)
            if(len(users)):
                return Response({'message' : 'action successful for some users', 'users' : users})
            else:
                return Response({'message' : 'action successful for some users' if len(users) else 'no permissions granted or revoked ' + \
                    '(the users you listed might not have had permissions you tried to revoke, or you might\'ve listed no users'})
        else:
            return Response({'error' : 'you are not the owner of this post'}, status=status.HTTP_403_FORBIDDEN)
        
        


class PostFilter(filters.FilterSet):
    beginIndex = django_filters.NumberFilter(
        name='beginIndex', label='beginIndex', method='filterNumberPosts')


    class Meta:
        model = Post
        fields = ('draft', 'user', 'title', 'updated',
                  'likes', 'timestamp', 'comments')

    def filterNumberPosts(self, queryset, name, value):
        return queryset[value:value+10]
    


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostViewSet(viewsets.ModelViewSet):
    '''
    API endpoint for Post model
    '''
    permission_classes = (IsAuthenticated,)
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_class = PostFilter
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user_editing = self.request.query_params.get('user_edit', None)
        if(user_editing != None):
            view_set = get_objects_for_user(self.request.user, 'view_post', Post)

            edit_set = get_objects_for_user(User.objects.get(pk=user_editing), 'change_post', Post)

            self.queryset = view_set & edit_set
        else:
            self.queryset = get_objects_for_user(self.request.user, 'view_post', Post)
        return self.queryset
    
    def get_object(self):
        post = super(PostViewSet, self).get_object()
        if not self.request.user.has_perm('view_post', post):
            print('Auth failed! returning 401')
            raise PermissionDenied('You are not allowed to view that post.')
            #return Response({'error': 'You are not allowed to view that post.'}, status=status.HTTP_401_UNAUTHORIZED)

        return post

class CommentViewSet(viewsets.ModelViewSet):
    permission_classes = (AllowAny,)
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_fields = ('post', 'text', 'user', 'timestamp')

class StandardViewSet(viewsets.ModelViewSet):
    queryset = Standard.objects.all()
    serializer_class = StandardSerializer
    filter_fields= ('grade', 'name', 'subject') 

class AttachmentViewSet(viewsets.ModelViewSet):
    '''
    API endpoint for Attachment model
    '''
    permission_classes = (AllowAny,)
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
    ext = ''
    for i in reversed(range(0, len(filename))):
        if filename[i] == '.':
            break
        ext = filename[i] + ext

    print(ext)
    return ext


# these are allowed binary filetypes
whitelist = ['pdf', 'doc', 'ppt', 'docx', 'odt', 'xlsx',
             'xls', 'xlt', 'csv', 'ods', 'ots', 'fods', 'tex']


def check_production():
    return settings.IS_PRODUCTION


class FileUploadView(views.APIView):
    #SHOULD not be commented - at time of writing frontend has issues with login (fixed on another branch but requires merge)
    #permission_classes = (IsAuthenticated,)
    parser_classes = (FileUploadParser, JSONParser)

    if check_production():
        storage_client = google.cloud.storage.Client(
            'teach-share-200700')  # .from_service_account_json(os.environ['GOOGLE_APPLICATION_CREDENTIALS'])
        # 'AIzaSyCgvEvHSGGIuhU6sV5Qb85gSKvBx5ZRzKQ')
        bucket_name = 'teachshare-media'
        bucket = storage_client.get_bucket(bucket_name)
        print(bucket)
        print(check_production())

    def put(self, request, filename, format=None):
        post_id = request.query_params['post']
        file_obj = request.data['file']
        blob = None

        print('File upload...')
        if check_production():
            print('inside check production')
            blob = self.bucket.blob(filename)
            print('Chunk Size: {}'.format(blob.chunk_size))
            print('Chunk data: {}'.format(blob))
            try :
                result = blob.upload_from_file(file_obj)
            except google.cloud.exceptions.GoogleCloudError as err:
                print(err)
                raise err
            print(blob.public_url)

        print('file upload')
        from pprint import pprint
        print(request.data)
        print(request.query_params['post'])
        # this is where we need to actually know the post.
        p = Post.objects.get(pk=post_id)
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
            'url': blob.public_url if blob else 'http://127.0.0.1:8000' + a.file.url,
            'filename': a.file.name
        }, status=201)
