import urllib
import pdb

from django import shortcuts
from django.conf import settings
from django.contrib import auth
from django.core import urlresolvers
from django.views import generic as generic_views
from django.views.generic import edit as edit_views
from django.template import loader
from django.utils import crypto

from youtune.account import forms, models


class RegistrationView(generic_views.FormView):

    """
    This view checks if form data are valid, saves new user.
    New user is authenticated, logged in and redirected to home page.
    """

    template_name = 'registration.html'
    success_url = urlresolvers.reverse_lazy('home')
    form_class = forms.RegistrationForm

    def form_valid(self, form):
        username, password = form.save()
        new_user = auth.authenticate(username=username, password=password)
        auth.login(self.request, new_user)
        return super(RegistrationView, self).form_valid(form)

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return simple.redirect_to(request, url=self.get_success_url(),
                                      permanent=False)
        return super(RegistrationView, self).dispatch(request, *args, **kwargs)


class AccountChangeView(edit_views.FormView):

    """
    This view displays form for updating user account.
    It checks if all fields are valid and updates it.
    """

    template_name = 'profile/account.html'
    form_class = forms.AccountChangeForm
    success_url = urlresolvers.reverse_lazy('account')

    def form_valid(self, form):
        user = self.request.user
        user.first_name = form.cleaned_data['first_name']
        user.last_name = form.cleaned_data['last_name']
        if user.email != form.cleaned_data['email']:
            user.email_confirmed = False
            user.email = form.cleaned_data['email']
        user.save()
        return super(AccountChangeView, self).form_valid(form)

    def dispatch(self, request, *args, **kwargs):
        # TODO: With lazy user support, we want users to be able to change
        # their account even if not authenticated
        if not request.user.is_authenticated():
            return shortcuts.redirect('login')
        return super(AccountChangeView,
                     self).dispatch(request, *args, **kwargs)

    def get_form(self, form_class):
        return form_class(self.request.user, **self.get_form_kwargs())

    def get_initial(self):
        return {
            'first_name': self.request.user.first_name,
            'last_name': self.request.user.last_name,
            'email': self.request.user.email,
            'gender': self.request.user.gender,
            'birthdate': self.request.user.birthdate,
        }


class PasswordChangeView(edit_views.FormView):

    """
    This view displays form for changing password.
    """

    template_name = 'user/password_change.html'
    form_class = forms.PasswordChangeForm
    success_url = urlresolvers.reverse_lazy('account')

    def form_valid(self, form):
        self.request.user.set_password(form.cleaned_data['password1'])
        return super(PasswordChangeView, self).form_valid(form)

    def dispatch(self, request, *args, **kwargs):
        # TODO: Is this really the correct check? What is user is logged
        # through third-party authentication, but still does not have current
        # password - is not then changing password the same as registration?
        if not request.user.is_authenticated():
            return shortcuts.redirect('login')
        return super(PasswordChangeView,
                     self).dispatch(request, *args, **kwargs)

    def get_form(self, form_class):
        return form_class(self.request.user, **self.get_form_kwargs())


class EmailConfirmationSendToken(edit_views.FormView):
    template_name = 'user/email_confirmation_send_token.html'
    form_class = forms.EmailConfirmationSendTokenForm
    success_url = urlresolvers.reverse_lazy('account')

    def form_valid(self, form):
        user = self.request.user

        confirmation_token = crypto.get_random_string(20)
        context = {
            'CONFIRMATION_TOKEN_VALIDITY': models.CONFIRMATION_TOKEN_VALIDITY,
            'EMAIL_SUBJECT_PREFIX': settings.EMAIL_SUBJECT_PREFIX,
            'SITE_NAME': settings.SITE_NAME,
            'confirmation_token': confirmation_token,
            'email_address': user.email,
            'request': self.request,
            'user': user,
        }

        subject = loader.render_to_string(
            'user/confirmation_email_subject.txt', context)
        # Email subject *must not* contain newlines
        subject = ''.join(subject.splitlines())
        email = loader.render_to_string('user/confirmation_email.txt', context)

        user.email_confirmation_token = models.EmailConfirmationToken(
            value=confirmation_token)
        user.save()
        user.email_user(subject, email)

        return super(EmailConfirmationSendToken, self).form_valid(form)

    def dispatch(self, request, *args, **kwargs):
        # TODO: Allow e-mail address confirmation only if user has e-mail
        # address defined
        return super(EmailConfirmationSendToken,
                     self).dispatch(request, *args, **kwargs)


class EmailConfirmationProcessToken(generic_views.FormView):
    template_name = 'user/email_confirmation_process_token.html'
    form_class = forms.EmailConfirmationProcessTokenForm
    success_url = urlresolvers.reverse_lazy('account')

    def form_valid(self, form):
        user = self.request.user
        user.email_confirmed = True
        user.save()
        return super(EmailConfirmationProcessToken, self).form_valid(form)

    def get_initial(self):
        return {
            'confirmation_token': self.kwargs.get('confirmation_token'),
        }

    def dispatch(self, request, *args, **kwargs):
        # TODO: Allow e-mail address confirmation only if user has e-mail
        # TODO: Check if currently logged in user is the same as the user
        # requested the confirmation
        return super(EmailConfirmationProcessToken,
                     self).dispatch(request, *args, **kwargs)

    def get_form(self, form_class):
        return form_class(self.request.user, **self.get_form_kwargs())


class FacebookLoginView(generic_views.RedirectView):

    """
    This view authenticates the user via Facebook.
    """

    permanent = False

    def get_redirect_url(self, **kwargs):
        args = {
            'client_id': settings.FACEBOOK_APP_ID,
            'scope': settings.FACEBOOK_SCOPE,
            'redirect_uri': self.request.build_absolute_uri(
            urlresolvers.reverse('facebook_callback')),
        }
        return ("https://www.facebook.com/dialog/oauth?%(args)s"
                % {'args': urllib.urlencode(args)})


class FacebookCallbackView(generic_views.RedirectView):

    """
    Authentication callback. Redirects user to LOGIN_REDIRECT_URL.
    """

    permanent = False
    url = settings.FACEBOOK_LOGIN_REDIRECT

    def get(self, request, *args, **kwargs):
        if 'code' in request.GET:
            # TODO: Add security measures to prevent attackers from sending a
            # redirect to this url with a forged 'code'
            user = auth.authenticate(
                token=request.GET['code'], request=request)
            auth.login(request, user)
            # TODO: Message user that they have been logged in (maybe this will
            # already be in auth.login once we move to MongoDB)
            return super(FacebookCallbackView,
                         self).get(request, *args, **kwargs)
        else:
            # TODO: Message user that they have not been logged
            #       in because they cancelled the facebook app
            # TODO: Use information provided from facebook as to why the login
            # was not successful
            return super(FacebookCallbackView,
                         self).get(request, *args, **kwargs)
