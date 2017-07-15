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
from accounts.models import Post


# Create your views here.
def home(request):
	name = 'TeachShare'
	numbers = [1,2,3,4,5,6]
	args = {'myName': name, 'numbers': numbers }
	return render(request,'accounts/home.html',args)


def login(request):

	next = request.GET.get('next', 'account:view_profile')
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
				return HttpResponseRedirect(next)
		else:
			return render(request, 'accounts/loginIncorrect.html',None)
	return render(request, "account:view_profile", None)


def logout(request):
	auth_logout(request)
	return HttpResponseRedirect(reverse('account:home'))


def view_profile(request):
	args = {'user': request.user}
	return render(request,'accounts/profile.html',args)

def edit_profile(request):
	if request.method == 'POST':
		form = EditProfileForm(request.POST, instance=request.user)

		if form.is_valid():
			form.save()
			return redirect('/account/profile')
	else:
		form = EditProfileForm(instance=request.user)
		args = {'form': form}
		return render(request, 'accounts/edit_profile.html',args)

#def post_list(request):
#	if request.user.is_authenticated():
#		context = {
	#	'title':"my user list"
	#	}
	#else:
	#	context = {
	#	'title':"list"
	#	}
#	queryset = Post.objects.all().order_by("-timestamp")
#	context = {
#		'object_list': queryset,
#		'title': "list"
#		}

#	return render(request,'accounts/post_list.html',context)

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
			return HttpResponse(reverse("accounts/signupPasswordMatch.html"))
		try:
			user = User.objects.create_user(username, email, pw)
		except:
			return HttpResponse("Something really went wrong. Please contact the admin.")
		else:
			return HttpResponseRedirect(reverse('account:home'))

@login_required
def dashboard(request):
	return render(request, 'accounts/dashboard.html',{'posts':Post.objects.all()})