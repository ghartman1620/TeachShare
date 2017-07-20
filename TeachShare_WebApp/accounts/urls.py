from django.conf.urls import url
from . import views
from django.contrib.auth.views import login

app_name = 'account'
urlpatterns = [
	
	url(r'^$',views.home, name='home'),
	url(r'^login/$', views.login, name='login' ),
	url(r'^signup/$', views.signup, name='signup'),
	url(r'^logout/$', views.logout,name='logout'),
	url(r'^register/$', views.register, name='register'),
	url(r'^profile/$', views.view_profile, name='view_profile'),
	url(r'^profile/edit/$', views.edit_profile, name='edit_profile'),
	url(r'^dashboard/$', views.dashboard, name='dashboard'),
	url(r'^detail/(?P<id>\d+)/$', views.post_detail, name='post_detail' ),
	url(r'^password_change/$', views.password_change, name='password_change'),
	url(r'^forgotPassword/$', views.password_change_page, name='password_change_page'),
	url(r'^create/$', views.post_create, name='post_create'),
	url(r'^like/(?P<id>\d+)/$', views.like, name='like'),
]
