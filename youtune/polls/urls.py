__author__ = 'SnowMan'

from django.conf.urls import patterns, url

from youtune.polls import views

urlpatterns = patterns('',
                       url(r'^$', views.index, name='index')
                       )
