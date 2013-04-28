from django.contrib.auth import models as auth_models

from tastypie import resources, fields

from youtune.account import models


class UserProfileResource(resources.ModelResource):
    user = fields.ToOneField('UserResource', 'user', related_name='profile')
    
    class Meta:
        queryset = models.UserProfile.objects.all()
        resource_name = 'userprofile'

class UserResource(resources.ModelResource):
    profile = fields.ToOneField('UserProfileResource', 'profile', null=True)
    
    def dehydrate_password(self, bundle):
        return ''
    
    class Meta:
        queryset = auth_models.User.objects.all()
        resource_name = 'user'