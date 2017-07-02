const port = 3000;
const http2 = require('spdy');
const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('morgan');
const app = express();

const options = {
    key: fs.readFileSync(__dirname + '/tls/fake.key'),
    cert: fs.readFileSync(__dirname + '/tls/fake.crt'),
};

app.use(logger('dev'));

app.get('/', (req, res) => {
    res.send(`hello, http2! goto /pushy`);
});

app.get('/pushy', (req, res) => {
    var stream = res.push('/main.js', {
        status: 200,
        method: 'GET',
        request: {
            accept: '*/*'
        },
        response: {
            'content-type': 'application/javascript'
        }
    });

    stream.on('error', () => {
        console.log('an error occured');
    });

    stream.end('alert("hello from push stream!");');

    res.end(`<script stc="main.js"></script>`);
});

app.get('*', (req, res) => {
    res
        .status(200)
        .json({message: 'ok'});
});


http2
    .createServer(options, app)
    .listen(port, (error) => {
        if(error) {
            console.error(error);
            return process.exit(1);
        } else {
            console.log(`Listening on port: ${port}.`);
        }
    });