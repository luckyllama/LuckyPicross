
App.pageHasLoaded = false;

App.Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'editor': 'editor',
        'game/:id': 'game'
    },
    index: function () {
        this.loadContent('/');
    },
    editor: function() {
        this.loadContent('/editor', null, function () {
            var model = new App.Models.Game();
            var editor = new App.Views.PicrossEditor({ el: '.picross-game', model: model });
            editor.sizeView = new App.Views.PuzzleSize({ parent: editor, model: model });
            editor.detailsView = new App.Views.PuzzleDetails({ parent: editor, model: model });
        });
    },
    game: function (id) {
        this.loadContent('/game', { id: id }, function () {
            var Picross = App.module('Picross');
            var game = new Picross.View({ el: '.picross-game', game: { hash: 'dde5595655dde659565595655', maxTime: 3 } });
        });
    },
    loadContent: function (url, data, callback) {
        if (App.pageHasLoaded) {
            App.LoadingContent.on();
            $.ajax(url, { data: data })
                .success(function (data) {
                    $('.content').html(data);
                    App.LoadingContent.off();
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    }
});

var router = new App.Router();
Backbone.history.start({ pushState: true });

$(document).on('click', 'a.ajax', function (ev) {
    var href = $(this).attr('href');
    router.navigate(href, true);
    ev.preventDefault();
});

App.pageHasLoaded = true;