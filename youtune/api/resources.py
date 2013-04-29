from django.contrib.auth import authenticate, login, logout, models as auth_models
from django.conf.urls import url

from tastypie import resources, fields
from tastypie.utils import trailing_slash
from tastypie.http import HttpUnauthorized, HttpForbidden

from youtune.api.helpers import FieldsValidation
from youtune.account import models

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
    
    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/login%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(r'^(?P<resource_name>%s)/logout%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name='api_logout'),
        ]

    def login(self, request, **kwargs):
        self.method_check(request, allowed=['post'])

        data = self.deserialize(request, request.raw_post_data, format=request.META.get('CONTENT_TYPE', 'application/json'))

        username = data.get('username', '')
        password = data.get('password', '')

        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return self.create_response(request, {
                    'success': True
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                    }, HttpForbidden )
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
                }, HttpUnauthorized )

    def logout(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, { 'success': True })
        else:
            return self.create_response(request, { 'success': False }, HttpUnauthorized)

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