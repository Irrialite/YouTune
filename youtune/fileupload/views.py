import base64

from django.views.generic import CreateView, DeleteView
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import simplejson
from django.core.urlresolvers import reverse
from django.conf import settings

from youtune.fileupload.forms import FileForm
from youtune.fileupload.models import File

prime = 184487440737653
prime2 = 186487440738019

def response_mimetype(request):
    if "application/json" in request.META['HTTP_ACCEPT']:
        return "application/json"
    else:
        return "text/plain"

class FileCreateView(CreateView):
    model = File
    form_class = FileForm
    
    def get_form_kwargs(self, **kwargs):
        # pass "user" keyword argument with the current user to your form
        kwargs = super(FileCreateView, self).get_form_kwargs(**kwargs)
        kwargs.update( {'owner' : self.request.user } )
        return kwargs
    
    def form_valid(self, form):
        self.object = form.save()
        self.object.base64id = base64.b64encode(str(self.object.id * prime % prime2))
        self.object.save(update_fields=['base64id'])
        f = self.request.FILES.get('file')
        data = [{'name': f.name, 'url': settings.MEDIA_URL + "files/" + f.name.replace(" ", "_"), 'thumbnail_url': settings.MEDIA_URL + "files/" + f.name.replace(" ", "_"), 'delete_url': reverse('upload-delete', args=[self.object.id]), 'delete_type': "DELETE"}]
        response = JSONResponse(data, {}, response_mimetype(self.request))
        response['Content-Disposition'] = 'inline; filename=files.json'
        return response

    def get_context_data(self, **kwargs):
        context = super(FileCreateView, self).get_context_data(**kwargs)
        context['files'] = File.objects.all()
        return context


class FileDeleteView(DeleteView):
    model = File

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.delete()
        if request.is_ajax():
            response = JSONResponse(True, {}, response_mimetype(self.request))
            response['Content-Disposition'] = 'inline; filename=files.json'
            return response
        else:
            # TODO:
            # This will no longer redirect once we implement
            # the forms under the files we wish to delete
            return HttpResponseRedirect('../../../../#/upload')

class JSONResponse(HttpResponse):
    """JSON response class."""
    def __init__(self,obj='',json_opts={},mimetype="application/json",*args,**kwargs):
        content = simplejson.dumps(obj,**json_opts)
        super(JSONResponse,self).__init__(content,mimetype,*args,**kwargs)
