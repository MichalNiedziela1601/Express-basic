'use strict';

var express = require('express');
var authenticator = require('./authenticator');
var db = require('./db');

module.exports = function createApp() {

    var app = express();
    var validToken = new Date().getTime().toString();
    authenticator.setValidToken(validToken);
    app.use(function(req, res, next){
        var data = "";
        req.on('data', function(chunk){ data += chunk});
        req.on('end', function(){
            req.rawBody = data;
            req.jsonBody = JSON.parse(data);
            next();
        })
    });

    app.use(function(req,res,next){
        res.header('authorization', 'Bearer '+ validToken);
        next();
    });

    app.post('/dog', function(req,res){
        var data = req.jsonBody;
        db.connect();
        var result = db.save('dog',data).then(function (data)
        {
            return data;
        });
        db.disconnect();

        res.status(201).json(result);
    });

    app.get('/', function (req, res)
    {
        res.end('Hello');
    });



    return app;
};
