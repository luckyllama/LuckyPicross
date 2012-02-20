
module.exports = (app, db) ->
  
  users = require("../models/user").Users db

  passport = require "passport"
  GoogleStrategy = require("passport-google").Strategy
  roles =
    admin: "admin"
    member: "member"

  passport.use new GoogleStrategy(
    returnURL: "http://localhost:3000/auth/google/return"
    realm: "http://localhost:3000/"
  , (identifier, profile, done) ->
    users.findOne(userId: identifier).run (err, user) ->
      throw new Error "Database findOne err." if err

      unless user
        user = new users()
        user.userId = identifier
        user.provider = "google"
        user.displayName = profile.displayName
        user.name = profile.name
        user.emails = profile.emails
        user.role = roles.member
        user.save()

      done err, user
  )

  passport.serializeUser (user, done) ->
    done null, user._id

  passport.deserializeUser (id, done) ->
    users.findById id, (err, user) ->
      done err, null unless user
      done err, user

  isLoggedIn = (req, res, next) ->
    return next() if req.isAuthenticated()
    returnUrl = "?return=" + (if req.method is "GET" then req.url or "/" else "/")
    res.redirect "/login#{ returnUrl }"

  isAdmin = (req, res, next) ->
    return next() if req.user.role is roles.admin
    next new Error "You are forbidden to see this page."

  app.get "/login", (req, res) ->
    req.session.returnUrl = req.param("return") or "/"
    res.render "auth/login",
      title: "Login"

  app.get "/logout", (req, res) ->
    returnUrl = req.param("return") or "/"
    req.logout()
    res.redirect returnUrl

  app.get "/auth/google", (req, res, next) ->
    req.session.returnUrl = req.param("return") or req.session.returnUrl or "/"
    passport.authenticate("google") req, res, next

  app.get "/auth/google/return", (req, res, next) ->
    returnUrl = req.session.returnUrl or "/"
    passport.authenticate("google",
      successRedirect: do ->
        req.session.returnUrl = null
        returnUrl
      failureRedirect: "/login"
    ) req, res, next

  app.get "/admin/users", isLoggedIn, isAdmin, (req, res) ->
    users.find {}, (err, data) ->
      res.render "auth/users",
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

  app.get "/admin/user/:id", isLoggedIn, isAdmin, deleteUser
  
  app.del "/admin/user/:id", isLoggedIn, isAdmin, deleteUser

  app.post "/admin/user/:id", isLoggedIn, isAdmin, (req, res) ->
    role = req.body.role or roles.member
    users.update { _id: req.params.id }, { role: role }, { multi: false }
    , (err) ->
      throw new Error("User #{ req.params.id } could not be found.") if err
      res.send success: true
