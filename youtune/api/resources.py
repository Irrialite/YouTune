from django.contrib.auth import models as auth_models

from tastypie import resources, fields

from youtune.account import models
from helpers import FieldsValidation

class UserResource(resources.ModelResource):
    
    class Meta:
        queryset = auth_models.User.objects.all()
        resource_name = 'user'
        excludes = ['email', 'password', 'is_staff', 'is_superuser']

    def dehydrate(self, bundle):
        if bundle.request.user.pk == bundle.obj.pk:
            bundle.data['email'] = bundle.obj.email
            bundle.data['is_staff'] = bundle.obj.is_staff
            bundle.data['is_superuser'] = bundle.obj.is_superuser
            
        return bundle

class UserProfileResource(resources.ModelResource):
    user = fields.ToOneField(UserResource, 'user', related_name='userprofile', full=True)
    
    class Meta:
        queryset = models.UserProfile.objects.all()
        resource_name = 'userprofile'

class UserValidation(FieldsValidation):

    def __init__(self):
        super(UserValidation, self).__init__( required=['username','first_name','last_name'],
                                              validated=['username'],
                                              required_post = ['email', 'password'],
                                              validated_post = ['password'],
                                            )

    @staticmethod
    def password_is_valid(password, bundle):
        if len(password) < 6:
            return False, 'Password is too short.'
        return True, ""

    @staticmethod
    def username_is_valid(username, bundle):
        try:
            user = User.objects.get(username=username)
            print bundle.data

            if user is not None and str(user.id) != str(bundle.data.get('id',0)):
                return False, "The username is already taken."

        except User.DoesNotExist:
            return True, ""
        return True, ""