# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.contrib.auth import login as auth_login
from django.shortcuts import render, HttpResponse, HttpResponseRedirect, redirect, get_object_or_404
from django.urls import reverse
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserChangeForm 
from django.contrib.auth.decorators import login_required
from accounts.forms import EditProfileForm
from accounts.models import Tag, Post, UserProfile, GradeTaught, LikedPost

# Create your views here.
def home(request):
	name = 'TeachShare'
	numbers = [1,2,3,4,5,6]
	args = {'myName': name, 'numbers': numbers }
	return render(request,'accounts/home.html',args)


def login(request):

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

@login_required(login_url='/account/login')
def edit_profile(request):
	if request.method == 'POST':

		#this is a method to get the UserProfile object that corresponds to request.user
		#if there's a better way let me know
		#searches all UserProfile objects until we find the one with this User
		user = request.user
		userProfile = user.userprofile
		
		if isValidRequestField(request, 'firstName'):
			user.first_name = request.POST['firstName']
		if isValidRequestField(request, 'lastName'):
			user.last_name = request.POST['lastName']
		if isValidRequestField(request, 'subject'):
			userProfile.subjectTaught = request.POST['subject']
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
		args = {
			'user': request.user, 
			'userProfile': request.user.userprofile,
			'grades': grades,
		}
		return render(request, 'accounts/edit_profile.html',args)

def isValidRequestField(request, str):
	return str in request.POST and request.POST[str] != "";
		
@login_required(login_url='/account/login')
def post_create(request):
	if request.method == 'POST':
		post = Post(title=request.POST['title'], content=request.POST['description'],
						user=request.user.username)
		post.save()
		add_tag(request,post)
		return HttpResponseRedirect(reverse('account:dashboard'))
	else:

		return render(request, 'accounts/post_create.html',None)


def post_detail(request, id= None):
	instance = get_object_or_404(Post, id=id)
	context = {
		"title": instance.title,
		"instance": instance,
		"tags": instance.tag_set.all()
	}
	return render(request,'accounts/post_detail.html',context)

	
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
	
	
	post = getLikedPost(request.user, instance)
	#Handle liking
	if post == None:
		instance.likes+=1
		instance.save()
		likedPost = LikedPost(user=request.user, id=instance.id)
		likedPost.save()
	#Handle unliking
	else:
		instance.likes-=1
		instance.save()
		post.delete()
	#Based on the redirect suppression in the script in dashboard.html
	#this POST request should not be allowed to refresh the dashboard.
	#So this line should not matter, but if it does, dashboard is the most
	#natural place to redirect to
	
	#(for example, during debugging when the javascript had a syntax error
	#the redirect suppression would fail so this return would function). 
	#So this should probably stay incase of errors.
	return HttpResponseRedirect(reverse('account:dashboard'))
'''	
Returns the LikedPost object corresponding to a user's like
of a instance post or None if the user has not liked that
particular post. 
'''
def getLikedPost(user, instance):
	for post in user.likedpost_set.all():
		if(post.id == instance.id):
			return post;
	return None;
	
def add_tag(request, post):
	if request.method == 'POST':
		tagString =request.POST['tag']
		tagList = tagString.split(',')
		for s in tagList:
			tag = Tag(tag=s, post=post)
			tag.save()

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
			if '@' not in email:
				return render (request, 'accounts/Email2.html', None)
			if '.com' not in email:
				return render (request, 'accounts/Email2.html', None)

		if(pw != pwConfirm):
			return render(request, 'accounts/signupPasswordMatch.html', None)
		user_auth = User.objects.create_user(username, email, pw)
		userLoggedIn = auth_login(request, authenticate(username=username, password=pw))
		return HttpResponseRedirect(reverse('account:dashboard'))

@login_required(login_url='/account/login')
def dashboard(request):
	likedPosts = []
	for post in request.user.likedpost_set.all():
		likedPosts.append(post.id)
	if request.method == 'POST':
		searchString = request.POST['search']
		results = []
		for post in Post.objects.all().order_by('-timestamp'):
			if post.title.find(searchString)!= -1:
				results.append(post)
			else: 
				for tag in post.tag_set.all():
					if tag.tag.find(searchString)!= -1:
						results.append(post)
		return render(request, 'accounts/dashboard.html',
					{'posts' : results, 
					 'likedPosts' : likedPosts})
	else:
		return render(request, 'accounts/dashboard.html',
						{'posts' : Post.objects.all().order_by('-timestamp'),
						 'likedPosts' : likedPosts})
					