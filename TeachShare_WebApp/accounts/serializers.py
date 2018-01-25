from rest_framework import serializers
from .models import UserProfile
from django.contrib.auth.models import User, Group


class UserProfileSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.HyperlinkedRelatedField(many=False, read_only=True,
                                               view_name='user-detail')

    class Meta:
        model = UserProfile
        fields = ('user', 'url', 'schoolDistrict')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')