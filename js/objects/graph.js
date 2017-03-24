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
		this._vertices = vertices;
		this._edges = edges;
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
			}
        });

        return this.movingPoint >= 0;
	}
    move(x, y){
        //ak sa hýbe celým objektom
        if(this.movingPoint < 0){
            this.points.forEach(a => a.add(x, y));
        }
		else{
			let vertex = this._vertices[this.movingPoint];
			vertex.x += x;
			vertex.y += y;
        }
    }
	_draw(ctx){
		//TODO nakresliť čiary
		each(this._edges, e => {
			if(typeof this._vertices[e.A] !== "undefined" && typeof this._vertices[e.B] !== "undefined"){
				let start 	= new GVector2f(this._vertices[e.A].x, this._vertices[e.A].y);
				let end 	= new GVector2f(this._vertices[e.B].x, this._vertices[e.B].y);
				doLine({
					points: [start.x, start.y, end.x, end.y],
					borderWidth: e.borderWidth,
					borderColor: e.fillColor,
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
			borderColor: e.borderColor,
			borderWidth: e.borderWidth,
			center: true
		}))
	}
}

function initGraphs(){
	let g = new Graph();
	g.addVertex({x: 100, y: 100, size: 30, borderWidth: 5, borderColor: "blue", fillColor: "red"});
	g.addVertex({x: 500, y: 100, size: 40, borderWidth: 15, borderColor: "blue", fillColor: "red"});
	g.addVertex({x: 300, y: 300, size: 50, borderWidth: 25, borderColor: "blue", fillColor: "red"});

	g.addEdge({fillColor:"pink", borderWidth: 10, A: 0, B:1, labelCenter: "gabko"});
	g.addEdge({fillColor:"brown", borderWidth: 20, A: 1, B:2});
	g.addEdge({fillColor:"orange", borderWidth: 30, A: 0, B:2});
	Scene.addToScene(g);
}