from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import authenticate

from .models import Comment


class EditProfileForm(UserChangeForm):
     class Meta:
     	model = User
     	fields = ('email',
     		'first_name',
     		'last_name',
     		'password')


class CommentForm(forms.ModelForm):

    class Meta:
        model = Comment
        fields = ('text', 'user')
