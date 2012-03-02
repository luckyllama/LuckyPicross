
module.exports = (app, db) ->

    games = require("../models/game").Games(db)

    app.get "/editor", (req, res) ->
        res.render "picross/editor", { title: "Puzzle Creator" }

    app.post "/editor", (req, res) ->
        gameData = 
            name:       req.body.name
            hash:       req.body.hash
            lives:      req.body.lives
            maxTime:    req.body.maxTime
            height:     req.body.height
            width:      req.body.width
        game = new games gameData
        game.save (error, data) ->
            if error
                res.json(error)
            else 
                res.json(data)

    app.get "/game/:id", (req, res) ->
        res.render "picross/game", { title: "Picross" }
