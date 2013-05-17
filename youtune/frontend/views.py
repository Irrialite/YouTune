from django.views import generic as generic_views

from youtune.account import models as account_models


class HomeView(generic_views.TemplateView):
    template_name = 'home.html'


class SearchView(generic_views.TemplateView):
    template_name = 'search.html'


class Error404View(generic_views.TemplateView):
    template_name = '404.html'


class Error500View(generic_views.TemplateView):
    template_name = '500.html'


class UserView(generic_views.TemplateView):

    """
    This view checks if user exist in database
    and returns his user page (profile).
    """

    template_name = 'profile/user.html'
    document = account_models.UserProfile
    slug_field = 'username'
    slug_url_kwarg = 'username'
