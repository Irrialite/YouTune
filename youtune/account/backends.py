import json
import urlparse
import urllib

from django.db.models import get_model
from django.conf import settings
from django.contrib.auth import backends, models as auth_models
from django.core import urlresolvers

from youtune.account import models


class CaseInsensitiveModelBackend(backends.ModelBackend):

    """
    This backend uses case-insensitive username
    authentication which is not supported by default.
    """

    def authenticate(self, username=None, password=None):
        try:
            user = models.UserProfile.objects.get(username__iexact=username)
            if user.check_password(password):
                return user
        except models.UserProfile.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return self.user_class.objects.get(pk=user_id)
        except self.user_class.DoesNotExist:
            return None

    @property
    def user_class(self):
        if not hasattr(self, '_user_class'):
            self._user_class = get_model(
                *settings.AUTH_PROFILE_MODULE.split('.', 2))
            if not self._user_class:
                raise ImrpoperlyConfigured('Could not get custom user model')
        return self._user_class


class FacebookBackend:

    def authenticate(self, token=None, request=None):
        """
        Facebook authentication.

        Retrieves an access token and Facebook data.
        Determine if user already has a
        profile. If not, a new profile is created using either the user's
        username or Facebook id. Finally, the user's Facebook data is saved.
        """

        args = {
            'client_id': settings.FACEBOOK_APP_ID,
            'client_secret': settings.FACEBOOK_APP_SECRET,
            'redirect_uri': request.build_absolute_uri(
            urlresolvers.reverse('facebook_callback')),
            'code': token,
        }

        # Retrieve access token
        url = urllib.urlopen(
            'https://graph.facebook.com/oauth/access_token?%s' %
            urllib.urlencode(args)).read()
        response = urlparse.parse_qs(url)
        access_token = response['access_token'][-1]

        # Retrieve user's public profile information
        data = urllib.urlopen(
            'https://graph.facebook.com/me?access_token=%s' % access_token)
        fb = json.load(data)

        try:
            # Check if user profile exists
            profile = models.UserProfile.objects.get(facebook_id=fb['id'])

            # Update access token
            profile.token = access_token
            profile.save()

        except models.UserProfile.DoesNotExist:
            # User profile doesn't exist, create new user
            username = fb.get('username', fb['id'])
            user = models.UserProfile.objects.create_user(
                username=username, email=fb['email'])
            user.first_name = fb['first_name']
            user.last_name = fb['last_name']
            user.save()

        return user

    def get_user(self, user_id):
        """
        Returns the user from a given ID.
        """

        try:
            return auth_models.User.objects.get(pk=user_id)
        except auth_models.User.DoesNotExist:
            return None

        supports_object_permissions = False
        supports_anonymous_user = True
