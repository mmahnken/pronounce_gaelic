from django.shortcuts import render
from django.http import HttpResponse
from django.views import generic
from django.views.decorators.csrf import ensure_csrf_cookie
# from compare import train, compare
import json
from models import ReferenceWord
import uuid
import wave
import base64


def index(request):
    return render(request, 'index.html', {'title': "Index"})


@ensure_csrf_cookie
def start(request):
    return render(request, 'game.html', {'title': "Game"})


def start_words(request, level):
    # TODO attach a music search object to the session here.
    words = ReferenceWord.objects.order_by('?')[:10]  # 10 words
    return HttpResponse(json.dumps({'words': [w.json() for w in words]}), content_type='application/json')


def save_audio(request):
    ''' Takes in a stream of audio data, persists it locally,
    stores the filename in db, returns the user_word_id'''
    if request.FILES.get('blob'):
        if request.POST.get('filename'):
            filename = request.POST.get('filename')
        else:
            filename = str(uuid.uuid4())

        f = open('pronounce_gaelic/static/user_audio/'+filename+'.wav', 'w+')
        w = wave.open(f, 'w')
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(44100)

        # uw = UserWord.objects.filter()

        audio_data = request.FILES.get('blob').read()
        w.writeframes(audio_data)
        w.close()
        f.close()
        print '\n\n%s\n\n' % filename
        return HttpResponse(json.dumps({'user_word_id': 2, 'filename': filename}))
    else:
        return HttpResponse(json.dumps({'message': 'no audio data provided in your request'}))

# def process(request, word_id):
#     ms = train('ref_audio')
#     ref_word = ReferenceWord.objects.get(pk=word_id)
#     sorted_results = compare('user_audio/computer.wav', 'ref_audio/computer.mp3', ms)
#     # return HttpResponse("You compared two words, and the results were %s" % sorted_results)
#     # return render(request, 'pronounce_gaelic/index.html', {results: results})
#     return HttpResponse(json.dumps({'data': sorted_results}), content_type="application/json")

class ReferenceWordListView(generic.ListView):
    model = ReferenceWord


