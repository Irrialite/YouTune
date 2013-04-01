from django.conf import settings
from django.views import generic as generic_views

class HomeView( generic_views.TemplateView ):
	template_name = 'home.html'

class SearchView( generic_views.TemplateView ):
	template_name = 'search.html'
	
class Error404View( generic_views.TemplateView ):
	template_name = '404.html'

class Error500View( generic_views.TemplateView ):
	template_name = '500.html'