from essentia.standard import MonoLoader, MFCC, Spectrum, Windowing, FrameGenerator
import matplotlib.pyplot as plt
import numpy as np

	
def mfcc(filename, frame_size, hop_size):
	x = MonoLoader(filename=filename)()
	t = np.arange(len(x))/44100.0
	plt.plot(t, x)
	plt.show()

	hamming_window = Windowing(type='hamming')
	spectrum = Spectrum()  # we just want the magnitude spectrum
	mfcc = MFCC()
	mfccs = np.array([mfcc(spectrum(hamming_window(frame)))[1]
	               for frame in FrameGenerator(x, frameSize=frame_size, hopSize=hop_size)])
	print mfccs.shape
	plt.imshow(mfccs[:,1:].T, origin='lower', aspect='auto', interpolation='nearest')
	plt.yticks(range(12), range(1, 13))
	plt.ylabel('MFCC Coefficient Index')
	plt.xlabel('Frame Index')	
	return mfccs
