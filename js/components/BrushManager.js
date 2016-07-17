class BrushManager{
	constructor(){
		this._brushes		= [];
		this._selectedImage	= null;
		this._selectedBrush	= null;
	}

	set selectedImage(title){
		this._selectedImage = this._brushes[title];
		this.rePaintImage();

		if(isSharing())
			Sharer.paint.changeBrush(title);
		Menu._redraw();
	}

	get selectedImage(){return this._selectedImage;}
	get selectedBrush(){return this._selectedBrush;}

	getBrush(title){
		return this._brushes[title];
	}

	addBrush(title){
		var img = new Image();
		img.src = "img/" + title;
		this._brushes[title] = img;

		if(isNull(this._selectedImage))
			this.selectedImage = title;
	}

	rePaintImage(size = 32, col = "#000000"){
		var c = document.createElement('canvas'),
			ctx, imgData, data, color, i;
		c.width = size;
		c.height = size;

		ctx = c.getContext('2d');
		ctx.drawImage(this._selectedImage, 0, 0, size, size);
		imgData = ctx.getImageData(0, 0, size, size);
		data = imgData.data;
		color = col.replace("rgb(", "").replace("rgba(", "").replace(")", "").split(", ").map(a => parseInt(a));
		for(i=3 ; i<data.length ; i+=4){
			if(data[i] == 0)
				continue;
			data[i - 3] = color[0];
			data[i - 2] = color[1];
			data[i - 1] = color[2];
		}
		ctx.putImageData(imgData, 0, 0);
		this._selectedBrush = c;
	}

}