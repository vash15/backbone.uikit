
var search = module.exports = {};


search.splitWords = function splitWords(str, removeLastCharacter) {
	var i;
	var c;
	var len = str.length;
	var pattern = " ,;:<>_-!\"£$&/()=?^'[]{}";
	var quantityCharacters = 'aeious';
	var words = [''];
	var wordIndex = 0;
	var isCharacter;

	str = str.toLowerCase();

	for (var i = 0; i < len; i++) {
		c = str[i];
		isCharacter = pattern.indexOf(c) === -1;
		if (isCharacter) {
			words[wordIndex] += c;
		}
		if (removeLastCharacter && words[wordIndex].length > 5 && words[wordIndex].length < 24 && (!isCharacter || i == len - 1)) {
			// Elimina l'ultimo carattere per le parole più lunghe di 5 caratteri ed è una vocale
			// Es. "Ristorante" => "Ristorant"
			words[wordIndex] = words[wordIndex].substr(0, words[wordIndex].length - 1);
		}
		if (!isCharacter && words[wordIndex] != '') {
			wordIndex++;
			words[wordIndex] = '';
		}
	}

	if (words[wordIndex] == '')
		delete words[wordIndex];

	return words;
};


var _searchWordsCache = {};
search.words = function words(needle, haystack) {
	if (_searchWordsCache.needle != needle) {
		_searchWordsCache.needle = needle;
		_searchWordsCache.needleWords = search.splitWords(needle, true);
	}

	var needleWords = _searchWordsCache.needleWords;
	var i;
	var len = needleWords.length;
	var found = true;
	var str = haystack.toLowerCase();

	for (i = 0; i < len && found; i++) {
		found = str.indexOf(needleWords[i]) > -1;
	}

	return found;
};


// Test
/*
var str = 'bar Ristorante Da Pino';
console.log(search.splitWords(str));
console.log('cerca %s', 'bar', search.words('bar', str));
console.log('cerca %s', 'Foo', search.words('Foo', str));
console.log('cerca %s', 'rist', search.words('rist', str));
console.log('cerca %s', 'pino', search.words('pino', str));
console.log('cerca %s', 'Da pino', search.words('Da pino', str));
console.log('cerca %s', 'Ristorante da pino', search.words('Ristorante da pino', str));
console.log('cerca %s', 'bar da pino', search.words('bar da pino', str));
console.log('cerca %s', 'bar pino', search.words('bar pino', str));
console.log('cerca %s', 'foo pino', search.words('foo pino', str));
*/
