
module.exports = (app, db) ->
  
  users = require("../models/user").Users db
  roles = require("../models/user").roles
  auth = require "../libs/auth-middleware"

  passport = require "passport"
  GoogleStrategy = require("passport-google").Strategy

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

  app.get "/login", (req, res) ->
    req.session.returnUrl = req.param("return") or "/"
    res.render "admin/login",
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
