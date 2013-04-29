from django.contrib.auth import models as auth_models

from tastypie import resources, fields

from youtune.account import models

class UserResource(resources.ModelResource):
    def dehydrate_password(self, bundle):
        return ''
    
    class Meta:
        queryset = auth_models.User.objects.all()
        resource_name = 'user'

class UserProfileResource(resources.ModelResource):
    user = fields.ToOneField(UserResource, 'user', related_name='userprofile', full=True)
    
    class Meta:
        queryset = models.UserProfile.objects.all()
        resource_name = 'userprofile'