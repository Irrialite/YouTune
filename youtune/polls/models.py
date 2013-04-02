import datetime

from django.db import models
from django.utils import timezone




#vsak model je svoja tabela v bazi

#ta ma 3 stolpce, question, pub_date, id
class Poll(models.Model):
    question = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

    def __unicode__(self):
        return self.question

    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
    was_published_recently.admin_order_field = 'pub_date'
    was_published_recently.boolean = True
    was_published_recently.short_description = 'Published recently?'

#ta ma 4 stolpce, poll, choice_text, votes, id
class Choice(models.Model):
    poll = models.ForeignKey(Poll)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

    def __unicode__(self): #vedno ko izpisujes na screen se klice unicode, isto ko .toString
        return self.choice_text