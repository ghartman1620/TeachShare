# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.template import loader
from django.contrib.auth.models import User

# Create your views here.
def home(request):
	name = 'TeachShare'
	numbers = [1,2,3,4,5,6]
	args = {'myName': name, 'numbers': numbers }
	return render(request,'accounts/home.html',args)
	
def login(request):
	return render(request, 'accounts/login.html',None)

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
		