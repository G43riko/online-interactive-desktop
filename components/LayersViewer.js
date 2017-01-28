"use strict"

class LayersViewerAbstract{

};


class LayersViewer extends LayersViewerAbstract{
	_createDiv(){
		this._layers = [];
		this._layersBody = G("div", {attr: {id: "layersBody"}});
		return G("div", {
			attr: {id: "layersViewer"}, 
			cont: [
				G.createElement("div", {id: "layersHeader"}, [
		 				G.createElement("div", {
		 					class: "layersHeaderButton", 
		 					id: "addLayerButton", 
		 					onclick: "LayersViewer.createAnonymLayer()"
		 				}, "+"),
		 				G.createElement("div", {
		 					class: "layersHeaderButton", 
							id: "removeLayerButton", 
							onclick: "LayersViewer.removeActiveLayer()"
						}, "×"),
		 				G.createElement("div", {
		 					class: "layersHeaderButton", 
		 					id: "toggleLayerButton",
		 					onclick: "G('#layersViewer').toggleClass('minimalized')"
		 				}, "-")
	 				]),
	 			this._layersBody.first()
 			]
		});
	}
	static setName(element){
		var input = G(element);
		var text = input.first().value;
		input.parent().text(text);


	}
	static changeName(element){
		var textBox = G(element);
		var text = textBox.text();
		var input = G.createElement("input", {
			class: "tmpLayerInput",
			type: "text",
			onblur:"LayersViewer.setName(this)",
			onkeydown:"if(event.keyCode === 13){LayersViewer.setName(this)}",
			value: text
		});
		textBox.text("").append(input);
		input.focus();
		input.select();

	}
	static changeVisibility(layerName){
		G("#id_" + layerName).toggleClass("true").toggleClass("false")
	}
	static removeActiveLayer(){
		LayersViewer.instance.deleteLayer();
	}
	static createAnonymLayer(){
		LayersViewer.instance.createLayer();
	}
	static makeSelected(element){
		var layer = new G(element);
		if(layer.hasClass("selected")){
			return;
		}

		G("#layersViewer .layer").each(function(){
			G(this).removeClass("selected");
		});
		console.log("pridava sa selected k: ", layer);
		layer.addClass("selected");
	}
	constructor(element, defaultName = "Layer_"){
		super();
		if(typeof LayersViewer.instance !== "undefined"){
			alert("Nieje možné vytvoriť viac ako jednu inštanciu LayersViewera!!!!");
			return;
		}
		LayersViewer.instance = this;
		this._defaultName = defaultName;
		this._counter = 0;
		this._layers = {};
		this._activeLayer = "";
		this._existingLayers = 0;
		this._layersViewer = this._createDiv();
		element.appendChild(this._layersViewer.first());
	};
	_createLayerDiv(title){
		return G("div", {
			attr: {
				class: "layer" + (this._existingLayers == 1 ? " selected" : ""),
				id: title,
				onclick: "LayersViewer.makeSelected(this)"},
			cont: [
				G.createElement("div", {class: "visible true", onclick: "LayersViewer.changeVisibility('" + title + "')", id: "id_" + title}),
				G.createElement("div", {class: "title", ondblclick: "LayersViewer.changeName(this)"}, title),
				G.createElement("div", {class: "options"})
			]
		});
	};
	createLayer(title){
		if(typeof title !== "string" || title.length === 0){
			title = this._defaultName + this._counter;
		}
		this._counter++;
		this._existingLayers++;
		this._layers[title] = this._createLayerDiv(title);
		this._layersBody.append(this._layers[title]);
	};
	onScreenResize(){
	};

	deleteLayer(title){
		if(typeof title != "string" || title.length === 0){
			title = G(".layer.selected").text()
		}

		var layer = this._layers[title];

		//ak sa maže označená vrstva tak sa označí dalšia;
		if(layer.hasClass("selected") && this._existingLayers > 1){
			for(var i in this._layers){
				if(i !== title && this._layers.hasOwnProperty(i)){
					this._layers[i].addClass("selected");
					break;
				}
			}
		}
		layer.delete();
		delete this._layers[title];
		this._existingLayers--;
	};
};
