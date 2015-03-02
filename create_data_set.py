# import pyaudio
from sys import argv
import numpy as np
from scipy import fft
import wave
import subprocess as sp
import matplotlib.pyplot as plt

#Atributes for the stream    
NUM_SAMPLES = 1024
SAMPLING_RATE = 44100 #11025
SPECTROGRAM_LENGTH = 50

script, filename1, filename2, filename3 = argv


def open_mp3(filename):
    command = [ 'ffmpeg',
            '-i', filename,
            '-f', 's16le',
            '-acodec', 'pcm_s16le',
            '-ar', '44100', # ouput will have 44100 Hz
            '-ac', '2', # stereo (set to '1' for mono)
            '-']
    pipe = sp.Popen(command, stdout=sp.PIPE, bufsize=10**8)
    
    raw_audio = pipe.stdout.read(88200*4)
    
    pipe.terminate()
    audio_array = np.fromstring(raw_audio, dtype=np.short)
    # return audio_array.reshape((len(audio_array)/2,2))
    return audio_array

def open_wav(filename):
    w = wave.open(filename, 'r')
    raw_audio = w.readframes(w.getnframes())
    audio_array = np.fromstring(raw_audio, dtype=np.short)
    w.close()
    return audio_array
    
# def open_live():
#     'Capture live microphone input with pyaudio'
    # pa = pyaudio.PyAudio()
    # stream = pa.open(format=pyaudio.paInt16, channels=1, rate=SAMPLING_RATE,
    #                  input=True, frames_per_buffer=NUM_SAMPLES)
    # audio_data  = np.fromstring(stream.read(NUM_SAMPLES), dtype=np.short)
    # stream.close()
    # return audio_data

def read_audio(filename):
    if filename.split('.')[-1] == 'wav':
        audio_data = open_wav(filename)
    elif filename.split('.')[-1] == 'mp3':
        audio_data = open_mp3(filename)
    else:
        print "Not a valid filetype. Please use .mp3 or .wav"
        return None

    return audio_data / 32768.0
    
def spectrogram(signal):
    frame_sz = 4096
    hop_sz = 2048
    S = np.array([np.absolute(fft(signal[i:i+frame_sz]))
                     for i in range(0, len(signal)-frame_sz, hop_sz)])
    print S.shape
    return S

def compute_filterbank(spectrum):
    num_formants = 12
    filter_output = list()
    mels = np.array([1,200,400,630,920,1270,1720,2320,3200])/6.25
    for i in range(1, len(mels)):
        filter_output.append(sum(spectrum[mels[i-1]:mels[i]]))
    return np.array(filter_output)



def get_sample(filename):
    normalized_data = read_audio(filename)
    sound_fft = abs(fft(normalized_data))[:NUM_SAMPLES/2]
    
    bucket_scores=[]
    mels = np.array([1,200,400,630,920,1270,1720,2320,3200])/6.25
    
    
    for i,x in enumerate(mels):
        if i == 0:
            continue
        else:
            bucket_scores.append(sum(sound_fft[mels[i-1]:x]))
    
    # if bucket_scores[0] > 10:
    #     print bucket_scores
    return bucket_scores

def plot_signal(x):
    print len(x), type(x)
    #plt.plot(x1[120000:121000])
    #plt.plot(x, first_file, 'k', x, second_file, 'bo', x, third_file, 'g^')
    S = spectrogram(x)
    filterbank_output = np.array([compute_filterbank(s) for s in S])
    #plt.imshow(S[:,:400].T, aspect='auto', origin='lower')
    plt.figure()
    plt.imshow(filterbank_output.T, aspect='auto', origin='lower')
    plt.xlabel('Time')
    plt.ylabel('Frequency')
    plt.show() 

def plot_signals(x1, x2, x3):
    plot_signal(x1)
    plot_signal(x2)
    plot_signal(x3)
    
if __name__ == '__main__':
    first_file = get_sample(filename1)
    second_file = get_sample(filename2)
    third_file = get_sample(filename3)
    x = range(9)[1:9]
    plot_signals(read_audio(filename1), 
                 read_audio(filename2),
                 read_audio(filename3))