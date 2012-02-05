
var mongoose = require('mongoose');

var Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId;

var Name = new Schema();

var Email = new Schema({
    value:      { type: String },
    type:       { type: String }
});

var User = new Schema({
    id:          { type: ObjectId, index: true },
    provider:    { type: String },
    userId:      { type: String, index: true },
    displayName: { type: String },
    name:        {
        familyName:     { type: String },
        givenName:      { type: String },
        middleName:     { type: String }
    },
    emails:      { type: [Email] },
    role:        { type: String }
});

mongoose.model('User', User);

exports.Users = function (db) {
    return db.model('User');
};