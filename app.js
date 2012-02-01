
/**
 * Module dependencies.
 */

var express = require('express'),
    mongoose = require('mongoose');

var app = module.exports = express.createServer();
var db =  mongoose.connect('mongodb://localhost/luckypicross');

require('./boot.js').boot(app, db);

var port = process.env.PORT || 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
