from django.db import models

class File(models.Model):

    file = models.FileField(upload_to="files")
    slug = models.SlugField(max_length=50, blank=True)
    
    # TODO:
    # Add owner field

    def __unicode__(self):
        return self.file.name

    def save(self, *args, **kwargs):
        self.slug = self.file.name
        super(File, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.file.delete(False)
        super(File, self).delete(*args, **kwargs)
