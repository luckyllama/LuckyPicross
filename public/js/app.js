
App.pageHasLoaded = false;

App.Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'packs': 'packs',
        'pack/:id': 'pack',
        'editor': 'editor',
        'game/:id': 'game'
    },
    index: function () {
        this.loadContent('/');
    },
    packs: function () {
        this.loadContent('/packs');
    },
    pack: function (id) {
        this.loadContent('/pack/' + id);
    },
    editor: function() {
        this.loadContent('/editor', null, function () {
            var model = new App.Models.Game();
            var editor = new App.Views.PicrossEditor({ el: '.picross-game', model: model });
            editor.sizeView = new App.Views.PuzzleSize({ parent: editor, model: model });
            editor.detailsView = new App.Views.PuzzleDetails({ parent: editor, model: model });
            editor.render();
        });
    },
    game: function (id) {
        this.loadContent('/game/' + id, null, function () {
            var $game = $('.picross-game');
            console.log($game.data());
            var model = new App.Models.Game($game.data());
            var game = new App.Views.PicrossGame({ el: '.picross-game', model: model });
            game.render();
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