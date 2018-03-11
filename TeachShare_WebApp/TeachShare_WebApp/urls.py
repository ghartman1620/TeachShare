"""my_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.views import password_reset, password_reset_done, password_reset_confirm, password_reset_complete

from rest_framework import routers
from accounts.views import UserProfileViewSet, UserViewSet, GroupViewSet
from posts.views import PostViewSet, CommentViewSet, AttachmentViewSet, SearchPostsView

from posts.views import *
from posts.views import FileUploadView

router = routers.DefaultRouter()
router.register(r'userprofiles', UserProfileViewSet)
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'attachments', AttachmentViewSet)

urlpatterns = [

    url(r'^test/', SimpleMethod),
    url(r'^auth/', include('rest_framework_social_oauth2.urls')),
    url(r'^api/upload/(?P<filename>[^/]+)$', FileUploadView.as_view()),
    url(r'^api/search/', SearchPostsView.as_view()),
    url(r'^admin/', admin.site.urls),
    # this and urls down are concerned with reseting pssword
    # url(r'^reset-password/$', password_reset, name="reset_password"),
    # url(r'^reset-password/done/$', password_reset_done, name="password_reset_done"),
    # url(r'^reset-password/confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$',
    #     password_reset_confirm, name='password_reset_confirm'),
    # url(r'^reset-password/complete/$', password_reset_complete,
    #     name='password_reset_complete'),

    url(r'^api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
