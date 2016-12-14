function SIFNetworkDataAdapter(args) {
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

    if (this.async) {
        this.dataSource.on('success', function (data) {
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        this.parse(data);
    }

    this.addedVertex;
    this.addedEdges;

};

SIFNetworkDataAdapter.prototype.on = function (eventName, cb) {
    this.boundEvents[eventName] = cb;
};
SIFNetworkDataAdapter.prototype.trigger = function (event) {
    if (typeof this.boundEvents[event] === 'function') {
        this.boundEvents[event].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

SIFNetworkDataAdapter.prototype.getGraph = function () {
    return this.graph;
};

SIFNetworkDataAdapter.prototype.parse = function (data) {
    var _this = this;

    try {
        /* Detect separator: if tab is found use tab, space instead*/
        if (data.indexOf('\t') != -1) {
            this.separator = '\t';
        } else {
            this.separator = ' ';
        }

        console.time("SIFParse");
        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
        var lines = data.split(/\n/);
        this.addedVertex = {};
        this.addedEdges = {};

        //        console.log('SIFParse number lines: ' + lines.length);
        //        console.log(lines);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if ((line != null) && (line.length > 0)) {
                var fields = line.split(this.separator);
                for (var j = 0; j < fields.length; j++) {
                    fields[j] = fields[j].trim();
                }

                if (fields[0].substr(0, 1) != "#") {

                    var sourceName = fields[0];
                    var edgeName = (fields[1] === '') ? "r" : fields[1];
                    var targetName;

                    /** create source vertex **/
                    if (typeof this.addedVertex[sourceName] === 'undefined') {
                        var sourceVertex = new Vertex({
                            id: sourceName
                        });
                        this.graph.addVertex(sourceVertex);
                        this.addedVertex[sourceName] = sourceVertex;
                    }

                    // multiple targets
                    for (var j = 2, len = fields.length; j < len; j++) {
                        targetName = fields[j];

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
            }
        }
        console.timeEnd("SIFParse");
        this.trigger('data:load', {
            graph: this.graph,
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
