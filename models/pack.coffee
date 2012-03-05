
mongoose = require("mongoose")
Schema = mongoose.Schema
ObjectId = Schema.ObjectId

Pack = new Schema(
    name:       { type: String, trim: true, index: true }
    games:      [{ type: ObjectId, ref: 'Game' }]
    created:    { type: Date, default: Date.now }
)

mongoose.model "Pack", Pack

exports.Packs = (db) ->
    db.model "Pack"