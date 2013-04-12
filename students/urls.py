from django.conf.urls import patterns, include, url

from tastypie.api import Api
from students.resources import TeamResource, StudentResource
from students import views

v1_api = Api(api_name='v1')
v1_api.register(TeamResource())
v1_api.register(StudentResource())

urlpatterns = patterns('',
    url(r'^server/$', views.server, name='server'),
    url(r'^api/', include(v1_api.urls)),
    url(r'^$', views.index, name='index'),
)
