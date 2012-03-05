
mongoose = require("mongoose")
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

Game = new Schema(
    name:       { type: String, trim: true, index: true }
    hash:       { type: String, trim: true }
    lives:      { type: Number }
    maxTime:    { type: Number }
    height:     { type: Number }
    width:      { type: Number }
    pack:       { type: ObjectId, ref: 'Pack' }
    created:    { type: Date, default: Date.now }
)

mongoose.model "Game", Game

exports.Games = (db) ->
    db.model "Game"
