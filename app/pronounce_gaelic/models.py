from django.db import models


class ReferenceWord(models.Model):
    url = models.URLField()
    word = models.CharField(max_length=200)
    english_usage = models.TextField()

    class Meta:
        db_table = 'reference_words'

    def json(self):
        json_attrs = {}
        json_attrs['id'] = self.id
        json_attrs['url'] = self.url
        json_attrs['word'] = self.word
        json_attrs['english_usage'] = self.english_usage
        return json_attrs


class User(models.Model):
    name = models.CharField(max_length=60)
    created = models.DateTimeField('date joined')

    def json(self):
        json_attrs = {}
        json_attrs['id'] = self.id
        json_attrs['name'] = self.name
        json_attrs['created'] = self.created


class Game(models.Model):
    created_at = models.DateTimeField('date of game')
    # user_words = relationship()

    class Meta:
        db_table = 'games'

    def __str__(self):
        return 'A game created on %s' % (self.created_at.strftime('%m/%d/%y'))


class UserWord(models.Model):
    num_pronunciations = models.IntegerField(default=0)
    best_score = models.IntegerField()
    reference_word = models.ForeignKey(ReferenceWord)
    user = models.ForeignKey(User)

    class Meta:
        db_table = 'user_words'
