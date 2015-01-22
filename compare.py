from lsh import MusicSearch
import os


def train(training_dir):
	training_files = [os.path.join(training_dir, f) for f in os.listdir(training_dir)]
	ms = MusicSearch(training_files)
	ms.train()
	return ms

def compare(ref_audio, user_audio, trained_comparator):
	# results = trained_comparator.query(ref_audio)
	# ref_stat_sorted = sorted(results, key=results.get, reverse=True)
	user_results = trained_comparator.query(user_audio)
	user_results_sorted = sorted(user_results, key=user_results.get, reverse=True)
	# diff_from_ref = user_results[user_results_sorted[0]] - results[ref_stat_sorted[0]]
	# if ref_stat_sorted[0] == user_results_sorted[0]:
	#  	# the correct audio file was the first match
	# 	print "The correct file was a match!"
	# 	print diff_from_ref
	# else:
	# 	print "That was terrible, try again."
	# 	# they really butchered the pronunciation
	return user_results_sorted

