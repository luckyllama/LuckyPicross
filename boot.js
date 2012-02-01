
var fs = require('fs'),
    express = require('express'),
    vm = require('vm');

exports.boot = function (app, db) {
    bootApplication(app);
    bootRoutes(app, db);
};

var bootApplication = function (app) {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'luckyllama' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    // setup views
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });

    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });

    app.configure('production', function(){
        app.use(express.errorHandler());
    });
};

var bootRoutes = function (app, db) {
    var dir = __dirname + '/routes';
    fs.readdirSync(dir).forEach(function(file){
        var str = fs.readFileSync(dir + '/' + file, 'utf8');
        var context = { app: app, db: db };
        for (var key in global) context[key] = global[key];
        vm.runInNewContext(str, context, file);
    });
};