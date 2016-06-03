class Paint extends Entity{
	constructor(color, width){
		super("Paint", new GVector2f(), new GVector2f(), color);
		this.borderWidth 	= width;
		this._points 		= {color: [[]]};
		this._count 		= 0;
		this._actColor 		= color;
		this._canvas 		= document.createElement("canvas");
		this._canvas.width 	= canvas.width;
		this._canvas.height	= canvas.height;
		this._context 		= this._canvas.getContext('2d');
		this._max 			= new GVector2f();

		/*
		for(var i=0 ; i<1000 ; i++)
			this.addPoint(new GVector2f(Math.random() * canvas.width, Math.random() * canvas.height))
		*/
	};

	cleanUp(){
		this._points[this._actColor] = [[]];
		this._count = 0;	
		context.clearRect(0, 0, canvas.width, canvas.height);
	};

	addPoint(point, color = "black"){
		if (this._count == 0) {
			this.position.set(point);
			this._max.set(point);
		}
		else if(this._points[this._actColor][this._points[this._actColor].length - 1].length > 1){
			this.position.x = Math.min(point.x, this.position.x);
			this.position.y = Math.min(point.y, this.position.y);
			this._max.x = Math.max(point.x, this._max.x);
			this._max.y = Math.max(point.y, this._max.y);
			this.size.set(this._max.getClone().sub(this.position));
		}
		this._count++;


		this._actColor = color;
		if(!this._points.hasOwnProperty(this._actColor))
			this._points[this._actColor] = [[]];


		var arr = this._points[this._actColor][this._points[this._actColor].length - 1];

		if(arr.length > 0){
			
			this._context.lineCap 		= LINE_CAP_ROUND;
			this._context.lineWidth 	= this.borderWidth;
			this._context.strokeStyle	= color;
			this._context.beginPath();
			this._context.moveTo(point.x, point.y);
			this._context.lineTo(arr[arr.length - 1].x, arr[arr.length - 1].y);
			this._context.stroke();
		}
		arr.push(point);
	};

	breakLine() {
		this._points[this._actColor].push([]);
	};

	draw() {
		if (!this.visible)
			return;

		//drawBorder(this, []);

		context.drawImage(this._canvas, 0, 0);
	};
}