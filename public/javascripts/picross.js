
window.Picross = (function ($) {

    var defaults = {
        editorMode: false,
        width: 10,
        height: 10,
        debugMode: false
    };

    var picross = Class.extend({
        init: function (gameSelector, options) {
            this.options = $.extend({}, defaults, options);

            this.gameState = new gameState(this.options.width, this.options.height, '');
            this.inputState = {
                leftMouseDown: false,
                rightMouseDown: false,
                shiftKeyDown: false
            };

            var $game = $(gameSelector);
            this.gameArea = {
                $game: $(gameSelector),
                $board: $('.board', $game),
                $topHints: $('.top.hints', $game),
                $sideHints: $('.side.hints', $game)
            };
            this.render();
            this.updateHints();
            this.bindEvents();
        },
        render: function () {
            this.gameArea.$game.attr('class', 'picross-game size-' + this.options.width + '-' + this.options.height);
            this.gameArea.$board.html(createBoardTable(this.options.height, this.options.width));
            this.gameArea.$topHints.html(createTopHintsTable(this.options.width));
            this.gameArea.$sideHints.html(createSideHintsTable(this.options.height));
        },
        bindEvents: function () {
            var self = this;
            this.gameArea.$game.on('hover.picross', 'td', function () {
                var toggleHover = function ($el, align) {
                    var alignIndex = $el.data(align);
                    if (alignIndex !== 'undefined') {
                        $('.' + align + '-' + alignIndex, self.gameArea.$game).toggleClass('hover');
                    }
                };
                toggleHover($(this), 'col');
                toggleHover($(this), 'row');
            });
            var updateSquare = function ($el) {
                if (self.inputState.leftMouseDown && !self.inputState.shiftKeyDown) {
                    if ($el.is('.marked')) {
                        $el.removeClass('marked');
                    } else {
                        $el.toggleClass('filled', !$el.is('.filled'));
                    }
                } else if (self.inputState.rightMouseDown || (self.inputState.leftMouseDown && self.inputState.shiftKeyDown)) {
                    if ($el.is('.filled')) {
                        $el.removeClass('filled');
                    } else {
                        $el.toggleClass('marked', !$el.is('.marked'));
                    }
                }
            }
            this.gameArea.$board.on('mousedown.picross', 'td', function (event) {
                self.inputState.leftMouseDown = event.button === 0; // left mouse button
                self.inputState.rightMouseDown = event.button === 2; // right mouse button
                self.inputState.shiftKeyDown = event.shiftKey;
                updateSquare($(this));
                return false;
            });
            this.gameArea.$board.on('mouseup.picross', function (event) {
                self.inputState.leftMouseDown = false;
                self.inputState.rightMouseDown = false;
                self.inputState.shiftKeyDown = event.shiftKeyDown;
                self.updateHints();
            });

            this.gameArea.$board.on('mouseenter.picross', 'td', function (event) {
                updateSquare($(this));
            });

            this.gameArea.$game.on('contextmenu.picross', function () { return false; });

            if (this.options.editorMode) {
                var self = this;
                $('#puzzle-size').on('click.picross', 'button', function () {
                    var size = $(this).val();
                    self.options.width = self.options.height = size;
                    self.render();
                    self.updateHints();
                });
            }
        },
        updateHints: function () {
            var self = this;
            var calculateHints = function ($hintsArea, align) {
                $('td', $hintsArea).each(function () {
                    var $hintArea = $(this).html('');
                    var alignIndex = $hintArea.data(align);
                    var count = 0;
                    $('td.' + align + '-' + alignIndex, self.gameArea.$board).each(function () {
                        if($(this).is('.filled')) {
                            count++;
                        } else {
                            if (count) {
                                $('<span>').text(count).appendTo($hintArea);
                                count = 0;
                            }
                        }
                    });
                    if (!$hintArea.find('span').length || count > 0) {
                        $('<span>').text(count).appendTo($hintArea);
                    }
                });
            };
            calculateHints(this.gameArea.$topHints, 'col');
            calculateHints(this.gameArea.$sideHints, 'row');
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
        var $table = $('<table>');
        for (var rowIndex = 0; rowIndex < height; rowIndex++) {
            var $row = $('<tr>').addClass('row-' + rowIndex);
            for (var colIndex = 0; colIndex < width; colIndex++) {
                $('<td>')
                    .addClass('col-' + colIndex + ' row-' + rowIndex)
                    .data({ col: colIndex, row: rowIndex })
                    .appendTo($row);
            }
            $row.appendTo($table);
        }
        return $table;
    };

    var createTopHintsTable = function (width) {
        var $table = $('<table>');
        var $row = $('<tr>').appendTo($table);
        for (var colIndex = 0; colIndex < width; colIndex++) {
            $('<td>').addClass('col-' + colIndex)
                .data({ col: colIndex })
                .appendTo($row);
        }
        return $table;
    };

    var createSideHintsTable = function (height) {
        var $table = $('<table>');
        for (var rowIndex = 0; rowIndex < height; rowIndex++) {
            var $row = $('<tr>').appendTo($table);
            $('<td>').addClass('row-' + rowIndex)
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