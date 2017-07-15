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
	url(r'^password_change/$', views.password_change, name='password_change'),
	url(r'^forgotPassword/$', views.password_change_page, name='password_change_page')
]