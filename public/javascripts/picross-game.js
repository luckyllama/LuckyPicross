
"use strict";

App.Views.PicrossGame = App.Views.PicrossBase.extend({
    interactable: false,
    gameStatus: {},

    initialize: function(options){
        // call parent initialize
        this.constructor.__super__.initialize.apply(this, [options]);
    },

    render: function () {
        // call parent render
        this.constructor.__super__.render.apply(this);

        this.gameArea.$controls.html(this.renderHelper.createControlArea());
        this.gameStatus = new App.Views.GameStatus({ el: this.gameArea.$controls[0], parent: this, model: this.model });
        this.modifyKnownSquares();
        this.gameStart();
    },

    renderHelper: _.extend({}, App.Views.PicrossBase.prototype.renderHelper, {
        createControlArea: function () {
            return $('<div>').append(
                $('<div>').addClass('time').append(
                    $('<span>').addClass('timer')
                ).append(
                    $('<span>').addClass('max-time')
                )
            ).append(
                $('<div>').addClass('lives')
            ).append(
                $('<div>').addClass('actions').append(
                    $('<button>').addClass('btn pause')
                        .attr('type', 'button')
                        .html('pause')
                )
            );
        }
    }),

    events: _.extend( {}, App.Views.PicrossBase.prototype.events, {
        'mousedown.picross .hints td span' : function (ev) {
            this.inputEvent = InputState.get(ev);
            this.modifyHint($(ev.currentTarget));
        },
        'mouseenter.picross .hints td span' : function (ev) {
            this.modifyHint($(ev.currentTarget));
        }
    }),

    modifyHint: function ($element) {
        if ($element.is('.locked')) {
            return;
        }
        if (this.inputEvent !== InputState.none) {
            $element.toggleClass('marked', !$element.is('.marked'));
        }
    },

    // override base to add custom logic
    modifySquare: function ($square) {
        if (!this.interactable){
            return;
        }
        this.constructor.__super__.modifySquare.apply(this, [$square]);

        if (this.inputEvent !== InputState.none) {
            this.modifyKnownSquares($square);   
        }
    },

    // implement fill square logic 
    fillSquare: function ($square) {
        if ($square.is('.marked:not(.locked)')) { // remove the mark
            $square.removeClass('marked');
            return;
        }
        var index = $('td', this.gameArea.$board).index($square[0])
        if (this.model.canBeFilled(index)) { // fill only if legal move
            $square.addClass('filled locked');
            this.model.fill(index);
            if (this.model.isComplete()) {
                this.gameOver(true);
            }
        } else {
            $square.addClass('marked locked error');
            this.model.set({ lives: this.model.get('lives') - 1 })
        }
    },

    // lock row/columns that have been completed
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

    // start up the game
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

    // the game is over, the user has (bool) won
    gameOver: function (won) {
        // end the game! called from GameStatusView
        if (won) {
            this.gameStatus.gameOver('Good Job!');
            this.$el.addClass('win');
        } else {
            this.gameStatus.gameOver('You Lost!');
            this.$el.addClass('lose');
        }
        this.$el.addClass('game-over');
    }

});

App.Views.GameStatus = Backbone.View.extend({
    hasTimedOut: false,
    initialize: function () {
        this.hasTimedOut = false;
        this.parent = this.options.parent;
        this.model.on('change:lives', this.livesChange, this);
        this.startTime = null;
        this.render();
    },
    render: function () {
        var self = this;
        this.$lives = this.$('.lives').text('');
        $.each(new Array(this.model.get('lives')), function () {
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
            this.parent.render();
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
        console.log('livesChange');
        this.$('.lives .life:not(.off)').last().addClass('off');
        if (this.model.get('lives') <= 0) {
            this.parent.gameOver();
            this.stop();
        }
    },
    checkTimeout: function (time) {
        if (this.hasTimedOut) { return; } // this event is called too often by countdown plugin
        var elapsedMinutes = time[5];
        var maxTime = this.model.get('maxTime')
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


