var request = require("request");
const jsdom = require("jsdom");
const async = require("async");
const { JSDOM } = jsdom;

const fs = require("fs"); 
const path = require("path");
const WORDS = ['backdoor', "tree", "mobile", "hung", "wind"];

class FetchDefinations {
    parse(url) {
        return new Promise( (resolve, reject) => {
            request(url, function (error, response, body) { 
               if(error){
                   reject(error)
               }else{
                   resolve(body)
               }
            });
        })
    }

    async getDefinations(WORD, cb) {
        let audio, def = "";
    
        const body =  await this.parse("https://www.dictionary.com/browse/"+WORD);
        const pageDom = new JSDOM(body);
        const audioNode = pageDom.window.document.querySelector("#top-definitions-section audio");
    
        if(audioNode){
          audio = audioNode.querySelectorAll("source")[1].src;
        }
    
        var allDefFetched = false;
        var i = 1;
        var definationsv = [];
    
        while(!allDefFetched){
        var defNode =  pageDom.window.document.querySelector(`[value='${i}']`);
    
        if(!defNode || i > 5){
            allDefFetched = true;
        }else{
            def = this.readNodeDefinations(defNode);
            definationsv.push(def);
        }
    
        i++;
        }
    
        cb({def:definationsv,audio});
    }

    updateDataInFile(wordDefinations) {
        if (fs.existsSync(path.join(__dirname + "/myjsonfile.json"))) {
            fs.readFile('./myjsonfile.json', 'utf8', function(err, data){
                if (err){
                    console.log('error',err);
                } else {    
                const obj = JSON.parse(data); //now it an object
                console.log(obj.length)
                const newd = [...obj, ...wordDefinations]; //add some data
                console.log(newd.length)
                fs.writeFile('myjsonfile.json', JSON.stringify(newd), 'utf8', (err)=>console.log(err)); // write it back 
               
            }});
        }else{
           fs.writeFile('myjsonfile.json', JSON.stringify(wordDefinations), 'utf8', (err)=>console.log(err));
        }
    }

    fetchDefinationsFromWeb(words) {
        const wordDefinations = [];
        async.forEach(words, (WORD, callback) => { 
            (async () => {
            console.log('fetching for word: '+ WORD) // print the key
    
                await this.getDefinations(WORD, (getDefinations) => {
                    const defJson = {
                        [`${WORD}`]: getDefinations
                    };
                    wordDefinations.push(defJson);                
                    callback()   
                        
                })
            })();
    
    
        }, (err, result) => {
            console.log('iterating done',wordDefinations);
            this.updateDataInFile(wordDefinations);
        });  
    }
    
    parseNodeContent(node){
        var isExample = node.querySelector(".luna-example");
        if(isExample){
           var textContent = node.textContent;
           return {
               def:textContent.split(":")[0],
               example: isExample.textContent
            }
        }else{
         return {
              def: node.textContent
         }
        }
    }    
    
    readNodeDefinations(defNode) {
        var isAlternativeDef = defNode.querySelector("ol");
    
        if(isAlternativeDef){
            var alternativeWord = defNode.querySelector(".one-click-content").textContent;
            var allDeffinations = isAlternativeDef.querySelectorAll(".one-click-content");
            var definations = Array.from(allDeffinations).map(node => this.parseNodeContent(node));
            return {
                isAlt: true,
                defination: {
                  [`${alternativeWord}`] : definations
                }
            }
        }else{
            var allDeffinations = defNode.querySelectorAll(".one-click-content");
            var definations = Array.from(allDeffinations).map(node => {
              return this.parseNodeContent(node);
            });
      
            return { 
                isAlt: false,
                defination: definations[0]
            } 
        }
    }

}

new FetchDefinations().fetchDefinationsFromWeb(WORDS);
