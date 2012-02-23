
module.exports = (app, db) ->

  games = require("../models/game").Games(db)

  app.get "/editor", (req, res) ->
    res.render "picross/editor", { title: "Puzzle Creator" }

  app.post "/editor", (req, res) ->

  app.get "/game", (req, res) ->
    res.render "picross/game", { title: "Picross" }
