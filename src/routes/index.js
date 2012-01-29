
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.editor = function(req, res) {
  res.render('game/editor', { title: 'Puzzle Creator' });  
};