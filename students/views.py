from django.shortcuts import render

from students.models import Team, Student

def index(request):
    return render(request, 'students/client_example.html')

def server(request):
    context = {
        'team_list': Team.objects.all(),
        'student_list': Student.objects.all(),
        }
    return render(request, 'students/server_example.html', context)
