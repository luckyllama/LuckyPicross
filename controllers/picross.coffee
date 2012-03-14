
module.exports = (app, db) ->

    games = require("../models/game").Games(db)
    packs = require("../models/pack").Packs(db)

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
        games.findById req.params.id, (err, game) ->
            throw new Error("Game #{ req.params.id } could not be found.") if err

            res.render "picross/game", { title: "Picross", game: game }

    app.get "/pack/:id", (req, res) ->
        packs.findById(req.params.id).populate('games').run (err, pack) ->
            throw new Error "Could not retrieve pack #{ req.params.id }." if err

            res.render "picross/pack", { title: "#{pack.name} pack", pack: pack }

    app.get "/packs", (req, res) ->
        packs.find { isActive: true }, (err, packs) ->
            throw new Error "Could not retrieve active packs." if err

            res.render "picross/packs", { title: "packs", packs: packs }