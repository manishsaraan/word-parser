const request = require('request');
const jsdom = require('jsdom');
const async = require('async');
const fs = require('fs');
const path = require('path');

const { JSDOM } = jsdom;

class DefinationParser {
  async getDefinations(WORD, cb) {
    let audio; let
      def = '';

    const body = await this.parse(`https://www.dictionary.com/browse/${WORD}`);
    const pageDom = new JSDOM(body);
    const audioNode = pageDom.window.document.querySelector('#top-definitions-section audio');

    if (audioNode) {
      audio = audioNode.querySelectorAll('source')[1].src;
    }

    let allDefFetched = false;
    let i = 1;
    const definationsv = [];

    while (!allDefFetched) {
      const defNode = pageDom.window.document.querySelector(`[value='${i}']`);

      if (!defNode || i > 5) {
        allDefFetched = true;
      } else {
        def = this.readNodeDefinations(defNode);
        definationsv.push(def);
      }

      i += 1;
    }

    cb({ def: definationsv, audio });
  }

  parse(url) {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  updateDataInFile(wordDefinations) {
    if (fs.existsSync(path.join(`${__dirname}/myjsonfile.json`))) {
      fs.readFile('./myjsonfile.json', 'utf8', (err, data) => {
        if (err) {
          console.log('error', err);
        } else {
          const obj = JSON.parse(data); // now it an object
          console.log(obj.length);
          const newd = [...obj, ...wordDefinations]; // add some data
          console.log(newd.length);
          fs.writeFile('myjsonfile.json', JSON.stringify(newd), 'utf8', (error) => console.log(error)); // write it back
        }
      });
    } else {
      fs.writeFile('myjsonfile.json', JSON.stringify(wordDefinations), 'utf8', (error) => console.log(error));
    }
  }

  fetchDefinationsFromWeb(words) {
    const wordDefinations = [];
    async.forEach(words, (WORD, callback) => {
      (async () => {
        console.log(`fetching for word: ${WORD}`); // print the key

        await this.getDefinations(WORD, (getDefinations) => {
          const defJson = {
            [`${WORD}`]: getDefinations,
          };
          wordDefinations.push(defJson);
          callback();
        });
      })();
    }, () => {
      console.log('iterating done', wordDefinations);
      this.updateDataInFile(wordDefinations);
    });
  }

  parseNodeContent(node) {
    const isExample = node.querySelector('.luna-example');
    if (isExample) {
      const { textContent } = node;
      return {
        def: textContent.split(':')[0],
        example: isExample.textContent,
      };
    }
    return {
      def: node.textContent,
    };
  }

  readNodeDefinations(defNode) {
    const isAlternativeDef = defNode.querySelector('ol');

    let allDeffinations; let
      definations;

    if (isAlternativeDef) {
      const alternativeWord = defNode.querySelector('.one-click-content').textContent;
      allDeffinations = isAlternativeDef.querySelectorAll('.one-click-content');
      definations = Array.from(allDeffinations).map((node) => this.parseNodeContent(node));
      return {
        isAlt: true,
        defination: {
          [`${alternativeWord}`]: definations,
        },
      };
    }
    allDeffinations = defNode.querySelectorAll('.one-click-content');
    definations = Array.from(allDeffinations).map((node) => this.parseNodeContent(node));

    return {
      isAlt: false,
      defination: definations[0],
    };
  }
}

module.exports = DefinationParser;
