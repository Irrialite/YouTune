from django.conf.urls.defaults import *
from youtune.fileupload.views import FileCreateView, FileDeleteView

urlpatterns = patterns('',
    (r'^new/$', FileCreateView.as_view(), {}, 'upload-new'),
    (r'^delete/(?P<pk>\d+)$', FileDeleteView.as_view(), {}, 'upload-delete'),
)

