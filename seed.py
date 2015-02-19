from sys import argv
import codecs

SCRIPT, FILENAME, FIXTURENAME = argv

def make_rows(csv_file):
    f = codecs.open(csv_file, 'r', 'utf-8')
    unicode_lines = f.readlines()
    lines = [line.encode('ascii', 'ignore') for line in unicode_lines]
    f.close()
    return lines

def make_fixture(new_file_name, words_list):
    f = open('words.json')
    fixture_file = open(new_file_name,'a')
    num = 1
    for row in words_list:
        j, word = make_json(row, num)
        if j and word:
            fixture_file.write(j.encode('ascii', 'ignore'))
            print "Wrote %s, %r rows left" % (word, len(words_list)-num)
        num = num + 1
    f.close()
    fixture_file.close()
    return

def make_json(row, pk):
    columns = row.split(',')
    if len(columns) < 3:
        return None, None
    if columns[1][0] == ';':
        english = columns[1].split(';')[1]
    else:
        english = columns[1]

    json = """{
        "model":"pronounce_gaelic.ReferenceWord",
        "pk": %s,
        "fields" : {
            "english_usage": "%s",
            "word": "%s",
            "url": "%s"
        }
},\n""" % (pk, english, columns[0], columns[-1].rstrip())
    return json, english

def main():
    rows = make_rows(FILENAME)
    make_fixture(FIXTURENAME, rows)
    return



if __name__ == "__main__":
    main()