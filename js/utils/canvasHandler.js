/*
	compatible:	forEach, canvas, canvasText 14.9.2016
*/
class CanvasHandler{
	constructor(arg1, arg2, arg3){
		if(typeof arg1 === "string"){
			this._canvas = document.getElementById(arg1);
			if(arg2 && arg3)
				CanvasHandler.setCanvasSize(this._canvas, arg2, arg3);
		}
		else if(arg1 instanceof HTMLImageElement){//ARGUMENT JE OBRAZOK
			this._canvas = CanvasHandler.imageToCanvas(arg1);
			CanvasHandler.setCanvasSize(this._canvas, arg1.width, arg1.height);	
		}
		else{
			this._canvas = document.createElement("canvas");

			if(arg1 && arg2){//ARGUMENTY SU VELKOST
				this.setCanvasSize(arg1, arg2);
			}
		}
		this._context = this._canvas.getContext("2d");
	}

	get canvas(){return this._canvas;}
	get context(){return this._context;}
	getImage(){return CanvasHandler.canvasToImage(this._canvas);}

	setShadow(x, y, color, blur){
		CanvasHandler.setShadow(this._context, x, y, color, blur);
	}

	show(format = "image/png"){
		window.open(this._canvas.toDataURL(format), '_blank');
	}

	clearCanvas(){
		CanvasHandler.clearCanvas(this._context);
	}

	setLineDash(... args){
		CanvasHandler.setLineDash(this._context, args);
	}

	setCanvasSize(width = window.innerWidth, height = window.innerHeight){
		CanvasHandler.setCanvasSize(this._canvas, width, height);
	}

	appendTo(element){
		element.appendChild(this._canvas);
	}

	static clearCanvas(ctx){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	static setCanvasSize(c, width, height){
		c.width = width;
		c.height = height;
	}

	static setShadow(ctx, x, y, color, blur){
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.shadowOffsetX = x;
      ctx.shadowOffsetY = y;
	}

	static imageToCanvas(image){
		var canvas = document.createElement("canvas");
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext("2d").drawImage(image, 0, 0);
		return canvas;
	}

	static setLineDash(ctx, ...args){
		//TODO otestovať;
		if(typeof ctx.setLineDash === "function"){
			ctx.setLineDash(args);
		}
	}

	static calcTextWidth(ctx, value, font = false){
		if(font)
			ctx.font = font;
		return ctx.measureText(value).width;
	}

	static canvasToImage(canvas, format = "image/png"){
		var image = new Image();
		image.src = canvas.toDataURL(format);
		image.width = canvas.width;
		image.height = canvas.height;
		return image;
	}
}