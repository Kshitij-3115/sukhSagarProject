"use strict";

var express = require('express');

var router = require('./routers.js');

var http = require('http'); //init app


var app = express(); // const httpServer = http.createServer(app); 

var port = process.env.PORT || 3000; //set up views --> 

app.set('view engine', 'pug'); //serve static assets --> 

app.use(express["static"]('./public'));
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/signup', function (req, res) {
  res.render('signup');
});
app.use('/form', router);
app.use('/user', router); //start server -> 

var server = app.listen(port, function () {
  console.log("server is up on port number ".concat(port)); //server started! 
});
server.on('clientError', function (err, socket) {
  console.log(err);
});