# this code is a modified version of http://nbviewer.ipython.org/github/stevetjoa/stanford-mir/blob/master/notebooks/lsh_fingerprinting.ipynb

from sklearn.random_projection import GaussianRandomProjection
import essentia.standard as ess
import os
import os.path
from numpy.random import randn

#rcParams['figure.figsize'] = (15, 5)
#training_dir = '../train/'
#training_files = [os.path.join(training_dir, f) for f in os.listdir(training_dir)]

def hash_func(vecs, model):
	bools = model.transform(vecs) >0
	return [bool2int(bool_vec) for bool_vec in bools]

def bool2int(x):
	y=0
	for i, j in enumerate(x):
		if j: y += 1<<i
	return y

#model = GaussianRandomProjection(n_components=3, random_state=None)
#model.fit(randn(10000, 8))

#X = randn(12, 8)
#hash_func(X, model)

class Table:

	def __init__(self, hash_size, dim):
		self.table = dict()
		self.hash_size = hash_size
		self.dim = dim
		self.projections = GaussianRandomProjection(n_components=hash_size)
		self.projections.fit(randn(10000, dim))

	def add(self, vecs, label):
		entry = {'label': label}
		hashes = hash_func(vecs, self.projections)
		for h in hashes:
			if self.table.has_key(h):
				self.table[h].append(entry)
			else:
				self.table[h] = [entry]
	
	def query(self, vecs):
		hashes = hash_func(vecs, self.projections)
		results = list()
		for h in hashes:
			if self.table.has_key(h):
				results.extend(self.table[h])
		return results

class LSH:
	def __init__(self, dim):
		self.num_tables = 4
		self.hash_size = 8
		self.dim = dim
		self.tables = list()
		for i in range(self.num_tables):
			self.tables.append(Table(self.hash_size, self.dim))
	
	def add(self, vecs, label):
		for table in self.tables:
			table.add(vecs, label)

	def query(self, vecs):
		results = list()
		for table in self.tables:
			results.extend(table.query(vecs))
		return results

	def describe(self):
		for table in self.tables:
			print table.table


class MusicSearch:

	def __init__(self, training_files):
		self.frame_size = 44100 # TODO: figure out how long this is in seconds
		self.hop_size = 22000   # TODO: same as above
		self.fv_size = 5000
		self.lsh = LSH(self.fv_size)
		self.training_files = training_files
		self.num_features_in_file = dict()
		for f in self.training_files:
			self.num_features_in_file[f] = 0
	
	def get_features(self, frame):
		hamming_window = ess.Windowing(type="hamming")
		spectrum = ess.Spectrum()
		return spectrum(hamming_window(frame))[:self.fv_size]

	def train(self):
		for filepath in self.training_files:
			x = ess.MonoLoader(filename=filepath)()
			features = [self.get_features(frame) for frame in ess.FrameGenerator(x, frameSize=self.frame_size, hopSize=self.hop_size)]
			self.lsh.add(features, filepath)
			self.num_features_in_file[filepath] += len(features)
	
	def query(self, filepath):
		x = ess.MonoLoader(filename=filepath)()
		features = [self.get_features(frame) for frame in ess.FrameGenerator(x, frameSize=self.frame_size, hopSize=self.hop_size)]
		results = self.lsh.query(features)
		print 'num results', len(results)

		counts = dict()
		for r in results:
			if counts.has_key(r['label']):
				counts[r['label']] += 1
			else:
				counts[r['label']] = 1
		for k in counts:
			counts[k] = float(counts[k])/self.num_features_in_file[k]
		print_results(10, counts)
		return counts

# usage
# ms = MusicSearch(training_files)
# ms.train()
# test_file = 'blah.wav'
# results = ms.query(test_file)

def print_results(num_results, results):
	if num_results >= len(results):
		for r in sorted(results, key=results.get, reverse=True):
			print r, results[r]
	else:
		for r in sorted(results, key=results.get, reverse=True)[0:num_results]:
			print r, results[r]


