from datetime import datetime

from django import forms
from django.conf import settings
from django.contrib.auth import forms as auth_forms, models as auth_models
from django.forms.extras import widgets
from django.utils import safestring
from django.utils.translation import ugettext_lazy as _

from youtune.account import models, fields

# Form settings
GENDER_CHOICES = (
    ('male', _('Male')),
    ('female', _('Female'))
)

class HorizontalRadioRenderer(forms.RadioSelect.renderer):
    """
    Renders horizontal radio buttons.
    Found `here 
    <https://wikis.utexas.edu/display/~bm6432/Django-Modifying+RadioSelect+Widget+to+have+horizontal+buttons>`_.
    """

    def render(self):
        return safestring.mark_safe(u'\n'.join([u'%s\n' % widget for widget in self]))
    
class UserUsernameForm(forms.Form):
    """
    Class with username form.
    """

    username = forms.RegexField(
        label=_("Username"),
        max_length=30,
        min_length=4,
        regex=r'^' + models.USERNAME_REGEX + r'$',
        help_text=_("Minimal of 4 characters and maximum of 30. Letters, digits and @/./+/-/_ only."),
        error_messages={
            'invalid': _("This value may contain only letters, numbers and @/./+/-/_ characters."),
        }
    )

    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            models.UserProfile.objects.get(username__iexact=username)
        except models.UserProfile.DoesNotExist:
            return username
        raise forms.ValidationError(_("A user with that username already exists."))

class UserPasswordForm(forms.Form):
    """
    Class with user password form.
    """

    password1 = forms.CharField(
        label=_("Password"),
        min_length=6,
        widget=forms.PasswordInput,
    )
    password2 = forms.CharField(
        label=_("Password (repeat)"),
        widget=forms.PasswordInput,
        help_text=_("Enter the same password as above, for verification."),
    )

    def clean_password2(self):
        """
        This method checks whether the passwords match.
        """

        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password1 != password2:
            raise forms.ValidationError(_("The two password fields did not match."), code='password_mismatch')
        return password2

class UserCurrentPasswordForm(forms.Form):
    """
    Class with user current password form.
    """

    current_password = forms.CharField(
        label=_("Current password"),
        widget=forms.PasswordInput,
        help_text=_("Enter your current password, for verification."),
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(UserCurrentPasswordForm, self).__init__(*args, **kwargs)

    def clean_current_password(self):
        """
        This method checks if user password is correct.
        """

        password = self.cleaned_data['current_password']
        if not self.user.check_password(password):
            raise forms.ValidationError(_("Your current password was incorrect."), code='password_incorrect')
        return password

class UserBasicInfoForm(forms.Form):
    """
    Class with user basic information form.
    """

    # TODO: Language field is missing?

    first_name = forms.CharField(label=_("First name"))
    last_name = forms.CharField(label=_("Last name"))
    email = forms.EmailField(label=_("E-mail"))

class UserAdditionalInfoForm(forms.Form):
    """
    Class with user additional information form.
    """

class RegistrationForm(UserUsernameForm, UserPasswordForm, UserBasicInfoForm):
    """
    Class with user registration form.
    """
    
    # Additional information
    gender = forms.ChoiceField(label=_("Gender"), required=False, choices=GENDER_CHOICES, widget=forms.RadioSelect(renderer=HorizontalRadioRenderer))    
    current_date = datetime.now()
    birthdate = forms.DateField(label=_("Birth date"), required=False, widget=widgets.SelectDateWidget(years=[y for y in range(current_date.year, 1900, -1)]))
    
    def save(self):    
        # We first have to save user to database
        new_user = models.UserProfile(
            username=self.cleaned_data['username'],
            first_name=self.cleaned_data['first_name'],
            last_name=self.cleaned_data['last_name'],
            email=self.cleaned_data['email'],
            gender=self.cleaned_data['gender'],
            birthdate=self.cleaned_data['birthdate'],
        )    
                                    
        new_user.set_password(self.cleaned_data['password2'])
        new_user.save()

        return self.cleaned_data['username'], self.cleaned_data['password2']

class AccountChangeForm(UserBasicInfoForm, UserAdditionalInfoForm, UserCurrentPasswordForm):
    """
    Class with form for changing your account settings.
    """

class PasswordChangeForm(UserCurrentPasswordForm, UserPasswordForm):
    """
    Class with form for changing password.
    """

class EmailConfirmationSendTokenForm(forms.Form):
    """
    Form for sending an e-mail address confirmation token.
    """

class EmailConfirmationProcessTokenForm(forms.Form):
    """
    Form for processing an e-mail address confirmation token.
    """

    confirmation_token = forms.CharField(
        label=_("Confirmation token"),
        min_length=20,
        max_length=20,
        required=True,
        help_text=_("Please enter the confirmation token you received to your e-mail address."),
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(EmailConfirmationProcessTokenForm, self).__init__(*args, **kwargs)

    def clean_confirmation_token(self):
        """
        This method checks if user confirmation token is correct.
        """

        confirmation_token = self.cleaned_data['confirmation_token']
        if not self.user.email_confirmation_token.check_token(confirmation_token):
            raise forms.ValidationError(_("The confirmation token is invalid or has expired. Please retry."), code='confirmation_token_incorrect')
        return confirmation_token