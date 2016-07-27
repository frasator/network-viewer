function Vertex(args) {
    this.id = 'v' + stv.utils.genId();

    this.edges = [];
    this.edgesIndex = {};

    this.position = new Point();
    this.renderer = new CircosVertexRenderer();
    this.attributes = {};

    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            this[prop] = args[prop];
        }
    }

    if (this.renderer) {
        this.renderer.coords = this.position;
        this.renderer.vertex = this;
    }
}

Vertex.prototype = {
    removeEdge: function (edge) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].id === edge.id) {
                this.edges.splice(i, 1);
                delete this.edgesIndex[edge.id];
                break;
            }
        }
    },
    removeEdges: function () {
        this.edges = [];
        this.edgesIndex = {};
    },
    addEdge: function (edge) {
        if (this.containsEdge(edge) === false) {
            this.edges.push(edge);
            this.edgesIndex[edge.id] = edge;
        }
    },
    containsEdge: function (edge) {
        if (typeof this.edgesIndex[edge.id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    render: function (args) {
        this.renderer.render(args)
    },
    setRenderer: function (renderer) {
        if (renderer) {
            this.renderer = renderer;
            this.renderer.coords = this.position;
            this.renderer.vertex = this;
        }
    },
    toJSON: function () {
        return {
            id: this.id,
            position: this.position,
            renderer: this.renderer,
            attributes: this.attributes
        }
    }
}
