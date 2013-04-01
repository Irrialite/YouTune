__author__ = 'SnowMan'


from django.contrib import admin
from polls.models import Poll, Choice


#this change makes the Publication date come before the Question field - says so in tutorial
#plus other stuff related to Polls
class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 3

class PollAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,               {'fields': ['question']}),
        ('Date information', {'fields': ['pub_date'], 'classes': ['collapse']}),
        ]
    inlines = [ChoiceInline]
    list_display = ('question', 'pub_date', 'was_published_recently')
    list_filter = ['pub_date']

    search_fields = ['question']
    date_hierarchy = 'pub_date'


admin.site.register(Poll, PollAdmin)