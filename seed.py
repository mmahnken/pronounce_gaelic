import BeautifulSoup
import os
from subprocess import call
import re

def read_file():
	f = open('words.txt')
	words = f.read()
	f.close()
	return words

def create_list(words):
	l = words.split(' ')
	for w in l[:]:
		if w[0] == '(' or w[-1] == ')':
			l.remove(w)
	print l
	return l

def scrape_dict(word_list):
	fd = open('audio.csv','a')
	for word in word_list:
		call(['phantomjs', 'scrape.js', word])   # call phantom get html, create txt file
		row = process('phantom_pages/%s.txt' % word)   # process the txt file into csv row
		fd.write(row.encode('utf8'))
		os.remove('phantom_pages/%s.txt' % word) # remove file
	fd.close()
	return
		
def process(phantom_filename):
	"""Take a txt file of html from Gaelic Dict website,
	output is gaelic word, english usage, and s3 url to mp3 file."""
	f = open(phantom_filename)
	html = f.read()
	f.close()
	bs = BeautifulSoup.BeautifulSoup(html)
	if bs.find('div', {'id':'errorContainer'}).findAll('div')[0].text != 'No results found.':
		table = bs.find('table', {'class':'resTable'})
		rows = table.findAll('tr')
		columns = rows[1].findAll('td')
		usage = columns[1].text.replace('!', '')
		usage = re.split('1|2|3|4|5|6|7', usage)
		usage = ';'.join(usage)
		if rows[1].find('source'):
			url = rows[1].find('source')['src']
		else:
			url = None
		csv_row = '%s,%s,%s\n' % (columns[0].text, usage, str(url))
		print csv_row
		return csv_row
	else:
		return ''
