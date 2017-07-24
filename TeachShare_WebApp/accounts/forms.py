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
        fields = ('text',)


class accountSettingsPassword(forms.Form):

    oldPassword = forms.CharField(max_length=255, required=True)
    newPassword = forms.CharField(widget=forms.PasswordInput, required=True)
    confirmPassword = forms.CharField(widget=forms.PasswordInput, required=True)

    def __init__(self, *args, **kwargs):
         self.user = kwargs.pop('user',None)
         super(accountSettingsPassword, self).__init__(*args, **kwargs)

    def clean(self):
    	oldPassword = self.cleaned_data.get('oldPassword')
    	newPassword = self.cleaned_data.get('newPassword')
    	confirmPassword = self.cleaned_data.get('confirmPassword')
        canConfirm = authenticate(username=self.user, password=oldPassword)
        if not canConfirm or not canConfirm.is_active:
            raise forms.ValidationError("Sorry, your Old Password is invalid. Please try again.")
        if newPassword != confirmPassword:
        	raise forms.ValidationError("Sorry, your new passwords do not match Please try again.")
        return self.cleaned_data

    