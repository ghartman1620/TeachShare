# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from accounts.models import UserProfile, Post
# Register your models here.

class PostModelAdmin(admin.ModelAdmin):
	list_display = ["title","updated","timestamp"]
	list_display_links = ["updated"]
	list_filter = ["updated","timestamp"]
	
	search_fields = ["title","content"]
	class Meta:
		model = Post



admin.site.register(UserProfile)

admin.site.register(Post, PostModelAdmin)
