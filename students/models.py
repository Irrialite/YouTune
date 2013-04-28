from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=200)
    grade = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

class Student(models.Model):
    name = models.CharField(max_length=200)
    surname = models.CharField(max_length=200)
    team = models.ForeignKey(Team)

    def __unicode__(self):
        return "%s %s" % (self.name, self.surname)
