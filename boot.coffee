fs = require "fs"
express = require "express"
passport = require "passport"

exports.boot = (app, db) ->
  bootApplication app
  bootRoutes app, db

bootApplication = (app) ->
  app.configure ->
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use express.cookieParser()
    app.use express.session(secret: "luckyllama")
    # setup authentication
    app.use passport.initialize()
    app.use passport.session()
    app.use app.router
    app.use express.static(__dirname + "/public")
    # setup views
    app.set "views", __dirname + "/views"
    app.set "view engine", "jade"

  app.configure "development", ->
    app.use express.errorHandler(
      dumpExceptions: true
      showStack: true
    )

  app.configure "production", ->
    app.use express.errorHandler()

  app.dynamicHelpers
    user: (req, res) ->
      req.user

    currentUrl: (req, res) ->
      req.url

bootRoutes = (app, db) ->
  dir = __dirname + "/routes"
  fs.readdirSync(dir).forEach (file) ->
    require(dir + "/" + file) app, db