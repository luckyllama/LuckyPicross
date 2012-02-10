
(function ($, Picross) {
    "use strict";

    Picross.Model = Backbone.Model.extend({
        defaults: {
            board: [],
            name: '',
            lives: 5,
            maxTime: null,
            height: 10,
            width: 10,
            editorMode: false,
        },
        initialize: function () {}
    });

    Picross.View = Backbone.View.extend({
        initialize: function(){
            this.model = new Picross.Model(this.options.game);
            this.inputState = {
                leftMouseDown: false,
                rightMouseDown: false,
                shiftKeyDown: false
            };

            this.gameArea = {
                $board: this.$('.board'),
                $topHints: this.$('.top.hints'),
                $sideHints: this.$('.side.hints')
            };
            this.render();
        },
        render: function () {
            this.$el.attr('class', 'picross-game size-' + this.model.get('width') + '-' + this.model.get('height'));
            this.gameArea.$board.html(ViewRenderHelper.createBoardTable(this.model.get('width'), this.model.get('height')));
            this.gameArea.$topHints.html(ViewRenderHelper.createTopHintsTable(this.model.get('width')));
            this.gameArea.$sideHints.html(ViewRenderHelper.createSideHintsTable(this.model.get('height')));

            this.updateHints();

            if (this.model.get('editorMode')) {
                this.sizeView = new Picross.SizeView({ parent: this });
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

        events: {
            'hover.picross td' : function (ev) {
                var $td = $(ev.currentTarget);
                var toggleHover = function (view, $td, align) {
                    var alignIndex = $td.data(align);
                    if (alignIndex !== 'undefined') {
                        view.$('.' + align + '-' + alignIndex).toggleClass('hover');
                    }
                };
                toggleHover(this, $td, 'col');
                toggleHover(this, $td, 'row');
            },
            'mousedown.picross .board td' : function (ev) {
                this.inputState.leftMouseDown = event.button === 0; // left mouse button
                this.inputState.rightMouseDown = event.button === 2; // right mouse button
                this.inputState.shiftKeyDown = event.shiftKey;
                this.updateSquare($(ev.currentTarget));
                return false;
            },
            'mouseup.picross .board td' : function (ev) {
                this.inputState.leftMouseDown = false;
                this.inputState.rightMouseDown = false;
                this.inputState.shiftKeyDown = event.shiftKeyDown;
                this.updateHints();
                if (this.model.get('editorMode')) {
                    this.updateBoardState();
                }
            },
            'mouseenter.picross .board td' : function (ev) {
                this.updateSquare($(ev.currentTarget));
            },
            'contextmenu.picross': function () { return false; }
        },
        updateSquare: function ($td) {
            if (this.inputState.leftMouseDown && !this.inputState.shiftKeyDown) {
                if ($td.is('.marked')) {
                    $td.removeClass('marked');
                } else {
                    $td.toggleClass('filled', !$td.is('.filled'));
                }
            } else if (this.inputState.rightMouseDown || (this.inputState.leftMouseDown && this.inputState.shiftKeyDown)) {
                if ($td.is('.filled')) {
                    $td.removeClass('filled');
                } else {
                    $td.toggleClass('marked', !$td.is('.marked'));
                }
            }
        },
        updateBoardState: function () {
            var state = [];
            $('td', this.gameArea.$board).each(function (index, el) {
                state.push($(el).is('.filled'));
            });
            this.model.set({ board: state });
        }

    });

    Picross.SizeView = Backbone.View.extend({
        el: '#puzzle-size',
        initialize: function () {
            this.parent = this.options.parent;
        },
        events: {
            'click button' : function (ev) {
                var size = $(ev.currentTarget).val();
                this.parent.model.set({ width: size, height: size });
                this.parent.render();
            }
        }
    });

    var ViewRenderHelper = {
        createBoardTable: function (height, width) {
            var $table = $('<table>');
            for (var rowIndex = 0; rowIndex < height; rowIndex++) {
                var $row = $('<tr>').addClass('row-' + rowIndex);
                for (var colIndex = 0; colIndex < width; colIndex++) {
                    $('<td>')
                        .addClass('col-' + colIndex + ' row-' + rowIndex)
                        .data({ col: colIndex, row: rowIndex })
                        .html($('<span>').html('&times;'))
                        .appendTo($row);
                }
                $row.appendTo($table);
            }
            return $table;
        },
        createTopHintsTable: function (width) {
            var $table = $('<table>');
            var $row = $('<tr>').appendTo($table);
            for (var colIndex = 0; colIndex < width; colIndex++) {
                $('<td>').addClass('col-' + colIndex)
                    .data({ col: colIndex })
                    .appendTo($row);
            }
            return $table;
        },
        createSideHintsTable: function (height) {
            var $table = $('<table>');
            for (var rowIndex = 0; rowIndex < height; rowIndex++) {
                var $row = $('<tr>').appendTo($table);
                $('<td>').addClass('row-' + rowIndex)
                    .data({ row: rowIndex })
                    .appendTo($row);
                $row.appendTo($table);
            }
            return $table;
        }
    };


})(window.jQuery, App.module('Picross'));