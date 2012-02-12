
module.exports = function (app, db) {

    var games = require('../models/game').Games(db);

    app.get('/editor', function(req, res) {
        res.render('picross/editor', { title: 'Puzzle Creator' });
    });

    app.post('/editor', function(req, res) {

    });

    app.get('/game', function (req, res) {
    	res.render('picross/game', { title: 'Picross'});
    })

};

