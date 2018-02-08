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


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for UserProfile model
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('user',)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for UserProfile model
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('username', 'email')


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    required_scopes = ['groups']
    serializer_class = GroupSerializer
