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
	url(r'^post/$', views.post_list, name='post_list' ),
]
