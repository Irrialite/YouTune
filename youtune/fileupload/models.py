import os

from django.db import models
from django.utils import timezone

from youtune.account import models as account_models

def update_filename(instance, filename):
    path = "files"
    folder = instance.owner.username
    filename = filename.replace(" ", "_")
    filenameExt = ".mp3"
    if len(filename) > 20:
        filename = filename[:17] + filenameExt
    return os.path.join(path, folder, filename)

class File(models.Model):

    file = models.FileField(upload_to=update_filename)
    slug = models.SlugField(max_length=50, blank=True)
    artist = models.CharField(max_length=50)
    title = models.CharField(max_length=100)
    owner = models.ForeignKey(account_models.UserProfile)
    base64id = models.CharField(max_length=100, blank=True)
    
    votes = models.ManyToManyField(account_models.UserProfile, blank=True, related_name='votes')
    likes = models.ManyToManyField(account_models.UserProfile, blank=True, related_name='likes')
    
    upload_date = models.DateTimeField(blank=True)
    
    # TODO:
    # genres, tags, description
    
    def __unicode__(self):
        return self.file.name

    def save(self, *args, **kwargs):
        if not self.upload_date:
            print "ok"
            self.upload_date = timezone.now()
        if not self.slug:
            print "ok2"
            self.slug = self.file.name
        super(File, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.file.delete(False)
        super(File, self).delete(*args, **kwargs)