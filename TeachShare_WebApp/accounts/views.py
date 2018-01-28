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
from accounts.models import Tag, Post, UserProfile, GradeTaught, Attachment, SubjectTaught
from django.conf import settings
from django.utils.timezone import now as timezone_now

#import pdb; pdb.set_trace()

import os
import sys

from .serializers import UserProfileSerializer, UserSerializer, GroupSerializer
from rest_framework import viewsets
from .models import UserProfile
from rest_framework import permissions
from django.contrib.auth.models import User, Group
from django_filters import rest_framework as filters


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
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('username', 'email')

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


'''
Searches the given posts and returns a subset of these posts.
Posts are included in the returned set if the search string
is a substring of the post's title or one of its tags.
'''


def search(posts, searchString):
    results = []
    for post in posts.order_by('-timestamp'):
        if post.title.find(searchString) != -1:
            results.append(post)
        else:
            for tag in post.tags.all():
                if tag.tag.find(searchString) != -1:
                    results.append(post)
    return results


from .forms import CommentForm

from .models import Attachment, Comment


def home(request):

    return render(request, 'accounts/home.html', None)


def login(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('account:dashboard'))
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if username is "" or password is "":
            typeErr = 2
            return render(request, 'accounts/loginIncorrect.html', {'typeErr': typeErr})
        if user is not None:
            if user.is_active:
                auth_login(request, user)
                return HttpResponseRedirect(reverse('account:dashboard'))
        else:
            typeErr = 1
            return render(request, 'accounts/loginIncorrect.html', {'typeErr': typeErr})
    return render(request, "accounts/login.html", None)


def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse('account:home'))


@login_required(login_url='/account/login')
def view_profile(request):
    args = {
        'user': request.user,
        'userProfile': request.user.userprofile,
        'grades': request.user.userprofile.gradetaught_set.all(),
    }
    return render(request, 'accounts/profile.html', args)


'''
asks user for comment in textfeild. The input is taken in post detail,
passed through this view, to be saved to the Comments model and rendered
on the post detail page
'''


def add_comment_to_post(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == "POST":
        comment = Comment(
            text=request.POST['description'], post=post, user=request.user.username)
        comment.save()
        return redirect('account:post_detail', id=pk)
    else:
        form = CommentForm()


'''
Takes in three inputs from the Edit_profile page. One of the in puts is the old
password which it  verfies here is true. If not an error will pop up. The other two 
text boxes deal with setting a new password and confirming it. If they are not the same
error will pop up. However if old password is true and the new passwords match then 
this view sets the accounts password to the new password
'''


@login_required(login_url='/account/login')
def account_settings(request):
    if request.method == 'POST':
        u = User.objects.get(username=request.user.username)
        oldPassword = grade = request.POST['oldPassword']
        newPassword = grade = request.POST['newPassword']
        confirmPassword = grade = request.POST['confirmPassword']
        if oldPassword == '' and newPassword == '' and confirmPassword == '':
            typeErr = 1
            return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
        elif (authenticate(username=request.user.username, password=oldPassword) == None):
            typeErr = 2
            return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
        elif (newPassword != confirmPassword):
            typeErr = 3
            return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
        else:
            u.set_password(newPassword)
            u.save()
            return HttpResponseRedirect(reverse("account:dashboard"))
    return render(request, 'accounts/edit_profile.html')


'''
POST request for edit profile writing and
renders the profile page when its loaded.
Creates many GradeTaught and SubjectTaught objects
and assigns other fields in UserProfile.
'''


@login_required(login_url='/account/login')
def edit_profile(request):
    if request.method == 'POST':
        user = request.user
        userProfile = user.userprofile
        if isValidRequestField(request, 'firstName'):
            user.first_name = request.POST['firstName']
        if isValidRequestField(request, 'lastName'):
            user.last_name = request.POST['lastName']
        # So that if a user clears subjects from the text thhey will
        # no longer be saved to their profile.
        for subject in request.user.userprofile.subjects.all():
            subject.delete()
        if isValidRequestField(request, 'subject'):

            subjectlist = request.POST['subject'].split(",")
            for s in subjectlist:
                subject = SubjectTaught(subject=s, userProfile=userProfile)
                subject.save()
        if isValidRequestField(request, 'district'):
            userProfile.schoolDistrict = request.POST['district']

        # as with subjects taught
        for grade in userProfile.gradetaught_set.all():
            grade.delete()

        # Get every POST request that has "grade" as part of its ID
        # Since the 13 grade checkboxes require separate IDs
        for gradeTaught in request.POST:
            if "grade" in gradeTaught:
                gradeStr = GradeTaught(
                    grade=request.POST[gradeTaught], userProfile=userProfile)
                gradeStr.save()

        user.save()
        userProfile.save()
        return HttpResponseRedirect(reverse('account:view_profile'))
    else:
        # This stuff passes strings related to the user's profile
        # To autopopulate the fields on edit profile.
        grades = []
        for grade in request.user.userprofile.gradetaught_set.all():
            grades.append(grade.grade)
        subjects = ""
        for subject in request.user.userprofile.subjects.all():
            subjects += subject.subject
            subjects += ","
        if subjects[-1:] == ",":
            subjects = subjects[:-1]
        args = {
            'user': request.user,
            'userProfile': request.user.userprofile,
            'grades': grades,
            'subjectsTaught': subjects
        }
        return render(request, 'accounts/edit_profile.html', args)


def isValidRequestField(request, str):
    return str in request.POST and request.POST[str] != ""


def add_tag(request, post):
    if request.method == 'POST':
        tagString = request.POST['tag']
        tagList = tagString.split(',')
        for s in tagList:
            if s != "":
                tag = Tag(tag=s, post=post)
                tag.save()


@login_required(login_url='/account/login')
def post_create(request):
    if request.method == 'POST':
        title = request.POST['title']
        content = request.POST['description']
        if title == '' or content == '':
            return render(request, 'accounts/emptyPost.html', None)
        post = Post(title=request.POST['title'], content=request.POST['description'],
                    user=request.user.username)
        files = request.FILES.getlist('files')
        post.save()
        # Handle multi-file upload
        for a_file in files:

            instance = Attachment(
                file=a_file, post=post)

            instance.save()

        add_tag(request, post)

        return HttpResponseRedirect(reverse('account:dashboard'))
    else:

        return render(request, 'accounts/post_create.html', None)


imgFormats = ["jpg", "jpeg", "gif", "png", "apng", "svg", "bmp", "ico"]


def post_detail(request, id=None):
    instance = get_object_or_404(Post, id=id)
    files = []
    images = []
    for attachment in instance.attachment_set.all():
        file = attachment.file.path
        if file.find("/") != -1:
            name = file[file.rfind("/") + 1:]
            file = file[file.find("/media/"):]
        else:
            name = file[file.rfind("\\") + 1:]
            file = file[file.find("\media\\"):]

        if file[-3:] in imgFormats or file[-4:] in imgFormats:
            images.append((file, name))
        else:
            files.append((file, name))

    context = {
        "title": instance.title,
        "instance": instance,
        "tags": instance.tags.all(),
        "files": files,
        "images": images,
    }
    return render(request, 'accounts/post_detail.html', context)


'''
Renders the favorites page. 
The loop is gathering up the posts that a user has liked based on their post id,
which is their index in the all posts list.
'''


@login_required(login_url='/account/login')
def favorites(request):
    if request.method == 'POST':
        return render(request, 'accounts/favorites.html',
                      {'posts': search(request.user.userprofile.favorites,
                                       request.POST['search']),
                       'searchstring': request.POST['search']})
    return render(request, 'accounts/favorites.html',
                  {'posts': request.user.userprofile.favorites.order_by('-likes')})


def likesPost(userProfile, post):
    for fav in userProfile.favorites.all():
        if(fav == post):
            return True
    return False


'''
This POST request handles the user clicking the "like" or "dislike"
button on the dashboard. It does both by checking whether the 
user has already liked the post - if they have, then decrement
that posts' likes and remove that post from the user's like post list,
and do the opposite for a post that the user has not yet liked.
'''


@login_required(login_url='/account/login')
def like(request, id):
    instance = get_object_or_404(Post, id=id)

    # Handle liking
    if not likesPost(request.user.userprofile, instance):
        instance.likes += 1
        instance.save()

        request.user.userprofile.favorites.add(instance)
    # Handle unliking
    else:
        instance.likes -= 1
        instance.save()
        request.user.userprofile.favorites.remove(instance)
    # Based on the redirect suppression in the script in dashboard.html
    # this POST request should not be allowed to refresh the dashboard.
    # So this line should not matter, but if it does, dashboard is the most
    # natural place to redirect to
    return HttpResponseRedirect(reverse('account:dashboard'))


def signup(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('account:dashboard'))
    return render(request, 'accounts/signup.html', None)


def register(request):
    try:
        pw = request.POST['pw']
        pwConfirm = request.POST['pwConfirm']
        username = request.POST['username']
        email = request.POST['email']

    except(KeyError):
        return HttpResponse("Something really went wrong. Please contact the admin.")
    else:
        if pw is "" or pwConfirm is "" or username is "" or email is "":
            typeErr = 1
            return render(request, 'accounts/signupCPassword.html', {'typeErr': typeErr})

        if(pw != pwConfirm):
            typeErr = 2
            return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
        user_auth = User.objects.create_user(username, email, pw)
        userLoggedIn = auth_login(
            request, authenticate(username=username, password=pw))
        return HttpResponseRedirect(reverse('account:dashboard'))


@login_required(login_url='/account/login')
def dashboard(request):
    # Dashboard POST requests are a search. Searching done in the search function

    if request.method == 'POST':

        return render(request, 'accounts/dashboard.html',
                      {'posts': search(Post.objects.all(), request.POST['search']),
                       'likedPosts': request.user.userprofile.favorites.all(),
                       'searchstring': request.POST['search']})
    else:
        return render(request, 'accounts/dashboard.html',
                      {'posts': Post.objects.order_by("-timestamp"),
                       'likedPosts': request.user.userprofile.favorites.all()})
