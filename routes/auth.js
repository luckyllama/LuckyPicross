
module.exports = function (app, db) {

    var users = require('../models/user').Users(db);

    var passport = require('passport')
        , GoogleStrategy = require('passport-google').Strategy;

    var roles = { admin: 'admin', member: 'member' };

    passport.use(new GoogleStrategy({
            returnURL: 'http://localhost:3000/auth/google/return',
            realm: 'http://localhost:3000/'
        },
        function(identifier, profile, done) {
            users.findOne({ userId: identifier }).run(function (err, user) {
                if (err) {
                    throw new Error('Database findOne err.');
                }
                if (!user) {
                    user = new users();
                    user.userId = identifier;
                    user.provider = 'google';
                    user.displayName = profile.displayName;
                    user.name = profile.name;
                    user.emails = profile.emails;
                    user.role = roles.member;
                    user.save()
                }

                done(err, user);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        users.findById(id, function (err, user) {
            if (!user) { done(err, null); }
            done(err, user);
        });
    });

    var isLoggedIn = function (req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        var returnUrl = '?return=' + (req.method === 'GET' ? req.url || '/' : '/');
        res.redirect('/login' + returnUrl)
    }

    var isAdmin = function(req, res, next) {
        if (req.user.role === roles.admin) { return next(); }
        return next(new Error('You are forbidden to see this page.'));
    }

    app.get('/login', function (req, res) {
        req.session.returnUrl = req.param('return') || '/';
        res.render('auth/login', { title: 'Login' });
    });

    app.get('/logout', function(req, res){
        var returnUrl = req.param('return') || '/';
        req.logout();
        res.redirect(returnUrl);
    });

    app.get('/auth/google', function (req, res, next) {
        req.session.returnUrl = req.param('return') || req.session.returnUrl || '/';
        passport.authenticate('google')(req, res, next);
    });

    app.get('/auth/google/return', function (req, res, next) {
        var returnUrl = req.session.returnUrl || '/';
        passport.authenticate('google', {
            successRedirect: function() {
                req.session.returnUrl = null;
                return returnUrl;
            }(),
            failureRedirect: '/login' }
        )(req, res, next);
    });

    app.get('/admin/users', isLoggedIn, isAdmin, function (req, res) {
        users.find({}, function (err, data) {
            res.render('auth/users', { title: 'Administer Users', users: data, roles: roles});
        });
    });

    var deleteUser = function (req, res) {
        users.findById(req.params.id, function (err, data) {
            if (err) {
                throw new Error('User ' + req.params.id + ' could not be found.');
            }
            if (data) {
                data.remove();
            }
            if (req.method === 'GET') {
                res.redirect('/admin/users');
            } else {
                res.send({ success: true });
            }
        });
    };

    app.get('/admin/user/:id', isLoggedIn, isAdmin, deleteUser);

    app.del('/admin/user/:id', isLoggedIn, isAdmin, deleteUser);

    app.post('/admin/user/:id', isLoggedIn, isAdmin, function (req, res) {
        var role = req.body.role || roles.member;
        users.update({ _id: req.params.id }, { role: role }, { multi: false }, function (err) {
            if (err) {
                throw new Error('User ' + req.params.id + ' could not be found.');
            }
            res.send({ success: true });
        });
    });

};
