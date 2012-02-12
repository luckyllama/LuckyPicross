
(function ($, Picross) {
    "use strict";

    Picross.Model = Backbone.Model.extend({
        defaults: {
            board: '',
            name: '',
            lives: 5,
            maxTime: null,
            height: 10,
            width: 10,
            editorMode: false
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
            this.render();
        },
        render: function () {
            this.$el.attr('class', 'picross-game size-' + this.model.get('width') + '-' + this.model.get('height'));
            this.$el.html(ViewRenderHelper.createGameArea());

            this.gameArea = {
                $board: this.$('.board'),
                $topHints: this.$('.top.hints'),
                $sideHints: this.$('.side.hints')
            };

            this.gameArea.$board.html(ViewRenderHelper.createBoardTable(this.model.get('width'), this.model.get('height')));
            this.gameArea.$topHints.html(ViewRenderHelper.createTopHintsTable(this.model.get('width')));
            this.gameArea.$sideHints.html(ViewRenderHelper.createSideHintsTable(this.model.get('height')));

            this.updateHints();

            if (this.model.get('editorMode')) {
                this.sizeView = new Picross.SizeView({ parent: this });
                this.detailsView = new Picross.DetailsView({ parent: this });
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
            var state = '';
            $('td', this.gameArea.$board).each(function (index, el) {
                state += $(el).is('.filled') ? '1' : '0';
            });
            this.model.set({ board: StateHelper.encode(state) });
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

    Picross.DetailsView = Backbone.View.extend({
        el: '#puzzle-details',
        initialize: function () {
            this.parent = this.options.parent;
            this.$('#time').forceNumeric();
        },
        events: {
            'click span.life' : function (ev) {
                var $lives = this.$('span.life');
                var clickedIndex = $lives.index(ev.currentTarget);
                this.$('span.life').each(function (index) {
                    $(this).toggleClass('off', index > clickedIndex);
                });
            },
            'click button.save' : function (ev) {
                var name = this.$('#name').val();
                var time = this.$('#time').val();
                if (!$.isNumeric(time)) { time = null };
                var lives = this.$('span.life:not(.off)').length;
                this.parent.model.set({ name: name, time: time, lives: lives });
                console.log(this.parent.model);
            },
            'click button.reset' : function (ev) {
                this.$('#time').val('\u221E');
                this.parent.render();
            },
            'focus input#time' : function (ev) {
                var input = $(ev.currentTarget);
                if (input.val() === '\u221E') {
                    input.val('');
                }
            },
            'blur input#time' : function (ev) {
                var input = $(ev.currentTarget);
                if (input.val().trim() === '') {
                    input.val('\u221E');
                }
            }
        }
    });

    var ViewRenderHelper = {
        createGameArea: function () {
            return $('<table>').append(
                $('<tr>').append(
                    $('<td>').addClass('controls')
                ).append(
                    $('<td>').addClass('top hints')
                )
            ).append(
                $('<tr>').append(
                    $('<td>').addClass('side hints')
                ).append(
                    $('<td>').addClass('board')
                )
            );
        },
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

    var StateHelper = {
        encode: function (input) {
            var result = '';
            for (var index = 0, length = input.length; index < length; index += 4) {
                var sub = input.substr(index, 4);
                sub = sub + "0000".substr(0, 4 - sub.length);
                var hex = parseInt(sub, 2).toString(16);
                result += hex;
            }
            return result;
        },
        decode: function (input, maxLength) {
            var result = '';
            for (var index = 0, length = input.length; index < length; index++) {
                var sub = input.substr(index, 1);
                var bit = parseInt(sub, 16).toString(2);
                bit = "0000".substr(0, 4 - bit.length) + bit;
                result += bit;
            }
            return result.substr(0, maxLength);
        }
    };


})(window.jQuery, App.module('Picross'));