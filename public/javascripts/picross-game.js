﻿
"use strict";

Picross.View = Backbone.View.extend({
    interactable: false,
    initialize: function(){
        this.model = new Picross.Model(this.options.game);
        this.inputEvent = InputState.none;
        this.render();
    },
    render: function () {
        this.$el.attr('class', 'picross-game size-' + this.model.get('width') + '-' + this.model.get('height'));
        this.$el.html(ViewRenderHelper.createGameArea());
        
        this.gameArea = {
            $controls: this.$('.controls'),
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
            this.interactable = true;
        } else {
            this.gameArea.$controls.html(ViewRenderHelper.createControlArea());
            this.gameStatus = new Picross.GameStatusView({ el: this.gameArea.$controls[0], parent: this });
            this.modifyKnownSquares();
            this.gameStart();
        }
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
            this.inputEvent = InputState.get(ev);
            this.modifySquare($(ev.currentTarget));
            return false;
        },
        'mouseup.picross' : function (ev) {
            this.inputEvent = InputState.clear();
            if (this.model.get('editorMode')) {
                this.updateHints();
                this.updateBoardState();
            }
        },
        'mouseenter.picross .board td' : function (ev) {
            this.modifySquare($(ev.currentTarget));
        },
        'mousedown.picross .hints td span' : function (ev) {
            if (!this.model.get('editorMode')) {
                this.inputEvent = InputState.get(ev);
                this.modifyHint($(ev.currentTarget));
            }
        },
        'mouseenter.picross .hints td span' : function (ev) {
            if (!this.model.get('editorMode')) {
                this.modifyHint($(ev.currentTarget));
            }
        },
        'mouseleave.picross' : function (ev) {
            this.inputEvent = InputState.clear();
        },
        'contextmenu.picross' : function (ev) { ev.preventDefault(); }
    },
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
    modifyHint: function ($element) {
        if ($element.is('.locked')) {
            return;
        }
        if (this.inputEvent !== InputState.none) {
            $element.toggleClass('marked', !$element.is('.marked'));
        }
    },
    modifySquare: function ($td) {
        if ($td.is('.locked') || !this.interactable) {
            return;
        }
        if (this.inputEvent === InputState.fill) {
            if (this.model.get('editorMode')) { // just do it if in editor mode
                $td.toggleClass('filled', !$td.is('.filled'));
                return;
            } else if ($td.is('.marked:not(.locked)')) { // remove the mark
                $td.removeClass('marked');
                return;
            }
            var index = $('td', this.gameArea.$board).index($td[0])
            if (this.model.canBeFilled(index)) { // fill only if legal move
                $td.addClass('filled locked');
                this.model.fill(index);
                if (this.model.isComplete()) {
                    this.gameOver(true);
                }
            } else {
                $td.addClass('marked locked error');
                this.model.set({ lives: this.model.get('lives') - 1 })
            }
        } else if (this.inputEvent === InputState.mark) {
            if ($td.is('.filled')) {
                $td.removeClass('filled');
            } else {
                $td.toggleClass('marked', !$td.is('.marked'));
            }
        }
        if (this.inputEvent !== InputState.none) {
            this.modifyKnownSquares($td);   
        }
    },
    modifyKnownSquares: function () {
        var height = this.model.get('height');
        for (var rowIndex = 0; rowIndex < height; rowIndex++) {
            if (this.model.hasRowBeenFilled(rowIndex)) {
                $('td.row-' + rowIndex + ' span', this.gameArea.$sideHints).each(function () {
                    $(this).addClass('marked locked');
                });
                $('td.row-' + rowIndex, this.gameArea.$board).each(function () {
                    var $td = $(this);
                    if ($td.is(':not(.filled)')) {
                        $td.addClass('marked locked');
                    }
                });
            }
        }

        var width = this.model.get('width');
        for (var colIndex = 0; colIndex < width; colIndex++) {
            if (this.model.hasColBeenFilled(colIndex)) {
                $('td.col-' + colIndex + ' span', this.gameArea.$topHints).each(function () {
                    $(this).addClass('marked locked');
                });
                $('td.col-' + colIndex, this.gameArea.$board).each(function () {
                    var $td = $(this);
                    if ($td.is(':not(.filled)')) {
                        $(this).addClass('marked locked');
                    }
                });
            }
        }
    },
    updateBoardState: function () {
        if (this.model.get('editorMode')) {
            var state = '';
            $('td', this.gameArea.$board).each(function (index, el) {
                state += $(el).is('.filled') ? '1' : '0';
            });
            this.model.set({ hash: StateHelper.encode(state) });
        }
    },
    gameStart: function () {
        this.$el.append(
            $('<div>').addClass('start-countdown')
                .data('time', 3)
                .text('3')
        );
        var self = this;
        var timer = this.$('.start-countdown');
        var startCountdown = function () {
            timer.data('time', timer.data('time') - 1);
            timer.text(timer.data('time'));
            if (timer.data('time') > 0) {
                setTimeout(startCountdown, 1000);
            } else {
                self.gameStatus.start();
                timer.remove();
            }
        };
        setTimeout(startCountdown, 1000);
    },
    gameOver: function (win) {
        // end the game! called from GameStatusView
        if (win) {
            this.gameStatus.gameOver('Good Job!');
            this.$el.addClass('win');
        } else {
            this.gameStatus.gameOver('You Lost!');
            this.$el.addClass('lose');
        }
        this.$el.addClass('game-over');
    }

});

Picross.GameStatusView = Backbone.View.extend({
    hasTimedOut: false,
    initialize: function () {
        this.hasTimedOut = false;
        this.parent = this.options.parent;
        this.parent.model.on('change:lives', this.livesChange, this);
        this.startTime = null;
        this.render();
    },
    render: function () {
        var self = this;
        this.$lives = this.$('.lives').text('');
        $.each(new Array(this.parent.model.get('lives')), function () {
            self.$lives.append($('<span>').addClass('life'));
        });
        var countdownOptions = {
            since: new Date(),
            format: 'hMS',
            compact: true
        };
        var maxTime = this.parent.model.get('maxTime');
        if (maxTime) {
            this.$('.max-time').text(maxTime + ' minute time limit');
            countdownOptions.onTick = function (time) {
                self.checkTimeout(time);   
            }
        }
        this.$timer = this.$('.timer');
        this.$timer.countdown(countdownOptions);
        this.$timer.countdown('pause');
        this.parent.$el.addClass('paused');
    },
    events: {
        'click.picross button.pause' : function (ev) {
            this.pause();
            $(ev.currentTarget).toggleClass('pause resume').html('resume');
        },
        'click.picross button.resume' : function (ev) {
            this.start();
            $(ev.currentTarget).toggleClass('pause resume').html('pause');
        },
        'click.picross button.restart' : function (ev) {
            this.parent.initialize();
        }
    },
    start: function () {
        this.$timer.countdown('resume');
        this.parent.$el.removeClass('paused');
        this.parent.interactable = true;
    },
    pause: function () {
        this.$timer.countdown('pause');
        this.parent.$el.addClass('paused');
        this.parent.interactable = false;
    },
    stop: function () {
        this.$timer.countdown('pause');
        this.parent.$el.addClass('stopped');
        this.parent.interactable = false;
    },
    livesChange: function () {
        this.$('.lives .life:not(.off)').last().addClass('off');
        if (this.parent.model.get('lives') <= 0) {
            this.parent.gameOver();
            this.stop();
        }
    },
    checkTimeout: function (time) {
        if (this.hasTimedOut) { return; } // this event is called too often by countdown plugin
        var elapsedMinutes = time[5];
        var maxTime = this.parent.model.get('maxTime')
        if (maxTime === elapsedMinutes) {
            this.timeout();
        } else if (maxTime - 1 === elapsedMinutes) {
            this.$timer.addClass('danger');
        }
    },
    timeout: function () {
        this.hasTimedOut = true;
        this.parent.gameOver();
    },
    gameOver: function (message) {
        this.stop();
        this.$lives.text(message);
        this.$('button.pause, button.resume')
            .removeClass('pause').removeClass('resume')
            .addClass('restart')
            .html('restart');
    }
});

