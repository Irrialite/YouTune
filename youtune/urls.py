from django.conf.urls import patterns, include, url
from django.contrib import admin

<<<<<<< HEAD
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()
=======
from youtune.account import views as account_views
from youtune.frontend import views as frontend_views
>>>>>>> remotes/origin/master

admin.autodiscover()

urlpatterns = patterns('',
    url('^$', frontend_views.HomeView.as_view(), name='home'),
    
    url(r'^search', frontend_views.SearchView.as_view(), name='search'),
    
    url(r'^admin/doc/', include('django.contrib.admindocs.urls'), name='admin_doc'),
    url(r'^admin/', include(admin.site.urls), name='admin'),
    url(r'^i18n/', include('django.conf.urls.i18n')),

<<<<<<< HEAD
    # Uncomment the next line to enable the admin:
     url(r'^admin/', include(admin.site.urls)),
=======
    # Registration, login, logout
    url(r'^register/$', account_views.RegistrationView.as_view(), name='registration'),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'template_name': 'logout.html'}, name='logout'),
    # Facebook
    url(r'^facebook/login/$', account_views.FacebookLoginView.as_view(), name='facebook_login'),
    url(r'^facebook/callback/$', account_views.FacebookCallbackView.as_view(), name='facebook_callback'),
>>>>>>> remotes/origin/master
)
