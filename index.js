const DefinationParser = require('./PARSER.js');

const WORDS = ['backdoor', 'tree', 'mobile', 'hung', 'wind'];

new DefinationParser().fetchDefinationsFromWeb(WORDS);
