
express = require "express"
mongoose = require "mongoose"

app = module.exports = express.createServer()
db = mongoose.connect "mongodb://localhost/luckypicross"

require("./boot").boot app, db
port = process.env.PORT or 3000

app.listen port

console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env