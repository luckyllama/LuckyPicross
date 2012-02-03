
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
            users.findOne({ userId: profile.id }).run(function (err, user) {
                if (err) {
                    throw new Error('Database findOne err.');
                }

                if (!user) {
                    user = new users();
                    user.userId = profile.id;
                    user.provider = profile.provider;
                    user.displayName = profile.provider;
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
        console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        users.findById(id, function (err, user) {
            done(err, user);
        });
    });

    function isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }

    var isInRole = function(role) {
        return function(req, res, next) {
            req.user.role == role
                ? next()
                // todo make auth specific error
                : next(new Error('You are forbidden to see this page.'));
        }
    }

    app.get('/login', function (req, res) {
        res.render('auth/login', { title: 'Login' });
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    app.get('/auth/google', passport.authenticate('google'));

    app.get('/auth/google/return',
        passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' })
    );

    app.get('/admin/users', function (req, res) {
        users.find({}, function (err, data) {
            res.render('auth/users', { title: 'Administer Users', users: data});
        });
    });

    app.get('/admin/user/:id', function (req, res) {
        users.findById(req.params.id, function (err, data) {
            if (err) {
                throw new Error('User ' + req.params.id + ' could not be found.');
            }
            data.remove();
            res.redirect('/admin/users');
        });
    });

    app.del('/admin/user/:id', function (req, res) {
        users.findById(req.params.id, function (err, data) {
            res.send({ success: true });
        })
    });

};
