const DefinationParser = require('./PARSER.js');

const WORDS = ['backdoor'];

const parser = new DefinationParser('test.json');

parser.fetchDefinationsFromWeb(WORDS);
