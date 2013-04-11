# myapp/api.py
from tastypie.resources import ModelResource
from students.models import Team, Student


class TeamResource(ModelResource):
    class Meta:
        queryset = Team.objects.all()
        resource_name = 'team'

class StudentResource(ModelResource):
    class Meta:
        queryset = Student.objects.all()
        resource_name = 'student'
