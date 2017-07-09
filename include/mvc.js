(function($, exports){
    var mod = {};
    
    mod.create = function(includes){
        var result = function(){
            this.initializer.apply(this, arguments);
            this.init.apply(this, arguments);
        };
                
        result.fn = result.prototype;
        result.fn.init = function(){};
        
        result.proxy    = function(func){ return $.proxy(func, this); };
        result.fn.proxy = result.proxy;

        result.include = function(ob){ $.extend(this.fn, ob); }; 
        result.extend  = function(ob){ $.extend(this, ob); };
        
        /**
         * private
         */
        result.include({
            initializer: function(options){
                this.options = options;
                for (var key in this.options)
                    this[key] = this.options[key];

                if (this.events) this.delegateEvents();
                if (this.elements) this.refreshElements();
            },
            addEventListener: function (ev,cb) {
                var calls = this._callbacks || (this._callbacks= {});
                (this._callbacks[ev] || (this._callbacks[ev] = [])).push(callback);
                return this;
            },
            emit: function () {
                var args = [].slice.call(arguments, 0);
                var ev = args.shift();
                var list, calls, i, l;
                if (!(calls = this._callbacks)) return this;
                if (!(list = this._callbacks[ev])) return this;
                var length = list.length;
                for (i=0; i<length; i++) {
                    list[i].apply(this, args);
                }
                return this;
            },
            $: function(selector){
                return $(selector, this.el);
            },

            refreshElements: function(){
                for (var key in this.elements) {
                    this[this.elements[key]] = this.$(key);
                }
            },

            eventSplitter: /^(\w+)\s*(.*)$/,

            delegateEvents: function(){
                for (var key in this.events) {
                    var methodName = this.events[key];
                    var method     = this.proxy(this[methodName]);
                    var match      = key.match(this.eventSplitter);
                    var eventName  = match[1], selector = match[2];

                    if (selector === '') {
                        this.el.bind(eventName, method);
                    } else {
                        this.el.delegate(selector, eventName, method);
                    }
                }
            }
        });
        
        if (includes) result.include(includes);
        
        return result;
    };
    
    exports.Controller = mod;
})(jQuery, window);