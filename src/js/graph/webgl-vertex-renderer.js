class WebglVertexRenderer {
    constructor(args) {
        //defaults
        this.shape = 'circle';
        this.size = 30;
        this.color = '#FAFAFA';
        this.strokeSize = 2;
        this.strokeColor = '#888888';
        this.opacity = 0.8;
        this.labelSize = 12;
        this.labelColor = '#111111';
        this.labelPositionX = 0;
        this.labelPositionY = 0;
        this.labelText = '';
        this.area = 1;
        this.strokeArea = 1;
        this.xAttribute = 'x';
        this.yAttribute = 'y';
        this.labelAdjust;

        this.selectColor = 0xFF0000;

        this.pieSlices = [
            //        {size: this.size, area: this.sliceArea, color: this.color, labelSize: this.labelSize, labelOffset: 0}
        ];
        this.donutSlices = [
            //        {size: this.strokeSize, area: this.sliceArea, color: this.strokeColor, labelSize: this.labelSize, labelOffset: 0}
        ];

        // this.shapeEl;
        // this.vertexEl;
        // this.targetEl;
        // this.selectEl;
        // this.groupEl;

        this.graphics;
        this.group;
        this.parentContainer;
        this.stage;
        this.pixi;
        this.networkLayout;

        this.vertex;

        this.selected = false;

        //draw parameters
        this.labelX = 0;
        this.labelY = 0;

        //set instantiation args, must be last
        for (var prop in args) {
            if (hasOwnProperty.call(args, prop)) {
                if (args[prop] != null) {
                    if (!isNaN(args[prop])) {
                        this[prop] = parseFloat(args[prop]);
                    } else {
                        this[prop] = args[prop];
                    }
                }
            }
        }
    }

    get(attr) {
        return this[attr];
    }
    set(attr, value, update) {
        if (!isNaN(value)) {
            value = parseFloat(value);
        }
        this[attr] = value;
        if (this._checkListProperties()) {
            this.complex = true;
            this.update();
        } else {
            this.complex = false;
            this.update();
        }
    }
    render(args) {
        this.networkLayout = args.target;
        this.pixi = this.networkLayout.pixi;
        this.stage = this.pixi.stage;
        this.parentContainer = this.stage.children[0];
        this._setLabelText(this.vertex.id);
        if (this._checkListProperties()) {
            this.complex = true;
            this.update();
        } else {
            this.complex = false;
            this.update();
        }
    }
    remove() {
        if (this.group != null) {
            var childs = this.group.removeChildren();
            for (var i = 0; i < childs.length; i++) {
                var child = childs[i];
                child.destroy();
            }
        }
    }
    update() {
        this.remove();
        this._render();
    }
    select(color) {
        if (color) {
            this.selectColor = this.cc(color);
            this.selectGraphics.tint = this.selectColor;
        }
        this.selectGraphics.visible = true;
        this.selected = true;

        this.parentContainer.setChildIndex(this.group, this.parentContainer.children.length - 1);
    }
    deselect() {
        this._removeSelect();
        this.selected = false;
    }
    _removeSelect() {
        this.selectGraphics.visible = false;
    }
    move() {
        this.group.position.set(this.coords.x, this.coords.y);
        console.log('move')
    }
    setLabelContent(text) {
        if (text == null) {
            text = '';
        }
        this._setLabelText(text);
        this.update();
    }
    getSize() {
        return this._getFigureSize();
    }
    _render() {
        if (this.group == null) {
            this.group = new PIXI.Container();
            this.group.interactive = true;
            this.group.position = new PIXI.Point(this.coords.x, this.coords.y);
            this.group.on('mousedown', (e) => {
                e.stopPropagation();
                this.networkLayout.handleVertexMouseDown(e, this.vertex);
            });
            this.group.on('mouseup', (e) => {
                e.stopPropagation();
                this.networkLayout.handleVertexMouseUp(e, this.vertex);
            });
        }
        if (this.complex === true) {
            //TODO
        } else {
            var mid = this._getMidSize();
            var figureSize = this._getFigureSize();
            this._drawSelectShape();
            this._drawSimpleShape();
            this._renderLabelEl();
        }

        if (this.selected) {
            this.select();
        }
    }
    _drawSimpleShape() {
        var mid = this._getMidSize();
        var midl2 = mid / 2;
        this.graphics = new PIXI.Graphics();
        this.graphics.lineStyle(this.strokeSize, this.cc(this.strokeColor), this.opacity, 1);
        this.graphics.beginFill(this.cc(this.color), this.opacity);
        switch (this.shape) {
        case "circle":
            this.graphics.drawCircle(0, 0, mid);
            break;
        case "ellipse":
            this.graphics.drawEllipse(0, 0, mid * 1.5, mid);
            break;
        case "square":
            this.graphics.drawRect(-mid, -mid, mid * 2, mid * 2);
            break;
        case "rectangle":
            this.graphics.drawRect(-mid * 3 / 2, -mid, mid * 3, mid * 2);
            break;
        case "textfit":
            break;
        }
        this.graphics.endFill();
        this.group.addChild(this.graphics);
        this.parentContainer.addChild(this.group);
        // this.graphics.setTransform(this.coords.x - mid, this.coords.y - mid);
    }
    _drawSelectShape() {
        var figureSize = this._getFigureSize();
        var mid = this._getMidSize();
        var midl2 = mid / 2;
        this.selectGraphics = new PIXI.Graphics();
        this.selectGraphics.tint = this.selectColor;
        this.selectGraphics.beginFill(0xFFFFFF, 0.5 * this.opacity);
        if (this.complex === true) {
            this.selectGraphics.drawCircle(0, 0, figureSize / 2 * 1.30);
        } else {
            switch (this.shape) {
            case "circle":
                this.selectGraphics.drawCircle(0, 0, figureSize / 2 * 1.30);
                break;
            case "ellipse":
                this.selectGraphics.drawEllipse(0, 0, figureSize, figureSize / 1.45);
                break;
            case "square":
                this.selectGraphics.drawRect(-midl2, -midl2, mid * 2 * 1.3, mid * 2 * 1.3);
                break;
            case "rectangle":
                this.selectGraphics.drawRect(-midl2, -midl2, mid * 3 * 1.3, mid * 2 * 1.3);
                break;
            case "textfit":
                this.selectGraphics.drawRect(-midl2, -midl2, mid * 3 * 1.3, mid * 2 * 1.3);
                break;
            }
        }
        this.selectGraphics.endFill();
        this.selectGraphics.visible = false;
        this.group.addChild(this.selectGraphics);
    }
    _renderLabelEl() {
        var linesCount = this.labelLines.length;
        var yStart = this.labelPositionY - (linesCount * this.labelSize / 2);
        for (var i = 0; i < linesCount; i++) {
            var line = this.labelLines[i];
            var textWidth = this._textWidthBySize(line, this.labelSize);
            var x = this.labelPositionX - (textWidth / 2);
            var y = yStart + (i * this.labelSize);
            var pixiText = new PIXI.Text(line, {
                fontFamily: 'Monospace',
                fontSize: this.labelSize,
                fill: this.cc(this.labelColor),
                align: 'left' //??
            });
            pixiText.position.set(x, y);
            // pixiText.resolution = 2; //??

            this.group.addChild(pixiText);
        }
    }
    _setLabelText(text) {
        this.labelText = text.toString();
        this.labelLines = this.labelText.split(/\\n/);
        this.labelLinesLength = this.labelLines.length;
        var maxLabelWidth = 0;
        for (var i = 0; i < this.labelLinesLength; i++) {
            var line = this.labelLines[i];
            var textWidth = this._textWidthBySize(line, this.labelSize);
            if (textWidth > maxLabelWidth) {
                maxLabelWidth = textWidth;
            }
        }
        this._textWidth = maxLabelWidth * 1.2;
        this._textHeight = this.labelLinesLength * this.labelSize * 1.2;
    }
    _textWidthBySize(text, pixelFontSize) {
        return parseInt(text.length * pixelFontSize * 0.6);
    }
    _getMidSize() {
        var size = (Array.isArray(this.size)) ? this._slicesMax(this.pieSlices) : this.size;
        var strokeSize = (Array.isArray(this.strokeSize)) ? this._slicesMax(this.donutSlices) : this.strokeSize;
        if (this.size < 0) {
            var size = Math.max(this._textWidth, this._textHeight);
            return (size + strokeSize) / 2;
        } else {
            return (this.size + strokeSize) / 2;
        }
    }
    _getFigureSize() {
        var size = (Array.isArray(this.size)) ? this._slicesMax(this.pieSlices) : this.size;
        var strokeSize = (Array.isArray(this.strokeSize)) ? this._slicesMax(this.donutSlices) : this.strokeSize;
        if (this.size < 0) {
            var size = Math.max(this._textWidth, this._textHeight);
            return size + (strokeSize * 2);
        } else {
            return this.size + (strokeSize * 2);
        }
    }

    _checkListProperties() {
        /** Detect array values **/
        var minPieLength = 0;
        var minDonutLength = 0;
        if (Array.isArray(this.color)) {
            if (minPieLength == 0) {
                minPieLength = this.color.length;
            }
        }
        if (Array.isArray(this.size)) {
            if (minPieLength == 0 || minPieLength == 1) {
                minPieLength = this.size.length;
            }
            if (this.size.length != 1 && this.size.length < minPieLength) {
                minPieLength = this.size.length;
            }
        }
        if (Array.isArray(this.area)) {
            if (minPieLength == 0 || minPieLength == 1) {
                minPieLength = this.area.length;
            }
            if (this.area.length != 1 && this.area.length < minPieLength) {
                minPieLength = this.area.length;
            }
        }
        if (Array.isArray(this.strokeColor)) {
            if (minDonutLength == 0) {
                minDonutLength = this.strokeColor.length;
            }
        }
        if (Array.isArray(this.strokeSize)) {
            if (minDonutLength == 0 || minDonutLength == 1) {
                minDonutLength = this.strokeSize.length;
            }
            if (this.strokeSize.length != 1 && this.strokeSize.length < minDonutLength) {
                minDonutLength = this.strokeSize.length;
            }
        }
        if (Array.isArray(this.strokeArea)) {
            if (minDonutLength == 0 || minDonutLength == 1) {
                minDonutLength = this.strokeArea.length;
            }
            if (this.strokeArea.length != 1 && this.strokeArea.length < minDonutLength) {
                minDonutLength = this.strokeArea.length;
            }
        }
        this.pieSlices = [];
        var slice;
        if (minPieLength > 0) {
            for (var i = 0; i < minPieLength; i++) {
                slice = {};
                if (Array.isArray(this.color)) {
                    if (this.color.length == 1) {
                        slice.color = this.color[0];
                    } else {
                        slice.color = this.color[i];
                    }
                } else {
                    slice.color = this.color;
                }
                if (Array.isArray(this.size)) {
                    if (this.size.length == 1) {
                        slice.size = this.size[0];
                    } else {
                        slice.size = this.size[i];
                    }
                } else {
                    slice.size = this.size;
                }
                if (Array.isArray(this.area)) {
                    if (this.area.length == 1) {
                        slice.area = this.area[0];
                    } else {
                        slice.area = this.area[i];
                    }
                } else {
                    slice.area = this.area;
                }
                slice.labelSize = this.labelSize;
                slice.labelOffset = 0;
                this.pieSlices.push(slice);
            }
        }
        this.donutSlices = [];
        if (minDonutLength > 0) {
            for (var i = 0; i < minDonutLength; i++) {
                slice = {};
                if (Array.isArray(this.strokeColor)) {
                    if (this.strokeColor.length == 1) {
                        slice.color = this.strokeColor[0];
                    } else {
                        slice.color = this.strokeColor[i];
                    }
                } else {
                    slice.color = this.strokeColor;
                }
                if (Array.isArray(this.strokeSize)) {
                    if (this.strokeSize.length == 1) {
                        slice.size = this.strokeSize[0];
                    } else {
                        slice.size = this.strokeSize[i];
                    }
                } else {
                    slice.size = this.strokeSize;
                }
                if (Array.isArray(this.strokeArea)) {
                    if (this.strokeArea.length == 1) {
                        slice.size = this.strokeArea[0];
                    } else {
                        slice.area = this.strokeArea[i];
                    }
                } else {
                    slice.area = this.strokeArea;
                }
                slice.labelSize = this.labelSize;
                slice.labelOffset = 0;
                this.donutSlices.push(slice);
            }
        }
        if (this.pieSlices.length != 0 || this.donutSlices.length != 0) {
            if (this.pieSlices.length == 0) {
                this.pieSlices.push({
                    color: this.color,
                    size: this.size,
                    area: this.area,
                    labelSize: this.labelSize,
                    labelOffset: 0
                });
            }
            if (this.donutSlices.length == 0) {
                this.donutSlices.push({
                    color: this.strokeColor,
                    size: this.strokeSize,
                    area: this.strokeArea,
                    labelSize: this.labelSize,
                    labelOffset: 0
                });
            }
            return true;
        } else {
            return false;
        }
        /** **/
    }
    toJSON() {
        return {
            shape: this.shape,
            size: this.size,
            color: this.color,
            strokeSize: this.strokeSize,
            strokeColor: this.strokeColor,
            opacity: this.opacity,
            labelSize: this.labelSize,
            labelColor: this.labelColor,
            labelPositionX: this.labelPositionX,
            labelPositionY: this.labelPositionY,
            labelText: this.labelText,
            area: this.area,
            strokeArea: this.strokeArea,
            pieSlices: this.pieSlices,
            donutSlices: this.donutSlices
        };
    }
    cc(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }
}
