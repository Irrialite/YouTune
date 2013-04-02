from django.contrib.auth import models as auth_models
from django.db import models as django_models
from django.utils import timezone

from youtune.account import fields

USERNAME_REGEX = r'[\w.@+-]+'
CONFIRMATION_TOKEN_VALIDITY = 5 # days

class UserProfile(django_models.Model):
    """ 
    Class used for storing additional information about user.
    """

    user = django_models.OneToOneField(auth_models.User)

    # Custom fields
    birthdate = django_models.DateField(blank=True, null=True)
    gender = django_models.CharField(max_length=6, blank=True)
    facebook_id = django_models.BigIntegerField(verbose_name=u'Facebook ID', null=True, blank=True)
    token = django_models.CharField(max_length=150)
    language = fields.LanguageField(verbose_name=u'language')
    
    def __unicode__(self):
        return u'%s' % (self.user)
    
    def get_full_name(self):
        """Returns the users first and last names, separated by a space.
        """
        full_name = u'%s %s' % (self.first_name or '', self.last_name or '')
        return full_name.strip()

class EmailConfirmationToken(django_models.Model):
    value = django_models.CharField(max_length=20)
    created_time = django_models.DateTimeField(default=lambda: timezone.now())

    def check_token(self, confirmation_token):
        if confirmation_token != self.value:
            return False
        elif (timezone.now() - self.created_time).days > CONFIRMATION_TOKEN_VALIDITY:
            return False
        else:
            return True