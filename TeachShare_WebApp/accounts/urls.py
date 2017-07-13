from django.conf.urls import url
from . import views
from django.contrib.auth.views import login

app_name = 'account'
urlpatterns = [
	
	url(r'^$',views.home, name='home'),
	url(r'^login/$', views.login, name='login' ),
	url(r'^signup/$', views.signup, name='signup'),
	url(r'^register/$', views.register, name='register'),
	url(r'^profile/$', views.profile, name='profile'),
]
