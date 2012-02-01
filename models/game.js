
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;


var Game = new Schema({
    name:       { type: String, index: true },
    board:      { type: String }
});

mongoose.model('Game', Game);

exports.Games = function (db) {
    return db.model('Game');
};