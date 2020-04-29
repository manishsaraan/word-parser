# Word Parser

## Plugin to parse word definations from web

### How to use:-

- Import plugin with require

```
const DefinationParser = require('./PARSER.js');
```

- Initialize class with name of json file to store definations, if not passed default **myjsonfile.json** will be used.

```
const parser = new DefinationParser('test.json');
```

- Pass array of words

```
parser.fetchDefinationsFromWeb(['cat', 'floor']);
```

Plugin will automatically saves the definations in given json file.

## How to run locally

- Clone repo with `https://github.com/manishsaraan/word-parser.git`
- Install required modules with `npm install`
- Create a new file and follow the instructions given above
