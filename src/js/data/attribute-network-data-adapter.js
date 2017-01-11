function AttributeNetworkDataAdapter(args) {
    var _this = this;
    this.boundEvents = {};

    this.dataSource;
    this.async = true;
    this.ignoreColumns = {};
    this.renameColumns = {};

    this.useFirstLineAsColumnNames = false;

    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            if (args[prop] != null) {
                this[prop] = args[prop];
            }
        }
    }

    this.attributes = [];
    this.columns = [];

    for (var eventName in this.handlers) {
        this.on(eventName, this.handlers[eventName]);
    }

    if (this.async) {
        this.dataSource.on('success', function (data) {
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        _this.parse(data);
    }

};

AttributeNetworkDataAdapter.prototype.on = function (eventName, cb) {
    this.boundEvents[eventName] = cb;
};
AttributeNetworkDataAdapter.prototype.trigger = function (event) {
    if (typeof this.boundEvents[event] === 'function') {
        this.boundEvents[event].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

AttributeNetworkDataAdapter.prototype.parse = function (data) {
    var _this = this;

    //    var lines = data.split("\n");
    //    if (lines.length > 2) {
    //        var types = lines[0].substring(1).replace(/^\s+|\s+$/g, "").split("\t");
    //        var defVal = lines[1].substring(1).replace(/^\s+|\s+$/g, "").split("\t");
    //        var headers = lines[2].substring(1).replace(/^\s+|\s+$/g, "").split("\t");
    //
    //        for (var i = 0; i < headers.length; i++) {
    //            this.attributes.push({
    //                "name": headers[i],
    //                "type": types[i],
    //                "defaultValue": defVal[i]
    //            });
    //        }
    //    }
    //
    //    for (var i = 3; i < lines.length; i++) {
    //        var line = lines[i].replace(/^\s+|\s+$/g, "");
    //        if ((line != null) && (line.length > 0)) {
    //            var fields = line.split("\t");
    //            if (fields[0].substr(0, 1) != "#") {
    //                this.data.push(fields);
    //            }
    //        }
    //    }

    try {
        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var lines = data.split(/\n/);

        var firstLine = lines[0].trim();
        var columnNames = [];
        if (firstLine.substr(0, 1) === "#") {
            columnNames = firstLine.split(/\t/);

            //search for first non header line "#"
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.substr(0, 1) !== "#") {
                    firstLine = line;
                    break;
                }
            }

        }
        if (this.useFirstLineAsColumnNames) {
            columnNames = firstLine.split(/\t/);
            //first non header line
            firstLine = lines[1];

        }

        var finalColumnNames = [];
        var auxRepeatMap = {};
        var numColumns = columnNames.length;
        for (var i = 0; i < numColumns; i++) {

            if (this.renameColumns[i]) {
                finalColumnNames[i] = this.renameColumns[i];
            } else {
                if (columnNames[i]) {
                    finalColumnNames[i] = columnNames[i];
                } else {
                    finalColumnNames[i] = "Column" + i;
                }
            }

            if (i == 0) {
                finalColumnNames[i] = "id";
            }
            if (finalColumnNames[i] == 'X') {
                finalColumnNames[i] = 'x';
            }
            if (finalColumnNames[i] == 'Y') {
                finalColumnNames[i] = 'y';
            }

            if (auxRepeatMap[finalColumnNames[i]] == null) {
                auxRepeatMap[finalColumnNames[i]] = true;
            } else {
                finalColumnNames[i] = finalColumnNames[i] + '_' + i.toString();
            }

            if (this.ignoreColumns[i] !== true) {
                var column = {
                    name: finalColumnNames[i].toString(),
                    title: finalColumnNames[i].toString(),
                    type: "text",
                    formula: function (row) {
                        return row[this.name];
                    }
                };
                this.columns.push(column);
            }
        }
        //check repeated column names
        var auxColumnNameMap = {};
        var auxColumnNames = [];
        for (var i = 0; i < finalColumnNames.length; i++) {
            var cn = finalColumnNames[i];
            if (auxColumnNameMap[cn] == null) {
                auxColumnNameMap[cn] = true;
                auxColumnNames.push(cn);
            } else {
                auxColumnNames.push(cn + '_' + i.toString());
            }
        }
        finalColumnNames = auxColumnNames;

        //ignore attributes
        if (Object.keys(this.ignoreColumns).length > 0) {
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if ((line != null) &&
                    (line.length > 0) &&
                    line.substr(0, 1) != "#"
                ) {
                    if (i == 0 && this.useFirstLineAsColumnNames == true) continue;

                    var fields = line.split("\t");

                    var row = {};
                    for (var j = 0; j < fields.length; j++) {
                        if (this.ignoreColumns[j] !== true) {
                            row[finalColumnNames[j]] = fields[j].trim();
                        }
                    }
                    this.attributes.push(row);
                }
            }
        } else {
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if ((line != null) &&
                    (line.length > 0) &&
                    line.substr(0, 1) != "#"
                ) {
                    if (i == 0 && this.useFirstLineAsColumnNames == true) continue;

                    var fields = line.split("\t");

                    var row = {};
                    for (var j = 0; j < fields.length; j++) {
                        row[finalColumnNames[j]] = fields[j].trim();
                    }
                    this.attributes.push(row);
                }
            }
        }

        this.trigger('data:load', {
            columns: this.columns,
            attributes: this.attributes,
            sender: this
        });
    } catch (e) {
        console.log(e);
        console.log(e.stack);
        this.trigger('error:parse', {
            errorMsg: 'Parse error',
            sender: this
        });
    }

};
