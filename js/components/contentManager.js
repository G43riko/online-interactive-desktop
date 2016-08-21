class ContentManager{
	constructor(){
		this._contentImage = null;
		this._contentHTML  = null;
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	setContentImage(src = false){
		if(this._contentImage === null)
			this._contentImage = document.getElementById("contentImage");

		//var inst = this;
		if(src)
			this._contentImage.src = src;
		else{
			this._contentImage.src = "#";
			loadImage(img => this._contentImage.src = img.src);
		}

		this._contentImage.classList.remove("hide");
	}

	setContentHTML(){
		if(this._contentHTML === null)
			this._contentHTML = document.getElementById("contentHTML");
		this._contentHTML.classList.remove("hide");
		loadFile(html => this._contentHTML.innerHTML = html);
	}

	hideContent(){
		if(this._contentImage !== null)
			this._contentImage.classList.add("hide");
		if(this._contentHTML !== null)
			this._contentHTML.classList.add("hide");
	}
}