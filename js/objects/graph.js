/*
{

	vertices : [{
		x:
		y:
		fillColor:
		size:
		borderWidth:
		borderColor:
		label:
	}],
	edges : [{
		fillColor: 
		borderWidth:
		labelA:
		labelB:
		startA:
		startB:
		A:
		B:
	}]
}
*/
class Graph extends Entity{
	constructor(vertices = [], edges = []) {
		super(OBJECT_GRAPH, new GVector2f(), new GVector2f(), {
            movingPoint: -1
        });
		this._vertices      = vertices;
		this._edges         = edges;
		this._joining       = false;
		this._startVertex   = null;
		this._endVertex     = null;
		this._show          = 0;
		this._showColor     = "red";
		this._changeVertex  = null;
	}

	addVertex(vertex){
		if(!isObject(vertex) || isUndefined(vertex.x) || isUndefined(vertex.y)){
			return false;
        }

		vertex["fillColor"]		= vertex["fillColor"]	|| GRAPH_FILL_COLOR;
		vertex["borderColor"] 	= vertex["borderColor"]	|| GRAPH_BORDER_COLOR;
		vertex["size"]			= vertex["size"]		|| GRAPH_VERTEX_COLOR;
		vertex["borderWidth"]	= vertex["borderWidth"]	|| GRAPH_BORDER_WIDTH;
		vertex["label"]			= vertex["label"]		|| "";
		this._vertices.push(vertex);
	}
	addEdge(edge){
		if(!isObject(edge) || isUndefined(edge.A) ||isUndefined(edge.B)){
			return false;
        }
		edge["fillColor"]	= edge["fillColor"] 	|| GRAPH_BORDER_COLOR;
		edge["borderWidth"] = edge["borderWidth"] 	|| GRAPH_BORDER_WIDTH;
		edge["labelA"]		= edge["labelA"] 		|| "";
        edge["labelCenter"]	= edge["labelCenter"] 	|| "";
		edge["labelB"] 		= edge["labelB"] 		|| "";
		edge["startA"] 		= edge["startA"] 		|| LINE_NONE;
		edge["startB"] 		= edge["startB"] 		|| LINE_NONE;
		this._edges.push(edge);
	}

	clickIn(x, y){
        this.movingPoint = -1;
		let pos = new GVector2f(x, y);

        each(this._vertices, (e, i) => {
			let dist = pos.dist(e.x, e.y);
			if(dist < (e.size + e.borderWidth) / 2){
				this.movingPoint = i;

				if(Input.isKeyDown(KEY_A)){
				    let oldVertex = this._startVertex;
				    this._startVertex = i;
				    if(oldVertex != i){
                        this.calcShortPath();
                    }
                }
                else if(Input.isKeyDown(KEY_B)){
                    let oldVertex = this._endVertex;
                    this._endVertex = i;
                    if(oldVertex != i){
                        this.calcShortPath();
                    }
                }
			}
        });

        if(Input.isKeyDown(KEY_L_CTRL)){
            this._joining = true;
		}

        return this.movingPoint >= 0;
	}

    hover(x, y){
        //ak neexistuje funkcia  vrátime false

        let pos = new GVector2f(x, y);
        this._mouseOver = false;
        each(this._vertices, (e, i) => {
            let dist = pos.dist(e.x, e.y);
            if(dist < (e.size + e.borderWidth) / 2){
                this._mouseOver = true;
            }
        }, this);


        if(this._mouseOver){
            setCursor(this._locked ? CURSOR_NOT_ALLOWED : CURSOR_POINTER);
            return true;
        }

        setCursor(CURSOR_DEFAULT);
        return false;
    }

    move(x, y){
        //ak sa hýbe celým objektom
        if(this.movingPoint < 0){
            //this.points.forEach(a => a.add(x, y));
        }
		else if(!Input.isKeyDown(KEY_L_CTRL)){
            let vertex = this._vertices[this.movingPoint];
			vertex.x += x;
			vertex.y += y;
        }
    }

    toString(){
    	console.log("let g = new Graph();");
    	each(this._vertices, e => {
            console.log("g.addVertex({x: " + e.x + ", y: " + e.y + ", size: " + e.size + ", borderWidth: " + e.borderWidth + ", borderColor: \"" + e.borderColor + "\", fillColor: \"" + e.fillColor + "\"});");
		});
        each(this._edges, e => {
            console.log("g.addEdge({fillColor:\"" + e.fillColor + "\", borderWidth: " + e.borderWidth + ", A: " + e.A + ", B:" + e.B + ", labelCenter: \"" + e.labelCenter + "\"});");
        });
        console.log("Scene.addToScene(g);");
	}
	_draw(ctx){
		//TODO nakresliť čiary

		if(Input.isKeyDown(KEY_L_CTRL) && this._joining){
            this._lastVertex = this._vertices[this.movingPoint];
            if(this._lastVertex){
				doLine({
					points: [this._lastVertex.x, this._lastVertex.y, Input.mousePos.x, Input.mousePos.y],
					borderWidth: 5,
					borderColor: 'black',
				});
            }
		}
		else if(this._lastVertex) {
            console.log(this._lastVertex);
			this.addVertex({
				x: Input.mousePos.x,
				y: Input.mousePos.y,
				size: this._lastVertex.size,
				borderWidth: this._lastVertex.borderWidth,
				borderColor: this._lastVertex.borderColor,
				fillColor: this._lastVertex.fillColor
			});
			this.addEdge({
				fillColor: "black",
				borderWidth: 5,
				A: this._vertices.indexOf(this._lastVertex),
				B: this._vertices.length - 1
			});
            this._joining = false;
            this._lastVertex = null;
		}

		each(this._edges, e => {
		    let eA = this._vertices[e.A];
		    let eB = this._vertices[e.B];
			if(typeof eA !== "undefined" && typeof eB !== "undefined"){
				let start 	= new GVector2f(this._vertices[e.A].x, this._vertices[e.A].y);
				let end 	= new GVector2f(this._vertices[e.B].x, this._vertices[e.B].y);
				doLine({
					points: [start.x, start.y, end.x, end.y],
					borderWidth: e.borderWidth,
					borderColor: this._show && 
                                 this._path &&
                                 this._path.indexOf(eA) >= 0 &&
                                 this._path.indexOf(eB) >= 0 &&
                                 (this._show === -1 || (this._path.indexOf(eA) < this._show &&
                                                        this._path.indexOf(eB) < this._show)) ? this._showColor : e.fillColor,
				});
				if(e.labelCenter){
					doText({
                        textHalign: FONT_HALIGN_CENTER,
                        textValign: FONT_VALIGN_MIDDLE,
						position: start.add(end).div(2),
						text: e.labelCenter,
                        background: "white",
						ctx: ctx
					});
                }
			}
		});

		each(this._vertices, e => doArc({
			x: e.x,
			y: e.y,
			fillColor: e.fillColor,
			size: e.size,
			borderColor: this._show && this._path && this._path.indexOf(e) >= 0 && (this._show === -1 || this._path.indexOf(e) < this._show) ? this._showColor : e.borderColor,
			borderWidth: e.borderWidth,
			center: true
		}));

	}

    setStartVertex(index){
        this._startVertex = index;
    }
    setEndVertex(index){
        this._endVertex = index;
    }

    show(arg){
        if(isNumber(arg)){
            this._show = arg;
        }
        else{
            this._show = -1
        }
    }

    calcShortPath(){
        if(!this._startVertex || !this._endVertex){
            return;
        }

        this._vertices[this._startVertex]._dist = 0;
        let result = [this._startVertex];

        each(result, e => {
            this._vertices[e]._scaned = true;
            let tmpResult = this._getNeighbords(e);
            each(tmpResult, ee => {
                if(result.indexOf(ee) < 0){
                    result[result.length] = ee;
                }
            });
        });
        this._shortestDistance = this._vertices[this._endVertex]._dist;

        this._path = [];
        let actVert = this._vertices[this._endVertex];
        while(actVert && actVert !== this._vertices[this._startVertex]){
            this._path[this._path.length] = actVert;
            actVert = this._vertices[actVert._parent];
        }
        this._path[this._path.length] = actVert;

        each(this._vertices, e => {
            e._parent = undefined;
            e._scaned = undefined;
            e._added = undefined;
            e._dist = undefined;
        })
    }

    _getNeighbords(index){
        let result = [];
        let eI = this._vertices[index];
        each(this._edges, e => {
            if(e.A === index){
                let eB = this._vertices[e.B];
                if(!eB._added && !eB._scaned){
                    result[result.length] = e.B;
                    eB._added = true;
                    eB._parent = index;
                    eB._dist = eI._dist + parseInt(e.labelCenter);
                }
                else if(!eB._added){
                    eB._added = true;
                    if(eB._dist > eI._dist + parseInt(e.labelCenter)){
                        eB._dist = eI._dist + parseInt(e.labelCenter);
                        eB._parent = index;
                    }
                }
            }
            else if(e.B === index){
                let eA = this._vertices[e.A];
                if(!eA._added && !eA._scaned) {
                    result[result.length] = e.A;
                    eA._added = true;
                    eA._parent = index;
                    eA._dist = eI._dist + parseInt(e.labelCenter);
                }
                else if(!eA._added){
                    eA._added = true;
                    if(eA._dist > eI._dist + parseInt(e.labelCenter)){
                        eA._dist = eI._dist + parseInt(e.labelCenter);
                        eA._parent = index;
                    }
                }
            }
        });
        return result;
    }

}

glob.initRandomGraph = function(vertices = 50, edges = 50){
    let g = new Graph();
    let size = 20;
    for(let i=0 ; i<vertices ; i++){
        g.addVertex({
            x: Math.floor(Math.random() * (window.innerWidth - size)) + size,
            y: Math.floor(Math.random() * (window.innerHeight - size)) + size,
            size: size,
            borderWidth: 5,
            borderColor: "black",
            fillColor: "white"
        });
    }
    for(let i=0 ; i<edges ; i++){
        g.addEdge({
            fillColor:"black",
            borderWidth: 5,
            A: Math.floor(Math.random() * vertices),
            B: Math.floor(Math.random() * vertices),
            labelCenter: Math.floor(Math.random() * vertices)});
    }
    g.show(-1);
    Scene.addToScene(g);
};

glob.initGraphs = function(){
	let g = new Graph();
	/*
	g.addVertex({x: 100, y: 100, size: 30, borderWidth: 5, borderColor: "blue", fillColor: "red"});
	g.addVertex({x: 500, y: 100, size: 40, borderWidth: 15, borderColor: "blue", fillColor: "red"});
	g.addVertex({x: 300, y: 300, size: 50, borderWidth: 25, borderColor: "blue", fillColor: "red"});

	g.addEdge({fillColor:"pink", borderWidth: 10, A: 0, B:1, labelCenter: "23"});
	g.addEdge({fillColor:"brown", borderWidth: 20, A: 1, B:2, labelCenter: "8"});
	g.addEdge({fillColor:"orange", borderWidth: 30, A: 0, B:2, labelCenter: "14"});
	Scene.addToScene(g);
	*/
	/*
    g = new Graph();
    g.addVertex({x: 800, y: 150, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 700, y: 250, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 900, y: 400, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1000, y: 200, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 750, y: 550, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1050, y: 500, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});

    g.addEdge({fillColor:"black", borderWidth: 5, A: 0, B:1, labelCenter: "16"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 1, B:2, labelCenter: "10"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 0, B:3, labelCenter: "8"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 0, B:2, labelCenter: "8"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 1, B:4, labelCenter: "8"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 2, B:4, labelCenter: "8"});
    //g.addEdge({fillColor:"black", borderWidth: 5, A: 2, B:5, labelCenter: "8"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 4, B:5, labelCenter: "8"});
    Scene.addToScene(g);
    */
    g = new Graph();
    g.addVertex({x: 849, y: 165, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 159, y: 699, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 35, y: 800, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 155, y: 755, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 969, y: 659, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 578, y: 478, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 575, y: 600, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1358, y: 818, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1313, y: 692, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 886, y: 357, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 776, y: 686, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 986, y: 559, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 796, y: 806, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 578, y: 169, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 680, y: 612, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 585, y: 905, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 412, y: 578, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 868, y: 229, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 869, y: 726, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 660, y: 822, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 734, y: 792, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 999, y: 776, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 921, y: 776, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 559, y: 733, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1145, y: 861, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 804, y: 956, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 736, y: 584, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1138, y: 699, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 848, y: 11, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 222, y: 578, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1205, y: 322, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1232, y: 718, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 717, y: 251, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 439, y: 723, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 491, y: 553, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 366, y: 402, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1053, y: 426, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1367, y: 613, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 970, y: 836, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1084, y: 765, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 494, y: 896, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 23, y: 572, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 87, y: 669, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 286, y: 52, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 494, y: 820, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1220, y: 814, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 82, y: 517, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 59, y: 314, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 71, y: 221, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addVertex({x: 1025, y: 716, size: 20, borderWidth: 5, borderColor: "black", fillColor: "white"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 12, B:24, labelCenter: "24"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 28, B:0, labelCenter: "28"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 29, B:42, labelCenter: "28"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 21, B:24, labelCenter: "25"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 39, B:49, labelCenter: "8"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 14, B:35, labelCenter: "28"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 39, B:27, labelCenter: "38"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 0, B:3, labelCenter: "24"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 32, B:35, labelCenter: "8"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 27, B:24, labelCenter: "45"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 7, B:24, labelCenter: "46"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 27, B:32, labelCenter: "24"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 18, B:4, labelCenter: "17"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 8, B:31, labelCenter: "37"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 3, B:0, labelCenter: "48"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 44, B:20, labelCenter: "37"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 48, B:35, labelCenter: "20"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 42, B:1, labelCenter: "28"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 15, B:20, labelCenter: "36"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 3, B:40, labelCenter: "38"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 9, B:17, labelCenter: "39"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 37, B:7, labelCenter: "23"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 37, B:27, labelCenter: "10"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 35, B:41, labelCenter: "3"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 39, B:11, labelCenter: "31"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 33, B:23, labelCenter: "16"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 9, B:36, labelCenter: "14"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 2, B:41, labelCenter: "21"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 37, B:0, labelCenter: "46"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 11, B:35, labelCenter: "48"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 7, B:8, labelCenter: "20"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 34, B:6, labelCenter: "31"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 35, B:13, labelCenter: "31"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 42, B:3, labelCenter: "35"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 34, B:33, labelCenter: "42"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 16, B:34, labelCenter: "32"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 41, B:15, labelCenter: "3"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 25, B:15, labelCenter: "12"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 47, B:47, labelCenter: "15"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 45, B:31, labelCenter: "44"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 20, B:23, labelCenter: "44"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 35, B:16, labelCenter: "37"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 33, B:29, labelCenter: "3"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 20, B:10, labelCenter: "25"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 14, B:6, labelCenter: "43"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 2, B:2, labelCenter: "4"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 12, B:14, labelCenter: "32"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 36, B:9, labelCenter: "29"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 10, B:11, labelCenter: "4"});
    g.addEdge({fillColor:"black", borderWidth: 5, A: 38, B:21, labelCenter: "3"});
    g.setEndVertex(28);
    g.setStartVertex(25);
    g.show(-1);
    Scene.addToScene(g);

};