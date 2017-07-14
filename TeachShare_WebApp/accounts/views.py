# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import login as auth_login
from django.shortcuts import render, HttpResponse, HttpResponseRedirect, redirect
from django.urls import reverse
from django.template import loader
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserChangeForm 
from accounts.forms import EditProfileForm


# Create your views here.
def home(request):
	name = 'TeachShare'
	numbers = [1,2,3,4,5,6]
	args = {'myName': name, 'numbers': numbers }
	return render(request,'accounts/home.html',args)
	
#def login(request):
#	return render(request, 'accounts/login.html',None)
def login(request):


    next = request.GET.get('next', '/account/profile')
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                auth_login(request, user)
                return HttpResponseRedirect(next)
            else:
               return HttpResponse("You're account is disabled.")


    return render(request, "accounts/login.html", {'redirect_to': next})


def logout(request):
    logout(request)
    return HttpResponseRedirect('account:home')


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





def signup(request):
	return render(request, 'accounts/signup.html',None)

def register(request):
	try:
		pw = request.POST['pw']
		pwConfirm = request.POST['pwConfirm']
		username = request.POST['username']
		email = request.POST['email']
		
	except(KeyError):
	   return HttpResponse("One or more fields is empty.")
	else:
		if(pw != pwConfirm):
			return HttpResponse("Password and confirm password do not match.")
		user = User.objects.create_user(username, email, pw)
		return HttpResponseRedirect(reverse('account:home'))
		