var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
    const fs = require('fs');
    const path = require('path');
    const Flowpipe = require('flowpipe');
    const say = require('say');
    const entities = require("entities");

    let worker = Flowpipe.instance('stt');

    worker
        .then((args)=> new Promise((resolve)=> {
            let list = fs.readFileSync(path.resolve(__dirname, '..', 'dataset.txt'), 'utf-8').split('\n');
            let read = list[Math.round(Math.random() * list.length)];
            resolve({read: read});
        }))
        .then('readme', (args)=> new Promise((resolve)=> {
            let {read, index} = args;
            read = entities.decodeHTML(read);
            read = read.replace(/[^(가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9.)]/gi, ' ');

            res.send({status: true, data: read});
            say.speak(read, null, null, ()=> setTimeout(resolve, 3000));
        }))
        .run();
});

module.exports = router;