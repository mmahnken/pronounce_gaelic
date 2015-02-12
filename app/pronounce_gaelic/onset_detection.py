from essentia.standard import OnsetRate, MonoLoader, AudioOnsetsMarker
from scipy.io.wavfile import write

class OnsetDetector(object):
    def __init__(self, audio_file_path):
        self.audio = MonoLoader(filename=audio_file_path)()
        self.mimetype = audio_file_path.split('.')[-1]
        self.rate = 44100
        self.name = audio_file_path.split('/')[-1]


    def get_onsets(self):
        """Takes an audio_file name, returns two things.
        1) an array with points of onset and 2) a onset rate."""
        find_onsets = OnsetRate()
        self.onsets, self.onset_rate = find_onsets(self.audio)
        return self.onsets, self.onset_rate

    def mark_onsets(self):
        """Takes an audio file name, returns a new audio file
        name with points of onset marked with beeps."""
        onsets_marker = AudioOnsetsMarker(onsets=self.onset_times, type='beep')
        x_beeps = onsets_marker(self.audio)
        return write(self.name[:-4]+'_with_onsets'+self.name[-4:], self.rate, x_beeps)

    def get_diffs(self):
        return [ self.onsets[index+1]-self.onsets[index] for index in range(len(self.onsets)-1) ]

class OnsetComparison(object):
    def __init__(self, ref_filepath, user_filepath):
        "Init this with the  names of two audio files."
        self.ref_onset_detector = OnsetDetector(ref_filepath)
        self.user_onset_detector = OnsetDetector(user_filepath)


    def compare(self):
        """returns a integer that represents the percentage similarity
        in the timing of onsets"""
        # calculate the distances between the onsets
        # figure out how many the two files have in common
        self.ref_onset_detector.get_onsets()
        self.user_onset_detector.get_onsets()
        self.ref_diffs = self.ref_onset_detector.get_diffs()
        self.user_diffs = self.user_onset_detector.get_diffs()    
        print self.ref_diffs
        print self.user_diffs

        z_user_diffs = [round(num, 1) for num in self.user_diffs]
        z_ref_diffs = [round(num, 1) for num in self.ref_diffs]
        # TODO compare and throw out the extras!
        return #something

