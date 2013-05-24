from django.forms import ModelForm
from django.forms import Textarea, HiddenInput, TextInput
from django.forms.util import ErrorList

from youtune.fileupload import models

class FileForm(ModelForm):
    class Meta:
        model = models.File
        exclude = ('owner',)       
        
        widgets = {
            #'file': FileInput(attrs={'class' : 'hiddenFileInput'}),
            'artist': TextInput(attrs={'ng-model': 'artist'}),
            'title': TextInput(attrs={'ng-model': 'title'}),
            'description': Textarea(attrs={ 'class': 'textarea' }),
            'artist_img': HiddenInput(),
            'tags': HiddenInput(),
            #'tags': TextInput(attrs={'class': 'tagtext'}),
        }
    
    def __init__(self, *args, **kwargs):
        self.owner = kwargs.pop('owner', None)
        super(FileForm, self).__init__(*args, **kwargs)
            
    def save(self, commit=True):
        #self.instance = super(FileForm, self).save(commit=False)
        if self.owner:
            self.instance.owner = self.owner
        return super(FileForm, self).save(commit)