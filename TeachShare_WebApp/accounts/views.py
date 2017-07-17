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
from accounts.models import Post, UserProfile

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
	args = {'user': request.user}
	return render(request,'accounts/profile.html',args)

@login_required
def edit_profile(request):
	if request.method == 'POST':
		#Old stuff using django's default form
		#form = EditProfileForm(request.POST, instance=request.user)

		#if form.is_valid():
		#	form.save()
		#	return redirect('/account/profile')
		#new stuff:
		
		#this is a method to get the UserProfile object that corresponds to request.user
		#if there's a better way let me know
		#searches all UserProfile objects until we find the one with this User
		#user = request.user
		#userProfiles = UserProfile.objects.all()
		
		#for userProfile in userProfiles:
		#	if userProfile.user == user:
		#		thisUserProfile = userProfile
		#		break
		#thisUserProfile.checkboxStr = request.POST['K']
		return HttpResponseRedirect(reverse('account:view_profile'))
	else:
		form = EditProfileForm(instance=request.user)
		args = {'form': form}
		return render(request, 'accounts/edit_profile.html',args)

		
@login_required(login_url='/account/login')
def post_create(request):
	if request.method == 'POST':
		form = EditProfileForm(request.POST, instance=request.user)

		if form.is_valid():
			form.save()
			return redirect('/account/profile')
	else:
		form = EditProfileForm(instance=request.user)
		args = {'form': form}
		return render(request, 'accounts/post_create.html',args)


def post_detail(request, id= None):
	instance = get_object_or_404(Post, id=id)
	context = {
		"title": instance.title,
		"instance": instance,
	}
	return render(request,'accounts/post_detail.html',context)


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
			u = User.objects.get(usernmae= username)
		except:
			return render (request, 'accounts/forgotPasswordInValidUser.html', None)
		if(pwNew != pwNewC):
			return render (request, 'accounts/forgotPasswordPasswordDoNotMatch.html', None)
		u.set_password(pwNew)
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
		user = User.objects.create_user(username, email, pw)
		userLoggedIn = auth_login(request, authenticate(username=username, password=pw))
		return HttpResponseRedirect(reverse('account:dashboard'))

@login_required(login_url='/account/login')
def dashboard(request):
	return render(request, 'accounts/dashboard.html', {'posts' : Post.objects.all()})