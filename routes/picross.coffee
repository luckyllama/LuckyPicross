
module.exports = (app, db) ->

  games = require("../models/game").Games(db)

  app.get "/editor", (req, res) ->
    console.log req.xhr
    res.render "picross/editor", { title: "Puzzle Creator" }

  app.post "/editor", (req, res) ->
    console.log req.xhr

  app.get "/game", (req, res) ->
    res.render "picross/game", { title: "Picross" }
