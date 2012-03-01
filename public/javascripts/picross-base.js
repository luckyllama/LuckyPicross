
"use strict";

App.Models.Game = Backbone.Model.extend({
    defaults: {
        board: '',
        hash: '',
        name: '',
        lives: 5,
        maxTime: null,
        height: 10,
        width: 10,
    },
    initialize: function () {
        this.set({ board: this.decodeHash(this.get('hash'), this.get('height') * this.get('width')) }, { silent: true });
    },
    canBeFilled: function (index) {
        return this.get('board').charAt(index) === '1';
    },
    fill: function (index) {
        var board = this.get('board');
        this.set({ board: board.substr(0,index) + '2' + board.substr(index+1)}, { silent: true })
    },
    hasRowBeenFilled: function (row) {
        return this.getRowBoard(row).indexOf(1) === -1;
    },
    hasColBeenFilled: function (col) {
        return this.getColBoard(col).indexOf(1) === -1;
    },
    isComplete: function () {
        var board = this.get('board');
        return board.indexOf(1) === -1;
    },
    getRowBoard: function (row) {
        var board = this.get('board');
        var width = this.get('width');
        return board.substr(row * width, width);
    }, 
    getColBoard: function (col) {
        var board = this.get('board');
        var height = this.get('height');
        var width = this.get('width');
        var result = '';
        for (var rowIndex = 0; rowIndex < height; rowIndex++) {
            result += board.substr(rowIndex * width + col, 1);
        }
        return result;
    },
    urlRoot: '/editor',
    customValidate: function () {
        var errors = {};
        if (this.get('hash').length <= 0 && this.get('hash').indexOf(1) === -1) {
            errors.hash = 'There must be filled squares on the board.';
        }
        if (this.get('name').length <= 0) {
            errors.name = 'You must supply a game name.';
        }
        return errors;
    },

    encodeHash: function (input) {
        var result = '';
        for (var index = 0, length = input.length; index < length; index += 4) {
            var sub = input.substr(index, 4);
            sub = sub + "0000".substr(0, 4 - sub.length);
            var hex = parseInt(sub, 2).toString(16);
            result += hex;
        }
        return result;
    },
    decodeHash: function (input, maxLength) {
        var result = '';
        for (var index = 0, length = input.length; index < length; index++) {
            var sub = input.substr(index, 1);
            var bit = parseInt(sub, 16).toString(2);
            bit = "0000".substr(0, 4 - bit.length) + bit;
            result += bit;
        }
        return result.substr(0, maxLength);
    }
});

var InputState = {
    none : 'none',
    fill : 'fill',
    mark : 'mark',
    get : function (ev) {
        if (event.button === 0 && !event.shiftKey) {
            return this.fill;
        } else if (event.button === 0 && event.shiftKey) {
            return this.mark;
        } else if (event.button === 2) {
            return this.mark;
        }
    },
    clear : function () {
        return this.none;
    }
}

App.Views.PicrossBase = Backbone.View.extend({
	inputEvent: InputState.none,

    initialize: function () {},

    render: function () {
        this.$el.attr('class', 'picross-game size-' + this.model.get('width') + '-' + this.model.get('height'));
        this.$el.html(this.renderHelper.createGameArea());
        
        this.gameArea = {
            $controls: this.$('.controls'),
            $board: this.$('.board'),
            $topHints: this.$('.top.hints'),
            $sideHints: this.$('.side.hints')
        };
        console.log(this.model);
        this.gameArea.$board.html(this.renderHelper.createBoardTable(this.model.get('width'), this.model.get('height')));
        this.gameArea.$topHints.html(this.renderHelper.createTopHintsTable(this.model.get('width')));
        this.gameArea.$sideHints.html(this.renderHelper.createSideHintsTable(this.model.get('height')));

        this.updateHints();
    },

    renderHelper: {
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
	},

    events: {
    	// on table cell hover, show hover on entire row and column
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
        // on mousedown in a board square, modify cell
        'mousedown.picross .board td' : function (ev) {
            this.inputEvent = InputState.get(ev);
            this.modifySquare($(ev.currentTarget));
            return false;
        },
        // on mouse up, clear the input event
        'mouseup.picross' : function (ev) {
            this.inputEvent = InputState.clear();
        },
        // on mouse enter in a board square, try to modify the square 
        'mouseenter.picross .board td' : function (ev) {
            this.modifySquare($(ev.currentTarget));
        },
        // on mouse leave of the board, forget the input state
        'mouseleave.picross' : function (ev) {
            this.inputEvent = InputState.clear();
        },
        // prevent right clicks
        'contextmenu.picross' : function (ev) { ev.preventDefault(); }
    },

    // update the top and side hints areas based on board/view state
    updateHints: function () {
        var self = this;
        var calculateHints = function ($hintsArea, align) {
            $('td', $hintsArea).each(function () {
                var $hintArea = $(this).html('');
                var alignIndex = $hintArea.data(align);
                var count = 0;
                $('td.' + align + '-' + alignIndex, self.gameArea.$board).each(function () {
                    var square = $(this);
                    var index = $('td', self.gameArea.$board).index(square[0]);
                    if(square.is('.filled') || self.model.canBeFilled(index)) {
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

    // modify a given jquery board square based on current input state
    modifySquare: function ($square) {
        if ($square.is('.locked')) {
            return;
        }

        if (this.inputEvent === InputState.fill) {
            this.fillSquare($square);
        } else if (this.inputEvent === InputState.mark) {
        	this.markSquare($square);
        }
    },

    fillSquare: function ($square) {
    	// should be overriden in extending class
    },

    markSquare: function ($square) {
        if ($square.is('.filled')) {
            $square.removeClass('filled');
        } else {
            $square.toggleClass('marked', !$square.is('.marked'));
        }
    }
});