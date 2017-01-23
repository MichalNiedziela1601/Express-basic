'use strict';

var express = require('express');
var authenticator = require('./authenticator');
var db = require('./db');

module.exports = function createApp()
{

    var app = express();
    // var validToken = new Date().getTime().toString();
    var postLength = 0;
    // authenticator.setValidToken(validToken);
    app.use(function (req, res, next)
    {
        var data = "";
        req.on('data', function (chunk)
        {
            data += chunk;
        });
        req.on('end', function ()
        {
            req.jsonBody = JSON.parse(data);
            next();
        })
    });

    app.use(function (req, res, next)
    {
        if (authenticator.authenticate(parseInt(req.header('authorization'),10))) {
            res.header('authorization', 'Bearer ' + parseInt(req.header('authorization'),10));
            next();
        }
        else {
            res.status(401);
            res.end();
        }
    });

    app.post('/dog', function (req, res)
    {

        var data = req.jsonBody;
        if(null == data.name || data.name.length == 0){
            res.status(400);
            res.end();
        } else {
            db.connect();
            db.save('dog', data).then(function (result)
            {
                res.status(200).send(result);
            })
                    .catch(function (err)
                    {
                        console.log(err);
                    });

            db.disconnect();
        }
    });

    app.get('/dog', function(req,res){

    });

    app.get('/', function (req, res)
    {
        res.end('Hello');
    });


    return app;
};
