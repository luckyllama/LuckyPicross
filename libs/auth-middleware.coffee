
roles = require("../models/user").roles

exports.isLoggedIn = (req, res, next) ->
    return next() if req.isAuthenticated()
    returnUrl = "?return=" + (if req.method is "GET" then req.url or "/" else "/")
    res.redirect "/login#{ returnUrl }"

exports.isAdmin = (req, res, next) ->
    return next() if req.user.role is roles.admin
    next new Error "You are forbidden to see this page."