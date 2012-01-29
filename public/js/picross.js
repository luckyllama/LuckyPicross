///<reference path="lib/jquery-1.7.1.js"/>
///<reference path="base.js"/>

var Picross = (function ($) {

    var defaults = {
        editorMode: false,
        width: 10,
        height: 10,
        debugMode: false
    };

    var picross = Class.extend({
        init: function (gameSelector, options) {
            this.options = $.extend({}, defaults, options);

            this.gameState = new gameState(this.options.width, this.options.height, "");

            this.$game = $(gameSelector);
            this.render();
            this.bindEvents();
        },
        render: function () {
            this.$game.addClass("size-" + this.options.width + "-" + this.options.height);
            $(".board", this.$game).append(createBoardTable(this.options.height, this.options.width));
            $(".top.hints", this.$game).append(createTopHintsTable(this.options.width));
            $(".side.hints", this.$game).append(createSideHintsTable(this.options.height));
        },
        bindEvents: function () {
            this.$game.on("hover.picross", "td", function () {
                var data = $(this).data();
                if (data && typeof data.col !== "undefined") {
                    $(".col-" + data.col, this.$game).toggleClass("hover");
                }
                if (data && typeof data.row !== "undefined") {
                    $(".row-" + data.row, this.$game).toggleClass("hover");
                }
            });
        },

        log: function () {
            if (this.options.debugMode) {
                try {
                    var args = Array.prototype.slice.call(arguments);
                    window.console.debug.apply(window.console, args);
                } catch (e) { }
            }
        }
    });

    var createBoardTable = function (height, width) {
        var $table = $("<table>");
        for (var rowIndex = 0; rowIndex < height; rowIndex++) {
            var $row = $("<tr>").addClass("row-" + rowIndex);
            for (var colIndex = 0; colIndex < width; colIndex++) {
                $("<td>")
                    .addClass("col-" + colIndex + " row-" + rowIndex)
                    .data({ col: colIndex, row: rowIndex })
                    .appendTo($row);
            }
            $row.appendTo($table);
        }
        return $table;
    };

    var createTopHintsTable = function (width) {
        var $table = $("<table>");
        var $row = $("<tr>").appendTo($table);
        for (var colIndex = 0; colIndex < width; colIndex++) {
            $("<td>").addClass("col-" + colIndex)
                .data({ col: colIndex })
                .appendTo($row);
        }
        return $table;
    };

    var createSideHintsTable = function (height) {
        var $table = $("<table>");
        for (var rowIndex = 0; rowIndex < height; rowIndex++) {
            var $row = $("<tr>").appendTo($table);
            $("<td>").addClass("row-" + rowIndex)
                .data({ row: rowIndex })
                .appendTo($row);
            $row.appendTo($table);
        }
        return $table;
    };

    var gameState = Class.extend({
        init: function (width, height, board) {
            this.width = width;
            this.height = height;
            this.board = board;
        }
    });

    return picross;
})(jQuery);