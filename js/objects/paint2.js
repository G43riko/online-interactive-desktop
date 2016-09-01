class Paint extends Entity{
	constructor(color, width){
		super("Paint", new GVector2f(), new GVector2f());
		Entity.changeAttr(this, ATTRIBUTE_BORDER_WIDTH, width);
		this._points 		= {};
		this._points[color] = [[]];
		this._count 		= 0;
		this._backup		= [];
		this._actColor 		= color;
		this._canvas 		= document.createElement("canvas");
		this._canvas.width 	= canvas.width;
		this._canvas.height	= canvas.height;
		this._context 		= this._canvas.getContext('2d');
		this._max 			= new GVector2f();
		this._images		= [];
		this._brushSize 	= new GVector2f(32);
		this._selectedImg	= null;
	};

	repaint(time){

	}

	get selectedImg(){
		return this._selectedImg;
	};

	setImage(title){
		this._selectedImg = this._images[title];
		if(typeof Sharer === "object" && Sharer.isSharing)
			Sharer.paint.changeBrush(title);
		Menu._redraw();
	};

	getImage(title){
		return this._images[title];
	};

	addImage(title){
		var img = new Image();
		img.src = "img/" + title;
		this._images[title] = img;

		if(this._selectedImg == null){
			this._selectedImg = img;
			if(typeof Sharer === "object" && Sharer.isSharing)
				Sharer.paint.changeBrush(title);
			Menu._redraw();
		}
	}

	rePaintImage(){
		var c = document.createElement('canvas'),
			ctx, imgData, data, color, i;
		c.width = this._brushSize.x;
		c.height = this._brushSize.y;

		ctx = c.getContext('2d');
		ctx.drawImage(this._selectedImg, 0, 0, this._brushSize.x, this._brushSize.y);
		imgData = ctx.getImageData(0, 0, this._brushSize.x, this._brushSize.y);
		data = imgData.data;
		color = Creator.color.replace("rgb(", "").replace("rgba(", "").replace(")", "").split(", ").map(a => parseInt(a));
		for(i=3 ; i<data.length ; i+=4){
			if(data[i] == 0)
				continue;
			data[i - 3] = color[0];
			data[i - 2] = color[1];
			data[i - 1] = color[2];
		}
		ctx.putImageData(imgData, 0, 0);
		this._img2 = c;
	}

	cleanUp(){
		this._points[this._actColor] = [[]];
		this._count = 0;
		this._context.clearRect(0, 0, canvas.width, canvas.height);
		if(typeof Sharer === "object" && Sharer.isSharing)
			Sharer.paint.clean();
	};

	addPoint(point, color = "#000000"){
		if (!this._count) {
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

		if(isDefined(Sharer) && Sharer.isSharing)
			Sharer.paint.addPoint(point, color);

		if(this._actColor != color)
			this.rePaintImage();

		this._actColor = color;
		if(!this._points.hasOwnProperty(this._actColor))
			this._points[this._actColor] = [[]];


		var arr = this._points[this._actColor][this._points[this._actColor].length - 1];
		if(arr.length){
			var lastPoint = arr[arr.length - 1];
			/*
			 this._context.lineCap 		= LINE_CAP_ROUND;
			 this._context.lineWidth 	= this.borderWidth;
			 this._context.strokeStyle	= color;
			 this._context.beginPath();
			 this._context.moveTo(point.x, point.y);
			 this._context.lineTo(lastPoint.x, lastPoint.y);
			 this._context.stroke();
			 */

			var dist 		= point.dist(lastPoint),
				angle 		= Math.atan2(point.x - lastPoint.x, point.y - lastPoint.y);
			for (var i = 0; i < dist; i++)
				this._context.drawImage(this._img2,
					lastPoint.x + (Math.sin(angle) * i) - (this._brushSize.x >> 1),
					lastPoint.y + (Math.cos(angle) * i) - (this._brushSize.y >> 1),
					this._brushSize.x,
					this._brushSize.y);

			this._context.globalAlpha = 1;

		}
		arr.push(point);
	};

	breakLine() {
		this._points[this._actColor].push([]);
		if(isDefined(Sharer) && Sharer.isSharing)
			Sharer.paint.breakLine();
	};

	draw() {
		if (!this.visible)
			return;
		context.drawImage(this._canvas, 0, 0);
	};
}