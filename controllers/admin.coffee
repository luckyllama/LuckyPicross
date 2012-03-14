
module.exports = (app, db) ->

    users = require("../models/user").Users db
    roles = require("../models/user").roles
    auth = require "../libs/auth-middleware"
    games = require("../models/game").Games db
    packs = require("../models/pack").Packs db
    ObjectId = require("mongoose").Types.ObjectId

    app.get "/admin/users", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        users.find {}, (err, data) ->
            res.render "admin/users",
                title: "administer users"
                users: data
                roles: roles

    deleteUser = (req, res) ->
        users.findById req.params.id, (err, data) ->
            throw new Error("User #{ req.params.id } could not be found.") if err
      
            data.remove() if data

            if req.method is "GET"
                res.redirect "/admin/users"
            else
                res.send success: true

    app.get "/admin/user/:id/delete", auth.isLoggedIn, auth.isAdmin, deleteUser
    app.del "/admin/user/:id/delete", auth.isLoggedIn, auth.isAdmin, deleteUser

    app.post "/admin/user/:id", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        role = req.body.role or roles.member
        users.update { _id: req.params.id }, { role: role }, { multi: false }, (err) ->
            throw new Error("User #{ req.params.id } could not be found.") if err
            res.send success: true

    app.get "/admin/games", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        games.find {}, (err, games) ->
            packs.find {}, ['_id', 'name'], (err, packs) ->
                res.render "admin/games"
                    title: "administer games"
                    games: games
                    packs: packs

    app.post "/admin/game/:id/update-pack", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        gameId = req.params.id
        newPackId = req.body.packId or null
        games.findById gameId, (err, game) ->
            throw new Error "Could not find game #{ gameId }." if err or not game 
            
            oldPackId = if game.pack then game.pack + '' else null
            game.pack = newPackId;
            game.save()

            if newPackId
                packs.update { _id: newPackId }, { $addToSet: { games: gameId } }, (err) ->
                    throw new Error "Could not add game to pack #{ newPackId }" if err
            if oldPackId
                packs.findById oldPackId, (err, pack) ->
                    pack.games.remove gameId
                    pack.save()

            res.send success: true, name: game.name

    deleteGame = (req, res) ->
        games.findById req.params.id, (err, game) ->
            throw new Error "Game #{ req.params.id } could not be found." if err

            if game
                if game.pack?
                    packs.findById game.pack, (err, pack) -> 
                        pack.games.remove(game._id) if pack
                        pack.save()
                game.remove()

            if req.method is "GET"
                res.redirect "/admin/games"
            else 
                res.send success: true, name: game.name

    app.get "/admin/game/:id/delete", auth.isLoggedIn, auth.isAdmin, deleteGame
    app.del "/admin/game/:id/delete", auth.isLoggedIn, auth.isAdmin, deleteGame

    app.get "/admin/packs", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        packs.find {}, (err, packs) ->
            res.render "admin/packs"
                title: "administer packs"
                packs: packs

    app.put "/admin/pack/create", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        if not req.body.name or req.body.name.trim().length <= 0 
            res.send
                success: false
                message: "A pack must have a name."
            return;

        packs.findOne(name: req.body.name).run (err, pack) ->
            throw new Error "Database findOne err." if err

            if pack
                res.send
                    success: false
                    message: "A pack with that name already exists."
                return;
            else 
                pack = new packs()
                pack.name       = req.body.name
                pack.isActive   = true
                pack.games      = []
                pack.created    = new Date()
                pack.save()

                res.send
                    success: true
                    value: pack

    app.post "/admin/pack/:id/activate", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        packs.update { _id: req.params.id }, { isActive: req.body.isActive == true.toString() }, (err) ->
            throw new Error "Pack #{ req.params.id } could not be updated." if err
            
            res.send success: true

    app.del "/admin/pack/:id/delete", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        packs.findById req.params.id, (err, pack) ->
            throw new Error "Pack #{ req.params.id } could not be found." if err

            games.update { pack: pack._id }, { pack: null }, { multi: true }, (err) ->
                throw new Error "Error delete game<->pack association." if err

            pack.remove() if pack

            res.send success: true, name: pack.name

