
module.exports = (app, db) ->

    users = require("../models/user").Users db
    roles = require("../models/user").roles
    auth = require "../libs/auth-middleware"
    games = require("../models/game").Games db

    app.get "/admin/users", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        users.find {}, (err, data) ->
            res.render "admin/users",
                title: "Administer Users"
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

    app.get "/admin/user/:id", auth.isLoggedIn, auth.isAdmin, deleteUser
  
    app.del "/admin/user/:id", auth.isLoggedIn, auth.isAdmin, deleteUser

    app.post "/admin/user/:id", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        role = req.body.role or roles.member
        users.update { _id: req.params.id }, { role: role }, { multi: false }
            , (err) ->
            throw new Error("User #{ req.params.id } could not be found.") if err
            res.send success: true

    app.get "/admin/games", auth.isLoggedIn, auth.isAdmin, (req, res) ->
        games.find {}, (err, data) ->
            res.render "admin/games"
                title: "Administer Games"
                games: data