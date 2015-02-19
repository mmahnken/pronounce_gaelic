from django.shortcuts import render
from django.http import HttpResponse
from compare import train, compare
import json
from models import ReferenceWord


def index(request):
    return render(request, 'index.html', {'title': "Index"})

def start(request):
    return render(request, 'game.html', {'title': "Game"})

def start_words(request, level):
    # TODO attach a music search object to the session here.
    words = ReferenceWord.objects.order_by('?')[:3] # 3 words
    return HttpResponse(json.dumps({'words':[w.json() for w in words]}), content_type='application/json')

def receive_stream():
    #get streamed file
    # save it to db
    # return id, go to process func? or return response?
    pass

def process(request, word_id):
    ms = train('ref_audio')
    ref_word = ReferenceWord.objects.get(pk=word_id)
    sorted_results = compare('user_audio/computer.wav', 'ref_audio/computer.mp3', ms)
    # return HttpResponse("You compared two words, and the results were %s" % sorted_results)
    # return render(request, 'pronounce_gaelic/index.html', {results: results})
    return HttpResponse(json.dumps({'data': sorted_results}), content_type="application/json")




