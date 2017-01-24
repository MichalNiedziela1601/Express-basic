'use strict';

var express = require('express');
var authenticator = require('./authenticator');
var db = require('./db');

module.exports = function createApp()
{

    var app = express();
    // db.connect();
    // authenticator.setValidToken('12');

    function byteCount(s)
    {
        return encodeURI(s).split(/%..|./).length - 1;
    }

    app.use(express.static('public'));
    app.use(function (req, res, next)
    {
        var tHeader = req.header('authorization');
        if (tHeader) {
            var token = tHeader.substr(7);
        }
        if (authenticator.authenticate(token)) {
            res.header('authorization', 'Bearer ' + token);
            next();
        } else {
            res.status(401);
            res.end();
        }
    });

    app.use(function (req, res, next)
    {
        if (req.method === 'GET') {
            next();
        } else {
            var data = "";
            req.on('data', function (chunk)
            {
                data += chunk;
            });

            req.on('end', function ()
            {
                if (byteCount(data) > 70) {
                    res.sendStatus(413);
                } else {
                    req.jsonBody = JSON.parse(data);
                    next();
                }
            });
        }

    });


    app.post('/dog', function (req, res)
    {

        var data = req.jsonBody;
        if (null == data.name || data.name.length == 0 || data.name.length > 10 || typeof data.owner === 'number' || data.createDate < 0) {
            res.status(400);
            res.end();
        } else {

            db.save('dog', data).then(function (result)
            {
                res.status(200).send(result);
            })
                    .catch(function (err)
                    {
                        if (err === 'No connection') {
                            res.status(500);
                            res.end();
                        } else if (err === 'Entity not found') {
                            res.status(404);
                            res.end();
                        }
                    });

        }
    });


    app.get('/dog/:id', function (req, res)
    {
        var id = req.params.id;
        db.get('dog', id)
                .then(function (result)
                {
                    res.status(200).send(result)
                })
                .catch(function (err)
                {
                    if (err === 'No connection') {
                        res.status(500);
                        res.end();
                    } else if (err === 'Entity not found') {
                        res.status(404);
                        res.end();
                    }
                });
    });

    app.get('/hound/:id', function (req, res)
    {
        var id = req.params.id;
        res.statusCode = 302;
        res.setHeader('Location', '/dog/' + id);
        res.end();

    });



    return app;
};
