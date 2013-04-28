from django.contrib import admin
from youtune.account.models import UserProfile


class UserInline(admin.StackedInline):
    model = UserProfile
    extra = 0

admin.site.register(UserProfile)
