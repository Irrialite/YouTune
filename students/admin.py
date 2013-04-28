from django.contrib import admin
from students.models import Team, Student


class StudentsInline(admin.StackedInline):
    model = Student
    extra = 0


class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'grade')
    inlines = [StudentsInline]

admin.site.register(Student)
admin.site.register(Team, TeamAdmin)
