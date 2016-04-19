function TextNetworkDataAdapter(args) {
    var _this = this;
    this.boundEvents = {};

    this.dataSource;
    this.async = true;

    this.separator = /\t/;
    this.graph = new NvGraph();


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

    this.rawData;

    if (this.async) {
        this.dataSource.on('success', function(data) {
            _this.rawData = data;
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        _this.rawData = data;
        this.parse(data);
    }

    this.columnLength;

    this.addedVertex;
    this.addedEdges;

};
TextNetworkDataAdapter.prototype.on = function(eventName, cb) {
    this.boundEvents[eventName] = cb;
};
TextNetworkDataAdapter.prototype.trigger = function(event) {
    if (typeof this.boundEvents[event] === 'function') {
        this.boundEvents[event].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

TextNetworkDataAdapter.prototype.getGraph = function() {
    return this.graph;
};

TextNetworkDataAdapter.prototype.parse = function(data) {
    try {
        if (typeof data === 'undefined') {
            data = this.rawData;
        }
        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var lines = data.split(/\n/);
        this.lines = [];
        this.columnLength = 0;
        var firstLineColumnLength = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if ((line != null) && (line.length > 0)) {
                var fields = line.split(this.separator);
                if (fields[0].substr(0, 1) != "#") {
                    this.lines.push(fields);

                    if (firstLineColumnLength === 0) {
                        firstLineColumnLength = fields.length;
                        this.columnLength = firstLineColumnLength;
                    }

                    if (fields.length !== firstLineColumnLength) {
                        this.trigger('error:parse', {
                            errorMsg: 'Different number of columns.',
                            sender: this
                        });
                    }
                }
            }
        }
        this.trigger('data:load', {
            lines: this.lines,
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

TextNetworkDataAdapter.prototype.parseColumns = function(sourceIndex, targetIndex, relationIndex, relationDefaultName) {
    this.graph = new NvGraph();
    this.addedVertex = {};
    this.addedEdges = {};

    for (var i = 0; i < this.lines.length; i++) {
        var fields = this.lines[i];
        for (var j = 0; j < fields.length; j++) {
            fields[j] = fields[j].trim();
        }


        var sourceName = fields[sourceIndex];
        var targetName = fields[targetIndex];
        var edgeName;
        if (relationIndex < 0) {
            edgeName = relationDefaultName;
        } else {
            edgeName = fields[relationIndex];
        }

        /** create source vertex **/
        if (typeof this.addedVertex[sourceName] === 'undefined') {
            var sourceVertex = new Vertex({
                id: sourceName
            });
            this.graph.addVertex(sourceVertex);
            this.addedVertex[sourceName] = sourceVertex;
        }

        /** Check if target column is not defined, so only the source will be added**/
        if (targetIndex > -1) {

            /** create target vertex **/
            if (typeof this.addedVertex[targetName] === 'undefined') {
                var targetVertex = new Vertex({
                    id: targetName
                });
                this.graph.addVertex(targetVertex);
                this.addedVertex[targetName] = targetVertex;
            }
            var edgeId = sourceName + '_' + edgeName + '_' + targetName;

            /** create edge **/
            if (typeof this.addedEdges[edgeId] === 'undefined') {
                var edge = new Edge({
                    id: edgeId,
                    relation: edgeName,
                    source: this.addedVertex[sourceName],
                    target: this.addedVertex[targetName],
                    weight: 1,
                    directed: true
                });
                this.graph.addEdge(edge);
                this.addedEdges[edgeId] = edge;
            }
        }


    }

    return this.graph;
};
