
module.exports = (app, db) ->
    app.get "/", (req, res) ->
        res.render "index", { title: "LuckyPicross" }