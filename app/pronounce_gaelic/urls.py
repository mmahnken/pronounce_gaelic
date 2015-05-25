from django.conf.urls import patterns, url

from pronounce_gaelic import views

urlpatterns = patterns('',
    # ex: /pronounce_gaelic/
    url(r'^$', views.index, name='index'),
    # ex: /pronounce_gaelic/2/compare/
    # url(r'^(?P<word_id>\d+)/process', views.process, name='process'),
    # ex: /start/
    url(r'^start', views.start, name='start'),
    url(r'^(?P<level>\w+)/words', views.start_words, name='start_words'),
    url(r'^save_audio', views.save_audio, name='save_audio'),
    url(r'^words/$', views.ReferenceWordListView.as_view(), name='word_list'),
)
