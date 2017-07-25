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

import os, sys


'''
Searches the given posts and returns a subset of these posts.
Posts are included in the returned set if the search string
is a substring of the post's title or one of its tags.
'''
def search(posts, searchString):
	results = []
	for post in posts.order_by('-likes'):
		if post.title.find(searchString)!= -1:
			results.append(post)
		else: 
			for tag in post.tags.all():
				if tag.tag.find(searchString)!= -1:
					results.append(post)
	return results
from .forms import CommentForm

from .models import Attachment, Comment

def home(request):

	return render(request,'accounts/home.html',None)


def login(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('account:dashboard'))
	if request.method == "POST":
		username = request.POST['username']
		password = request.POST['password']
		user = authenticate(username=username, password=password)
		if username is "":
			return render(request, 'accounts/loginEmptyFeilds.html',None)
		if password is "":
			return render(request, 'accounts/loginEmptyFeilds.html',None)
		
		if user is not None:
			if user.is_active:
				auth_login(request, user)
				return HttpResponseRedirect(reverse('account:dashboard'))
		else:
			return render(request, 'accounts/loginIncorrect.html',None)
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
	return render(request,'accounts/profile.html',args)


def add_comment_to_post(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if request.method == "POST":
            comment = Comment(text=request.POST['description'], post=post, user=request.user.username)
            comment.save()
            return redirect('account:post_detail', id=pk)
    else:
        form = CommentForm()


@login_required(login_url='/account/login')
def account_settings(request):
	if request.method == 'POST':
		u = User.objects.get(username= request.user.username)
		oldPassword = grade=request.POST['oldPassword']
		newPassword = grade=request.POST['newPassword']
		confirmPassword = grade=request.POST['confirmPassword']
		if oldPassword== '' and newPassword == '' and confirmPassword == '':
			typeErr=1
			return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
		elif (authenticate(username=request.user.username, password=oldPassword)==None):
			typeErr=2
			return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
		elif (newPassword!=confirmPassword):
			typeErr=3
			return render(request, 'accounts/edit_profile_error.html', {'typeErr': typeErr})
		else:
			u.set_password(newPassword)
			u.save()
			return HttpResponseRedirect(reverse("account:dashboard"))
	return render(request, 'accounts/edit_profile.html')

@login_required(login_url='/account/login')
def edit_profile(request):
	if request.method == 'POST':
		user = request.user
		userProfile = user.userprofile
		if isValidRequestField(request, 'firstName'):
			user.first_name = request.POST['firstName']
		if isValidRequestField(request, 'lastName'):
			user.last_name = request.POST['lastName']
		for subject in request.user.userprofile.subjects.all():
			subject.delete()	
		if isValidRequestField(request, 'subject'):


			subjectlist = request.POST['subject'].split(",")
			for s in subjectlist:
				subject = SubjectTaught(subject=s, userProfile=userProfile)
				subject.save()	
		if isValidRequestField(request, 'district'):
			userProfile.schoolDistrict = request.POST['district']
			
		
		for grade in userProfile.gradetaught_set.all():
			grade.delete()
		
		for gradeTaught in request.POST:
			if "grade" in gradeTaught:
				gradeStr = GradeTaught(grade=request.POST[gradeTaught], userProfile=userProfile)
				gradeStr.save()
		
		
		user.save()
		userProfile.save()
		return HttpResponseRedirect(reverse('account:view_profile'))
	else:
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
			'subjectsTaught' :subjects
		}
		return render(request, 'accounts/edit_profile.html',args)

def isValidRequestField(request, str):
	return str in request.POST and request.POST[str] != "";

def add_tag(request, post):
	if request.method == 'POST':
		tagString =request.POST['tag']
		tagList = tagString.split(',')
		for s in tagList:
			if s != "":
				tag = Tag(tag=s, post=post)
				tag.save()
		

@login_required(login_url='/account/login')
def post_create(request):
	if request.method == 'POST':
		title=request.POST['title']
		content=request.POST['description']
		if title == '' or content == '':
			return render(request, 'accounts/emptyPost.html',None)
		post = Post(title=request.POST['title'], content=request.POST['description'],
						user=request.user.username)
		files =request.FILES.getlist('files')
		post.save()
		#Handle multi-file upload
		for a_file in files:
		
			instance = Attachment(
				file=a_file, post=post)
			
			instance.save()

		add_tag(request,post)

		return HttpResponseRedirect(reverse('account:dashboard'))
	else:

		return render(request, 'accounts/post_create.html',None)


imgFormats = ["jpg", "jpeg", "gif", "png", "apng", "svg", "bmp", "ico"]
def post_detail(request, id= None):
	instance = get_object_or_404(Post, id=id)
	files = []
	images = []
	for attachment in instance.attachment_set.all():
		file = attachment.file.path
		if file.find("/") != -1:
			name = file[file.rfind("/")+1:]
			file = file[file.find("/media/"):]
		else:
			name = file[file.rfind("\\")+1:]
			file = file[file.find("\media\\"):]

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
	return render(request,'accounts/post_detail.html',context)

	
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
				 'searchstring' : request.POST['search']})
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
	
	
	#Handle liking
	if not likesPost(request.user.userprofile, instance):
		instance.likes+=1
		instance.save()

		request.user.userprofile.favorites.add(instance)
	#Handle unliking
	else:	
		instance.likes-=1
		instance.save()
		request.user.userprofile.favorites.remove(instance)
	#Based on the redirect suppression in the script in dashboard.html
	#this POST request should not be allowed to refresh the dashboard.
	#So this line should not matter, but if it does, dashboard is the most
	#natural place to redirect to
	
	return HttpResponseRedirect(reverse('account:dashboard'))
	


def password_change(request):
	try:
		username = request.POST['username']
		pwNew = request.POST['pwNew']
		pwNewC = request.POST['pwNewC']
	except(KeyError):
		return HttpResponse("Something really went wrong. Please contact the admin.")
	else:
		if username is "":
			return render (request, 'accounts/forgotPasswordEmptyFeilds.html', None)
		if pwNew is "":
			return render (request, 'accounts/forgotPasswordEmptyFeilds.html', None)
		if pwNewC is "":
			return render (request, 'accounts/forgotPasswordEmptyFeilds.html', None)
		try:
			u = User.objects.get(username= username)
		except:
			return render (request, 'accounts/forgotPasswordInValidUser.html', None)
		if(pwNew != pwNewC):
			return render (request, 'accounts/forgotPasswordPasswordDoNotMatch.html', None)
		u.set_password(pwNew)
		u.save()
		return HttpResponseRedirect(reverse('account:login'))

def password_change_page(request):
	return render (request, 'accounts/forgotPassword.html', None)


def signup(request):
	if request.user.is_authenticated():
		return HttpResponseRedirect(reverse('account:dashboard'))
	return render(request, 'accounts/signup.html',None)

def register(request):
	try:
		pw = request.POST['pw']
		pwConfirm = request.POST['pwConfirm']
		username = request.POST['username']
		email = request.POST['email']
		
	except(KeyError):
	   return HttpResponse("Something really went wrong. Please contact the admin.")
	else:
		if pw is "":
			return render (request, 'accounts/signupCPassword.html', None)
		if pwConfirm is "":
			return render (request, 'accounts/signupCPassword.html', None)
		if username is "":
			return render (request, 'accounts/signupCPassword.html', None)
		if email is "":
			return render (request, 'accounts/signupCPassword.html', None)


		if(pw != pwConfirm):
			return render(request, 'accounts/signupPasswordMatch.html', None)
		user_auth = User.objects.create_user(username, email, pw)
		userLoggedIn = auth_login(request, authenticate(username=username, password=pw))
		return HttpResponseRedirect(reverse('account:dashboard'))

@login_required(login_url='/account/login')
def dashboard(request):
	if request.method == 'POST':

		return render(request, 'accounts/dashboard.html',
					{'posts' : search(Post.objects.all(), request.POST['search']), 
					 'likedPosts' : request.user.userprofile.favorites.all(),
					 'searchstring' : request.POST['search']})
	else:
		return render(request, 'accounts/dashboard.html',
						{'posts' : Post.objects.order_by("-likes"),
						 'likedPosts' : request.user.userprofile.favorites.all()})



