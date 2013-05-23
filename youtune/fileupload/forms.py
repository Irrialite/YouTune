from django.forms import ModelForm
from django.forms import FileInput
from django.forms.util import ErrorList

from youtune.fileupload import models

class FileForm(ModelForm):
    class Meta:
        model = models.File
        exclude = ('owner',)       
        #
        #widgets = {
        #    'file': FileInput(attrs={'class' : 'hiddenFileInput'}),
        #}
    
    def __init__(self, *args, **kwargs):
        self.owner = kwargs.pop('owner', None)
        super(FileForm, self).__init__(*args, **kwargs)
            
    def save(self, commit=True):
        #self.instance = super(FileForm, self).save(commit=False)
        if self.owner:
            self.instance.owner = self.owner
        return super(FileForm, self).save(commit)