from django.conf.urls import patterns, include, url
from django.conf.urls.defaults import handler404, handler500
from django.contrib import admin

from youtune import settings
from youtune.account import views as account_views, models as account_models
from youtune.frontend import views as frontend_views
from youtune.api import resources, views

from tastypie.api import Api

v1_api = Api(api_name='v1')
v1_api.register(resources.UserResource())

admin.autodiscover()

handler404 = frontend_views.Error404View.as_view( )
handler500 = frontend_views.Error500View.as_view( )

urlpatterns = patterns('',
    # Switch to API-based JS views
    url(r'^$', views.index, name='index'),
    
    # API
    url(r'^api/', include(v1_api.urls)),
    
    url('^server/', frontend_views.HomeView.as_view(), name='home'),
    
    url(r'^search', frontend_views.SearchView.as_view(), name='search'),
    
    url(r'^admin/doc/', include('django.contrib.admindocs.urls'), name='admin_doc'),
    url(r'^admin/', include(admin.site.urls), name='admin'),
    url(r'^i18n/', include('django.conf.urls.i18n')),

    # Registration, login, logout
    url(r'^register/$', account_views.RegistrationView.as_view(), name='registration'),
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'template_name': 'logout.html'}, name='logout'),

    # Profile, account
    url(r'^user/(?P<username>' + account_models.USERNAME_REGEX + ')/$', frontend_views.UserView.as_view(), name='profile'),
    url(r'^account/$', account_views.AccountChangeView.as_view(), name='account'),
    url(r'^account/password/change/$', account_views.PasswordChangeView.as_view(), name='password_change'),
    url(r'^account/confirmation/$', account_views.EmailConfirmationSendToken.as_view(), name='email_confirmation_send_token'),
    url(r'^account/confirmation/token/(?:(?P<confirmation_token>\w+)/)?$', account_views.EmailConfirmationProcessToken.as_view(), name='email_confirmaton_process_token'),

    # Facebook
    url(r'^facebook/login/$', account_views.FacebookLoginView.as_view(), name='facebook_login'),
    url(r'^facebook/callback/$', account_views.FacebookCallbackView.as_view(), name='facebook_callback'),
    
)

if settings.DEBUG:
	urlpatterns += patterns('',
		url( r'^500/$', handler500, name='500' ),
		url( r'^404/$', handler404, name='404' ),
	)
