from django.conf.urls import url
from . import views
from django.contrib.auth.views import login
urlpatterns = [

	url(r'^$',views.home),
	url(r'^login/$', views.login, name='login'),
	url(r'^signup/$', views.signup, name='signup'),
	url(r'^dashboard/$', views.dashboard, name='dashboard'),
]
