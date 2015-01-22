import random
import unittest
import compare as c
import os

TRAINING_DIR = 'gaelic_audio'
USER_AUDIO = 'window_meggie.wav'
USER_REF_AUDIO = 'gaelic_audio/window.mp3'

class TestMatchingAlgorithm(unittest.TestCase):
    def setUp(self):
        print "setting up audio match test"
        self.comparator = c.train(TRAINING_DIR)
        self.training_dir = TRAINING_DIR
        training_files = [os.path.join(TRAINING_DIR, f) for f in os.listdir(TRAINING_DIR)]
        self.random_ref_file = random.choice(training_files)
        self.user_audio = USER_AUDIO
        self.user_ref_audio = USER_REF_AUDIO

    def test_self_equality(self):
        """Given reference audio x, test whether querying x 
           returns x in the top 3 matching results."""
        results = c.compare(self.random_ref_file, self.random_ref_file, self.comparator)
        self.assertTrue(self.random_ref_file in results[0:3])

    def test_strict_self_equality(self):
        """Given reference audio x, test whether 
          querying x returns x as the highest matching result."""
        results = c.compare(self.random_ref_file, self.random_ref_file, self.comparator)
        self.assertTrue(self.random_ref_file == results[0])

    def test_audio_search(self):
        """Given user generated audio x, test whether the
           the corresponding reference file y for the same word
           is in the top 3 matching results."""
        results = c.compare(self.user_ref_audio, self.user_audio, self.comparator)
        self.assertTrue(self.random_ref_file == results[0:3]) 

class TestPointsOfOnset(unittest.TestCase):
    def setUp(self):
        training_files = [os.path.join(TRAINING_DIR, f) for f in os.listdir(TRAINING_DIR)]
        self.ref_file_1 = random.choice(training_files)
        while self.ref_file_1 == ref_file_2:
            ref_file_2 = random.choice(training_files)
        self.ref_file_2 = ref_file_2

    def test_different_points_of_onset(self):
        pass
        # get 2 random audio files
        # find points of onset for each
        # make sure the two are not equal

    def test_similar_points_of_onset(self):
        pass
        # get a reference and homemade audio file for same signal
        # find points of onset for each
        # make sure the two are relatively similar


if __name__ == "__main__":
    unittest.main()

