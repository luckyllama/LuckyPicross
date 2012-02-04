
var fs = require('fs'),
    express = require('express'),
    passport = require('passport');

exports.boot = function (app, db) {
    bootApplication(app);
    bootRoutes(app, db);
};

var bootApplication = function (app) {
    app.configure(function (){
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'luckyllama' }));
        // authentication
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(app.router);
        app.use(express.static(__dirname + '/public'));

        // setup views
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.set('view options', { layout: false });
    });

    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });

    app.dynamicHelpers({
        user: function(req, res){
            return req.user;
        },
        currentUrl: function (req, res) {
            return req.url;
        }
    });
}

var bootRoutes = function (app, db) {
    var dir = __dirname + '/routes';
    fs.readdirSync(dir).forEach(function (file) {
        require(dir + '/' + file)(app, db);
    });
};