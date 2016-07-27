function Edge(args) {

    this.id = 'e' + stv.utils.genId();

    this.relation = '';
    this.source;
    this.target;
    this.weight;
    this.directed;
    this.overlapCount;

    this.attributes = {};

    this.renderer = new DefaultEdgeRenderer();
    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            this[prop] = args[prop];
        }
    }

    if (this.renderer) {
        this.renderer.edge = this;
    }
}

Edge.prototype = {
    getSource: function () {
        return this.source;
    },
    setSource: function (vertex) {
        this.source = vertex;
    },
    getTarget: function () {
        return this.target;
    },
    setTarget: function (vertex) {
        this.target = vertex;
    },
    render: function (args) {
        this.renderer.render(args)
    },
    setRenderer: function (renderer) {
        if (renderer) {
            this.renderer = renderer;
            this.renderer.edge = this;
        }
    },
    toJSON: function () {
        return {
            id: this.id,
            source: this.source,
            target: this.target,
            weight: this.weight,
            directed: this.directed,
            relation: this.relation,
            renderer: this.renderer,
            attributes: this.attributes
        }
    }
}
