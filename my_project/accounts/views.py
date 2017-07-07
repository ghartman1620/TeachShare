# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, HttpResponse

# Create your views here.
def home(request):
	name = 'teachshare'
	numbers = [1,2,3,4,5,6]
	args = {'myName': name, 'numbers': numbers }
	return render(request,'accounts/home.html',args)