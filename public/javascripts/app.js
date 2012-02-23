
App.Router = Backbone.Router.extend({
    routes: {
        'editor': 'editor'
    },
    editor: function() {
        alert('things');
    }
});

var router = new App.Router();
$(document).on('click', 'a', function (ev) {
    var href = $(this).attr('href');
    router.navigate(href, true);
    ev.preventDefault();
});

Backbone.history.start({ pushState: true });