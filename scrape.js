var page = require('webpage').create(), 
    system = require('system'),
    fs = require('fs');

var word = system.args[1]
var filename = './phantom_pages/'+word+'.txt';

url = 'http://www.learngaelic.net/dictionary/?abairt='+word 
page.open(url, function(status) {
	fs.write(filename, page.content, 'w'); // Write the page to the local file.
	phantom.exit(); // exit PhantomJs
});
