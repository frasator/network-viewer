function JSONNetworkDataAdapter(args) {
    var _this = this;
    this.boundEvents = {};

    this.dataSource;
    this.async = true;
    this.jsonObject;

    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            if (args[prop] != null) {
                this[prop] = args[prop];
            }
        }
    }

    for (var eventName in this.handlers) {
        this.on(eventName, this.handlers[eventName]);
    }

    if (this.async) {
        this.dataSource.on('success', function(data) {
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        this.jsonObject = JSON.parse(data);
    }
};

JSONNetworkDataAdapter.prototype.on = function(eventName, cb) {
    this.boundEvents[eventName] = cb;
};
JSONNetworkDataAdapter.prototype.trigger = function(event) {
    if (typeof this.boundEvents[event] === 'function') {
        this.boundEvents[event].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

JSONNetworkDataAdapter.prototype.getJSON = function() {
    return this.jsonObject;
};


JSONNetworkDataAdapter.prototype.parse = function(data) {
    try {
        this.jsonObject = JSON.parse(data);
        this.trigger('data:load', {
            jsonObject: this.jsonObject
        });
    } catch (e) {
        console.log(e);
        this.trigger('error:parse', {
            errorMsg: 'Parse error',
            sender: this
        });
    }
};
