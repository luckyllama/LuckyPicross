
module.exports = (app, db) ->

    users = require("../models/user").Users db
    roles = require("../models/user").roles
    auth = require "../libs/auth-middleware"
    games = require("../models/game").Games db
    packs = require("../models/pack").Packs db

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
            
            ids = []
            ids.push id for id in [oldPackId, newPackId] when id
            console.log ids
            packs.find { _id: { $in: [oldPackId, newPackId] } }, (err, packs) ->
                console.log packs
                for pack in packs
                    if String(pack._id) is oldPackId
                        pack.games.remove(gameId);
                        pack.save()
                    if String(pack._id) is newPackId
                        pack.games.push(gameId)
                        pack.save()


            res.send success: true

    deleteGame = (req, res) ->
        games.findById req.params.id, (err, data) ->
            throw new Error("Game #{ req.params.id } could not be found.") if err

            data.remove() if data

            if req.method is "GET"
                res.redirect "/admin/games"
            else 
                res.send success: true

    app.get "/admin/game/:id/delete", auth.isLoggedIn, auth.isAdmin, deleteGame
    app.del "/admin/game/:id/delete", auth.isLoggedIn, auth.isAdmin, deleteGame

    app.get "/admin/packs", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        packs.find {}, (err, data) ->
            console.log data
            res.render "admin/packs"
                title: "administer packs"
                packs: data

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

    app.del "/admin/pack/:id/delete", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        packs.findById req.params.id, (err, data) ->
            throw new Error("Pack #{ req.params.id } could not be found.") if err

            data.remove() if data

            res.send success: true

