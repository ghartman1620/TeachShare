from django.conf.urls import url
from . import views
from django.contrib.auth.views import login, password_reset, password_reset_done

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
	url(r'^create/$', views.post_create, name='post_create'),
	url(r'^like/(?P<id>\d+)/$', views.like, name='like'),
	url(r'^favorites/$', views.favorites, name='favorites'),
	url(r'^post/(?P<pk>\d+)/comment/$', views.add_comment_to_post, name='add_comment_to_post'),
	url(r'^profile/accountSettings/$', views.account_settings, name='account_settings'),
]
