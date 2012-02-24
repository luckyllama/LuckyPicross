
App.Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'editor': 'editor'
    },
    index: function () {
        this.localContent('/');
    },
    editor: function() {
        this.loadContent('/editor');
    },
    loadContent: function (url) {
        $.ajax(url)
            .success(function (data) {
                $('.content').html(data);
            });
    }
});

var router = new App.Router();
$(document).on('click', 'a', function (ev) {
    var href = $(this).attr('href');
    router.navigate(href, true);
    ev.preventDefault();
});

Backbone.history.start({ pushState: true });