from datetime import date, datetime
import hashlib, inspect

from django.contrib.auth import authenticate, login, logout, models as auth_models
from django.contrib.auth.hashers import make_password
from django.conf.urls import url

from tastypie import resources, fields
from tastypie.authentication import Authentication
from tastypie.authorization import Authorization
from tastypie.constants import ALL
from tastypie.utils import trailing_slash
from tastypie.http import HttpUnauthorized, HttpForbidden

from youtune.account import models, forms
from youtune.api.helpers import FieldsValidation
from youtune.api.authorization import UserObjectsOnlyAuthorization
from youtune.fileupload import models as file_models


class UserProfileResource(resources.ModelResource):
    id = fields.IntegerField(attribute="id", null=True)

    class Meta:
        queryset = models.UserProfile.objects.all()
        resource_name = 'userprofile'
        # TODO:
        # Add custom Authorization (important)
        authentication = Authentication()
        authorization = Authorization()
        # excludes = ['email', 'is_staff', 'is_superuser']
        filtering = {
            'username': ALL
        }

    def dehydrate_password(self, bundle):
        return ''

    def dehydrate(self, bundle):
        if bundle.request.user.pk == bundle.obj.pk:
            bundle.data['email'] = bundle.obj.email
            bundle.data['is_staff'] = bundle.obj.is_staff
            bundle.data['is_superuser'] = bundle.obj.is_superuser

        return bundle

    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/login%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(r'^(?P<resource_name>%s)/logout%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name='api_logout'),
            url(r'^(?P<resource_name>%s)/loggedin%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('loggedin'), name='api_loggedin'),
            url(r'^(?P<resource_name>%s)/checkfordupe%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('checkfordupe'), name='api_checkfordupe'),
        ]

    def login(self, request, **kwargs):
        self.method_check(request, allowed=['post'])

        data = self.deserialize(request, request.raw_post_data,
                                format=request.META.get('CONTENT_TYPE', 'application/json'))

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
                }, HttpForbidden)
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
            }, HttpUnauthorized)

    def logout(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, {'success': True})
        else:
            return self.create_response(request, {'success': False}, HttpUnauthorized)

    def hydrate(self, bundle):
        # About to do some ninja skills
        if bundle.request.method == 'PATCH':
            bundle.data['password'] = models.UserProfile.objects.get(pk=int(bundle.data['id'])).password
        else:
            bundle.data['password'] = make_password(bundle.data['password'])
        if bundle.data['birthdate']:
            birthdate = bundle.data['birthdate'].split("-")
            birthdate = date(year=int(birthdate[0]), month=int(
                birthdate[1]), day=int(birthdate[2]))
            bundle.data['birthdate'] = birthdate
        bundle.data['avatar'] = "http://www.gravatar.com/avatar/" + hashlib.md5(bundle.data['email'].lower()).hexdigest();
        return bundle

    def loggedin(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user.is_authenticated():
            return self.create_response(request, {
                'success': True,
                'id': request.user.id,
            })
        else:
            return self.create_response(request, {
                'success': False
            })

    def checkfordupe(self, request, **kwargs):
        self.method_check(request, allowed=['post'])
        data = self.deserialize(request, request.raw_post_data,
                                format=request.META.get('CONTENT_TYPE', 'application/json'))

        username = data.get('username', '')
        user = None;
        try:
            user = models.UserProfile.objects.get(username__iexact=username)
        except models.UserProfile.DoesNotExist:
            return self.create_response(request, {
                'success': True,
            })
        else:
            return self.create_response(request, {
                'success': False,
                'id': user.id,
            })
            
class FileResource(resources.ModelResource):

    class Meta:
        allowed_methods = ['get']
        queryset = file_models.File.objects.all()
        resource_name = 'music'
        filtering = {
            'base64id': ALL,
            'upload_date': ALL
        }
        
    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/vote%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('vote'), name="api_vote"),
        ]    

    # to sort by descending insert '-' (i.e. '-title')
    def apply_sorting(self, objects, options=None):
        if options:
            if 'sortby' in options:
                return objects.order_by(options['sortby'])
 
        return super(FileResource, self).apply_sorting(objects, options)
        
    def vote(self, request, **kwargs):
        self.method_check(request, allowed=['post'])
        data = self.deserialize(request, request.raw_post_data,
                                format=request.META.get('CONTENT_TYPE', 'application/json'))

        vote = data.get('vote', '')
        base64id = data.get('base64id', '')
        userid = data.get('userid', '')
        track = None
        try:
            track = file_models.File.objects.get(base64id__exact=base64id)
            user = models.UserProfile.objects.get(pk=userid)
            if vote == "like":
                track.likes.add(user)
            track.votes.add(user)
        except file_models.File.DoesNotExist, models.UserProfile.DoesNotExist:
            return self.create_response(request, {
                'success': False,
            })
        else:
            return self.create_response(request, {
                'success': True,
                'dislikes': track.votes.count() - track.likes.count(),
                'likes': track.likes.count(),
            })
            
    def dehydrate(self, bundle):
        track = file_models.File.objects.get(pk=bundle.data['id'])
        bundle.data['likes'] = track.likes.count()        
        bundle.data['dislikes'] = track.votes.count() - track.likes.count()
        return bundle

class UserValidation(FieldsValidation):

    def __init__(self):
        super(
            UserValidation, self).__init__(required=['username', 'first_name', 'last_name'],
                                           validated=['username'],
                                           required_post=[
                                           'email', 'password'],
                                           validated_post=['password'],
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

            if user is not None and str(user.id) != str(bundle.data.get('id', 0)):
                return False, "The username is already taken."

        except User.DoesNotExist:
            return True, ""
        return True, ""
