


var Picross = (function ($) {

    var defaults = {
        editorMode: false,
        boardWidth: 10,
        boardHeight: 10
    };

    var picross = Class.extend({
        init: function (canvasSelector, options) {
            this.options = $.extend({}, defaults, options);

            this.gameState = new gameState(options.boardWidth, options.boardHeight, );

            var canvas = $(canvasSelector).get(0);
            this.context = canvas.getContext("2d");
            render();
        },
        render: function () {

        }
    });

    var gameState = Class.extend({
        init: function (width, height, board) {
            this.width = width;
            this.height = height;
            this.board = board;
        }
    });

    return picross;
})(jQuery);