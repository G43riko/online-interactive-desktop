/* TODO
	prerobiť nech ID nieje iba nazov vrstvy ale aj nejaky prefix
	JShint 4.2.2017
*/
class LayersViewer{
	constructor(element, defaultName = "Layer_"){
		if(G.isDefined(LayersViewer.instance)){
			alert("Nieje možné vytvoriť viac ako jednu inštanciu LayersViewera!!!!");
			return;
		}
		LayersViewer.instance = this;
		this._defaultName = defaultName;
		this._counter = 0;
		this._layers = {};
		this._activeLayer = "";
		this._existingLayers = 0;
		this._selectedLayer = null;
		this._layersViewer = this._createDiv();
		element.appendChild(this._layersViewer.first());


		if(typeof Scene !== "undefined" && G.isObject(Scene) && G.isDefined(Scene._layers)){
			each(Scene._layers, e => this.createLayer(e), this);
		}
	}

	hover(x, y){return false;}
	clickIn(x, y){return false;}

	static clickOnLayersViewer(e){
		if(typeof draw === "function"){
			draw();
		}
		if(!G(e.target).is(".options")){
			G("#layerContextMenu").delete();
		}
	}
	_createDiv(){
		this._layersBody = G("div", {attr: {id: "layersBody"}});
		return G("div", {
			attr: {id: "layersViewer", onclick:"LayersViewer.clickOnLayersViewer(event)", class: "minimalized"}, 
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
						onclick: "G('#layersViewer').toggleClass('minimalized');"
					}, "-")
	 			]),
	 			this._layersBody.first()
 			]
		});
	}


	static setName(element){
		var input = G(element);
		var oldName = input.parent().attr("oldName");
		var newName = input.first().value;
		if(G.isDefined(LayersViewer.instance._layers[newName])){
			alert("vrstva " + newName + " už existuje");
		}

		element.onblur = element.onkeydown = null;


		if(typeof scene !== "undefined" && Scene.createLayer){
			Scene.renameLayer(oldName, newName);
		}
		LayersViewer.instance._layers[newName] = LayersViewer.instance._layers[oldName];
		LayersViewer.instance._layers[newName].title = newName;
		delete LayersViewer.instance._layers[oldName];

		input.parent().text(newName);
	}

	static changeName(element){
		var textBox = G(element);
		var text = textBox.text();
		textBox.attr("oldName", text);
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

	static changeVisibility(element, e){
		var layer = LayersViewer.instance._layers[G(element).parent().text()];
		if(layer){
			layer.div.find(".visible.true").toggleClass("false");
			layer.layer.visible = !layer.layer.visible;
		}
	}

	static showOptions(element, e){
		var data = {
			"items" : [
				{
					"key" : "lockLayer",
					"type" : "boolean",
					"attr" : "locked",
					"label" : "Zamknuta"
				},
				{
					"key" : "drawPaint",
					"attr" : "drawPaint",
					"type" : "boolean",
					"label" : "Zobraziť malbu"
				},
				{
					"key" : "animatePaint",
					"type" : "button",
					"label" : "Prehrať malbu"
				},
				{
					"key" : "clearPaint",
					"type" : "button",
					"label" : "Vyčistiť malbu"
				},
				{
					"key" : "clearLayer",
					"type" : "button",
					"label" : "Vyčistiť vrstvu"
				}
			]
		};
		var pos = G.position(element);
		var size = G.size(element);
		G("#layerContextMenu").delete();

		var items = [];
		G.each(data.items, (e) => {
			var element = G.createElement("li", {onclick: "LayersViewer.clickOnContext(this, \"" + e.attr + "\")"}, G.createElement("a", {}, e.label));
			if(e.type === "boolean"){
				element.append(G.createElement("div", {class: "visible true", attr: e.attr}));
			}
			items.push(element);
		});

		LayersViewer.instance._layersViewer.append(
			G.createElement("nav", {id: "layerContextMenu"}, 
				G.createElement("ul", {}, items), 
			{top: (pos.y + size.height) + "px", right: (window.innerWidth - pos.x - size.width) + "px"})
		);
	}

	static clickOnContext(element, key){
		var el = G(element);
		var childrens = el.children(".visible");
		if(!childrens.isEmpty()){
			LayersViewer.instance.activeLayer[key] = !LayersViewer.instance.activeLayer[key];
			childrens.class("/false");
		}
		else{
			G("#layerContextMenu").delete();
		}
		if(typeof draw === "function"){
			draw();
		}
		//alert("klikol si na " + key);
	}

	static removeActiveLayer(){
		if(LayersViewer.instance._layersViewer.class("minimalized")){
			return;
		}
		if(Scene && Scene.createLayer){
			Scene.deleteLayer(LayersViewer.instance.activeLayerName);
		}
	}

	static createAnonymLayer(){
		if(LayersViewer.instance._layersViewer.class("minimalized")){
			return;
		}
		if(Scene && Scene.createLayer){
			Scene.createLayer(LayersViewer.instance._defaultName + LayersViewer.instance._counter);
		}
	}

	static makeSelected(element){
		var layer = new G(element);
		if(layer.hasClass("selected")){
			return;
		}

		G("#layersViewer .layer").each(function(){
			G(this).removeClass("selected");
		});
		LayersViewer.instance.selectedLayer = layer.text();
		layer.addClass("selected");
	}

	set selectedLayer(val){
		this._selectedLayer = this._layers[val];
		if(!this._selectedLayer){
			alert("nieje označenážiadna vrstva");
		}
	}

	_createLayerDiv(title){
		return G("div", {
			attr: {
				class: "layer",
				id: title,
				onclick: "LayersViewer.makeSelected(this, event)"},
			cont: [
				G.createElement("div", {class: "visible true", onclick: "LayersViewer.changeVisibility(this, event)"}),
				G.createElement("div", {class: "title", ondblclick: "LayersViewer.changeName(this, event)"}, title),
				G.createElement("div", {class: "options", onclick: "LayersViewer.showOptions(this, event)"})
			]
		});
	}
	/*
	createLayer(title){
		if(typeof title !== "string" || title.length === 0){
			title = this._defaultName + this._counter;
		}
		this._counter++;
		this._existingLayers++;
		this._layersDiv[title] = this._createLayerDiv(title);
		this._layersBody.append(this._layersDiv[title]);
	}
	*/
	createLayer(layer){
		this._counter++;
		this._existingLayers++;
		this._layers[layer.title] = {
			layer: layer,
			title: layer.title,
			div: this._createLayerDiv(layer.title)
		};
		this._layersBody.append(this._layers[layer.title].div);

		if(this._existingLayers === 1){
			LayersViewer.makeSelected(this._layers[layer.title].div.first());
		}
	}

	onScreenResize(){
	}

	get activeLayerName(){//DEPTECATED 4.2.2017
		return this.selectedLayer;
	}

	get selectedLayer(){
		return this._selectedLayer.title;
	}

	get activeLayer(){
		//TODO toto si niekde ukladať
		return this._selectedLayer.layer;
	}

	deleteLayer(title){
		if(typeof title != "string" || title.length === 0){
			title = this.activeLayerName;
		}

		var layer = this._layers[title].div;

		//ak sa maže označená vrstva tak sa označí dalšia;
		if(layer.hasClass("selected") && this._existingLayers > 1){
			for(var i in this._layers){
				if(i !== title && this._layers.hasOwnProperty(i)){
					this._layers[i].div.addClass("selected");
					break;
				}
			}
		}
		layer.delete();
		delete this._layers[title];
		this._existingLayers--;
	}
}
