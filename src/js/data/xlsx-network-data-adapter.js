function XLSXNetworkDataAdapter(args) {
    var _this = this;
    this.boundEvents = {};

    this.dataSource;
    this.async = true;

    this.graph = new NvGraph();
    this.xlsx;

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
        this.parse(data);
    }


};

XLSXNetworkDataAdapter.prototype.on = function(eventName, cb) {
    this.boundEvents[eventName] = cb;
};
XLSXNetworkDataAdapter.prototype.trigger = function(event) {
    if (typeof this.boundEvents[event] === 'function') {
        this.boundEvents[event].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

XLSXNetworkDataAdapter.prototype.parse = function(data) {
    try {
        this.xlsx = XLSX.read(data, {
            type: 'binary'
        });
        this.trigger('data:load', {
            workbook: this.xlsx,
            sender: this
        });
    } catch (e) {
        console.log(e);
        this.trigger('error:parse', {
            errorMsg: 'Parse error',
            sender: this
        });
    }
};
XLSXNetworkDataAdapter.prototype.parseSheet = function(sheetName) {
    var csv = XLSX.utils.sheet_to_csv(this.xlsx.Sheets[sheetName]);
    return csv;
};
