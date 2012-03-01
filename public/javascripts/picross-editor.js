
"use strict";

App.Views.PicrossEditor = App.Views.PicrossBase.extend({
    sizeView: {},
    detailsView: {},

    initialize: function (options){
        // call parent initialize
        this.constructor.__super__.initialize.apply(this, [options]);
    },

    render: function () {
        // call parent render
        this.constructor.__super__.render.apply(this);
    },

    events: _.extend( {}, App.Views.PicrossBase.prototype.events, {
        // override base mouseup
        'mouseup.picross' : function (ev) {
            this.inputEvent = InputState.clear();
            this.updateHints();
            this.updateBoardState();
        }
    }),

    // implement fill square logic 
    fillSquare: function ($square) {
        $square.toggleClass('filled', !$square.is('.filled'));
        return;
    },

    //todo: this should probably not be here but done right before details view save
    updateBoardState: function () {
        var state = '';
        $('td', this.gameArea.$board).each(function (index, el) {
            state += $(el).is('.filled') ? '1' : '0';
        });
        this.model.set({ hash: this.model.encodeHash(state) }, { silent: true });
    }
});

App.Views.PuzzleSize = Backbone.View.extend({
    el: '#puzzle-size',
    initialize: function () {
        this.parent = this.options.parent;
    },
    events: {
        'click button:not(.active)' : function (ev) {
            var size = $(ev.currentTarget).val();
            this.model.set({ width: size, height: size }, { silent: true });
            this.parent.render();
        }
    }
});

App.Views.PuzzleDetails = Backbone.View.extend({
    el: '#puzzle-details',
    timePlaceholder: '\u221E',
    initialize: function () {
        this.parent = this.options.parent;
        this.$('#time').forceNumeric();
        this.model.on('error', function (model, errors) {
            console.log(errors);
        });
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
            this.model.set({ name: name, time: time, lives: lives });

            this.$('.control-group').removeClass('error');
            this.$('.help-block').remove();
            var validationErrors = this.model.customValidate();
            if (_.size(validationErrors) === 0) {
                this.model.save();
            } else {
                _.each(validationErrors, function (value, key) {
                    var $error = $('<p>').addClass('help-block').text(value);
                    var input = this.$('input#' + key);
                    if (input.exists()) {
                        input.closest('.control-group').addClass('error');
                        input.closest('.controls').append($error);
                    } else {
                        var $formErrors = this.$('#submit-errors');
                        $formErrors.closest('.control-group').addClass('error');
                        $formErrors.append($error);
                    }
                }, this);
            }
        },
        'click button.reset' : function (ev) {
            this.$('#time').val(this.timePlaceholder); 
            this.parent.render();
        },
        'focus input#time' : function (ev) {
            var input = $(ev.currentTarget);
            if (input.val() === this.timePlaceholder) { 
                input.val('');
            }
        },
        'blur input#time' : function (ev) {
            var input = $(ev.currentTarget);
            if (input.val().trim() === '') {
                input.val(this.timePlaceholder);
            }
        }
    }
});