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
    album = models.CharField(max_length=100, blank=True)
    year = models.IntegerField(blank=True, null=True)
    owner = models.ForeignKey(account_models.UserProfile)
    base64id = models.CharField(max_length=100, blank=True)
    
    votes = models.ManyToManyField(account_models.UserProfile, blank=True, related_name='votes')
    likes = models.ManyToManyField(account_models.UserProfile, blank=True, related_name='likes')
    views = models.BigIntegerField(blank=True)
    
    description = models.TextField(blank=True)
    tags = models.TextField(blank=True)
    
    artist_img = models.CharField(max_length=200, blank=True)
    
    upload_date = models.DateTimeField(blank=True)
    
    comments = models.ManyToManyField('Comment', blank=True, related_name='file_comments')
    
    def __unicode__(self):
        return self.file.name

    def save(self, *args, **kwargs):
        if not self.upload_date:
            self.upload_date = timezone.now()
        if not self.slug:
            self.slug = self.file.name
        if not self.views:
            self.views = 0
        super(File, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.file.delete(False)
        super(File, self).delete(*args, **kwargs)

class Comment(models.Model):
    owner = models.ForeignKey(account_models.UserProfile)
    file = models.ForeignKey(File)
    
    # base64id for easier filtering
    base64id = models.CharField(max_length=100)
    body = models.TextField()
    post_date = models.DateTimeField(blank=True)
    
    votes = models.ManyToManyField(account_models.UserProfile, blank=True, related_name='comment_votes')
    likes = models.ManyToManyField(account_models.UserProfile, blank=True, related_name='comment_likes')
    
    def save(self, *args, **kwargs):
        if not self.post_date:
            self.post_date = timezone.now()
        if not self.base64id:
            self.base64id = self.file.base64id
        super(Comment, self).save(*args, **kwargs)