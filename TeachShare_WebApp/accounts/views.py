# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, HttpResponse
from django.template import loader

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

def dashboard(request):
	return render(request, 'accounts/dashboard.html',None)
