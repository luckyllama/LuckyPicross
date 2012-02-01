
var games = require('../models/game').Games(db);

app.get('/editor', function(req, res) {
    res.render('game/editor', { title: 'Puzzle Creator' });
});

app.post('/editor', function(req, res) {

});

