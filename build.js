var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function map(data){
    return _.mapValues(data, traverse)
}

function traverse(obj, key){
    if(typeof obj !== 'object'){
        if(obj.indexOf && obj.indexOf('node_modules') > -1){
            let oldPath = obj;
            var filename = '/dist/' + obj.replace(/\//g, '.');
            obj = filename;
            console.log(fs.existsSync(__dirname + oldPath))
            fs.copyFileSync(__dirname + oldPath, __dirname + obj);
            console.log(`${obj} copied`)
        }

        return obj
    } else {
        return map(obj)
    }
}


fs.readFile('.manifest.json' , "utf8", function(err, d) {
    var data = JSON.parse(d);

    console.log( JSON.stringify(map(data), null,'\t'))

    fs.writeFileSync('manifest2.json', JSON.stringify(map(data), null,'\t'))
});