

module.exports = function (app, db) {
    // NotFound errors
    app.error(function(err, req, res, next) {
        if (err instanceof NotFound) {
            res.header('Content-Type', 'text/html; charset=utf-8');
            res.render('error/404', { title: 'LuckyPicross 404: not found', status: 404, message: err.msg });
        } else {
            next(err);
        }
    });

// AuthError errors
    app.error(function(err, req, res, next) {
        if (err instanceof AuthError) {
            res.header('Content-Type', 'text/html; charset=utf-8');
            res.render('error/403', { title: 'LuckyPicross: forbidden', status: 403, message: err.msg });
        } else {
            next(err);
        }
    });
    // All other errors
    app.error(function(err, req, res, next){
        res.header('Content-Type', 'text/html; charset=utf-8');
        res.render('error/500', { title: 'LuckyPicross 500: Whoops!', status: 500, message: err.msg });
    });
};