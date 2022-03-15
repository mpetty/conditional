
/*!
 *	Name:		Conditional
 *	Author: 	Mitchell Petty <https://github.com/mpetty/conditional>
 * 	Version: 	1.0.1
 *	Notes: 		Requires jquery 1.7+
 */
 (function(factory) {
 	if (typeof exports === 'object') {
 		module.exports = factory(jQuery);
 	} else {
 		factory(jQuery);
 	}
 }(function ($) {
    "use strict";

	var Conditional = function( selector, settings ) {
		this.settings = settings;
		this.$selector = selector;
        this.methods = [this.method];

        for (var i = 0; i < this.settings.methods.length; i++) {
            this.methods.push(this.settings.methods[i]);
        }

        this.init();
	};

	Conditional.prototype = {
        method : {
            selector: 'data-conditional-field',

            start: function(field, fields) {
                var notSelected = fields.not(field);

                notSelected.hide().addClass('hide').each(function() {
                    if($(this).attr('data-conditional-reset')) {
                        $('input,select,textarea',this).trigger('force-change').val('');
                    }
                });

                field.show().removeClass('hide');

                field.addClass('conditional-field');

                field.addClass('highlight-field');

                $('input, select, textarea', notSelected).attr('disabled', 'disabled');

				$('input, select, textarea', field)
					.filter(':visible, [type="hidden"]')
					.removeAttr('disabled')
					.trigger('updated');

                $('input[type="hidden"]', field).removeAttr('disabled');

                if(field.data('conditional-update')) {
                    var update = field.data('conditional-update');

                    update = update.split(',');

                    for(var i = 0; i < update.length; i++) {
                        var updateValue = update[i].split(':');
                        if(updateValue.length === 2) {
                            $("input[name='" + updateValue[0] + "']").val(updateValue[1]);
                        }
                    }
                }

                setTimeout(function() {
                    field.removeClass('highlight-field');
                }, 600);
            }
        },

        init : function() {
			var self = this, fields, method, data = {};

			for(var value in this.methods) {
				method = this.methods[value];
				fields = $('['+method.selector+']', this.$selector);

				for (var i = fields.length - 1; i >= 0; i--) {
					data = {};
					data.attr = $(fields[i]).attr(method.selector);
					data.el = $('[name="'+data.attr+'"]');

					data.el.data('conditional-method', method);
					data.el.data('conditional-data', data);

					data.el.off('force-change.'+method.selector+' change.'+method.selector).on('force-change.'+method.selector+' change.'+method.selector, $.proxy(this.trigger, this));
					data.el.trigger('force-change.'+method.selector);
				}
			}
		},

		trigger : function(e) {
			var $this = $(e.currentTarget),
				method = $this.data('conditional-method'),
				value = this.getVal($this).join(','),
				$fields = $('['+method.selector+'="'+$this.attr('name')+'"]', this.$selector),
				$field = $();

			$fields.each(function() {
				var data = $(this).attr('data-conditional-field-values');

				if(typeof data === 'string') {
					data = data.split(',');

					if(data.indexOf(value) !== -1) {
						$field = $field.add($(this));
					}
				}
			});

			method.start.call(this, $field, $fields);
		},

		getVal : function($el) {
			var val = [], $tmpEl;
			if(!$el) return val;

			if( $el.attr('type') === 'checkbox') {
				$tmpEl = $el.filter(':checked');

				$tmpEl.each(function() {
					val.push($(this).val());
				});
			} else if($el.is('select') && $el.attr('multiple')) {
				$tmpEl = $el.find('option:selected');

				$tmpEl.each(function() {
					val.push($(this).val());
				});
			} else if($el.attr('type') === 'radio') {
				$tmpEl = $el.filter(':checked');
				val.push($tmpEl.val());
			} else {
				val.push($el.val());
			}

			return val;
		}
	};

	/* Initialize Plugin */
	$.fn.conditional = function( options ) {
		return this.each(function() {
			var settings = $.extend(true, {}, $.fn.conditional.defaults, options);
			var modal = new Conditional(this, settings);
			$(this).data('conditionals', modal);
			return this;
		});
	};

	/* Set options obj */
	$.fn.conditional.defaults = {
        methods: []
	};
}));