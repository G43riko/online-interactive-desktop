/*
	compatible: classList 14.9.2016
*/
class ContentManager{
	constructor(){
		this._contentImage = null;
		this._contentHTML  = null;
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

    /**
	 * FUnckia upraví veľkosť contentu pri zmene ropzlíšenia
     */
	onResize(){
		if(this._contentImage === null){
			return;
		}
		this._contentImage.width = window.innerWidth;
		this._contentImage.height = window.innerHeight;
	}

    setExtContentImage(src = false){
        if(this._contentImage === null){
            this._contentImage = document.getElementById("contentImage");
            this.onResize();
        }

        if(src){
            this._contentImage.src = src;
        }
        else{
            this._contentImage.src = prompt("Zadajtu URL obrázku");
        }

        this._contentImage.classList.remove("hide");
	}
    /**
	 * Funkcia nastaví ako pozadie obrázok na vstupe
	 *
     * @param src - adresa obrázku ktorý sa má nastaviť ako pozadie
     */
	setContentImage(src = false){
		if(this._contentImage === null){
			this._contentImage = document.getElementById("contentImage");
			this.onResize();
		}

		if(src){
			this._contentImage.src = src;
		}
		else{
			this._contentImage.src = "#";
			loadImage(img => this._contentImage.src = img.src);
		}

		this._contentImage.classList.remove("hide");
	}

	setContentHTML(){
		if(this._contentHTML === null){
			this._contentHTML = document.getElementById("contentHTML");
		}
		this._contentHTML.classList.remove("hide");
		loadFile(html => this._contentHTML.innerHTML = html);
	}

	hideContent(){
		if(this._contentImage !== null){
			this._contentImage.classList.add("hide");
		}
		if(this._contentHTML !== null){
			this._contentHTML.classList.add("hide");
		}
	}
}