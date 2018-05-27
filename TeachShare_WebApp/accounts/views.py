# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.contrib.auth import login as auth_login
from django.shortcuts import render, HttpResponse, HttpResponseRedirect, redirect, get_object_or_404, render_to_response
from django.urls import reverse
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.decorators import login_required
from accounts.forms import EditProfileForm
from accounts.models import UserProfile, GradeTaught, SubjectTaught
from django.conf import settings
from django.utils.timezone import now as timezone_now
from django.db import IntegrityError
from rest_framework import status
from django.http import Http404
from rest_framework.exceptions import ParseError
from posts.models import Post

#import pdb; pdb.set_trace()

import os
import sys

from .serializers import UserProfileSerializer, UserSerializer, GroupSerializer
from rest_framework import viewsets, permissions, routers, serializers, authentication
from .models import UserProfile
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from django_filters import rest_framework as filters
from rest_framework.decorators import api_view
from rest_framework.test import APIClient
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated

from oauth2_provider.views.mixins import OAuthLibMixin
from oauth2_provider.oauth2_backends import OAuthLibCore
from oauth2_provider.settings import oauth2_settings
from guardian.shortcuts import get_users_with_perms

import json

class TokenVerification(APIView):
    def get(self, request, format=None):
        return Response({"token" : "is valid"})


client_id = '8CXoONZmQTKF4I1xiLY9vR7YR0tsdMVr03Jk29MG'
client_secret = 'kHwXPXAIttqTcEYCFdiIifIborJS9e0We8FyuyDJx3hDNNfF9zZFAuCoRwU5NnNrgO8lBbOhcC0KEZ9iTTBez6FQsQLXwJYxiCIqQrzbQdR7ubDCLBIv2qsU4hXthIvo'
class TokenView(OAuthLibMixin, APIView):
    server_class = oauth2_settings.OAUTH2_SERVER_CLASS
    validator_class = oauth2_settings.OAUTH2_VALIDATOR_CLASS
    oauthlib_backend_class = OAuthLibCore
    permission_classes = (AllowAny,)    
    def get(self, request, format=None):
        return Response({"foo" : "bar"})
    def post(self, request, format=None):
        
        request._request.POST = request._request.POST.copy()
        print(vars(request))
        request._request.POST['client_id'] = client_id
        request._request.POST['client_secret'] = client_secret
        for key, value in request.data.items():
            request._request.POST[key] = value
        
        url, headers, body, statuscode = self.create_token_response(request._request)
        from pprint import pprint
        print("statuscode")
        print(statuscode)
        if(statuscode != 200):
            print(body)
            return Response(json.loads(body), status=statuscode)
        print("body")
        print(body)
        print("headers")
        print(headers)
        print("url")
        print(url)
        print('requestpost items')
        for k,v in request._request.POST.items():
            print(k)
            print(v)
        #returns the body (contains access & refresh tokens) and also userID
        #it will be saved on the frontend for the purpose of knowing
        #info about the logged in user
        try:
            user = User.objects.get(username=request._request.POST['username'])
            u = UserSerializer(user, context={'request': request})
            print(u.data)
            print(vars(u))
        except User.DoesNotExist:
            print(request._request.POST['username'])
            return Response({
                'error' : 'that user does not exist'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response({
            'body': json.loads(body), 
            'user': u.data,
            'userId': user.pk,
            'username' : user.username,
        })

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for UserProfile model
    """
    permission_classes = (AllowAny,)
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('user',)
    


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for UserProfile model
    """
    permission_classes = (AllowAny,)
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('username', 'email')
    def get_queryset(self):
        post_pk = self.request.query_params.get('post', None)
        if post_pk != None:
            try:
                post = Post.objects.get(pk=post_pk)
            except Post.DoesNotExist:
                raise Http404('the post you specified in post query param does not exist')
            except ValueError:
                raise ParseError('invalid type for param post')
            user_perms = get_users_with_perms(post, attach_perms=True, with_superusers=False)
            self.queryset = User.objects.none()
            for u,p in user_perms.items():
                if('change_post' in p):
                    self.queryset = self.queryset | User.objects.filter(pk=u.pk)
            
            
        return self.queryset

    def create(self, request, format=None):
        print(request._data['username'])
        print(format)
        try:
            User.objects.create_user(username = request._data['username'],
                email=request._data['email'],
                password=request._data['password'])
        except IntegrityError:
            return Response({'error': 'Username already taken.'},
                status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': "User created successfully."})


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    permission_classes = (AllowAny,)
    queryset = Group.objects.all()
    required_scopes = ['groups']
    serializer_class = GroupSerializer
