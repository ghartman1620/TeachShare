from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.models import User, Group


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('user', 'url', 'schoolDistrict')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'url', 'username', 'email', 'first_name', 
                    'last_name', 'is_staff', 'is_active', 'date_joined')


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')
