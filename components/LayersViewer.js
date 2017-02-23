/* TODO
	prerobiť nech ID nieje iba nazov vrstvy ale aj nejaky prefix
	JShint 4.2.2017
*/
class LayersViewer{
	constructor(arg){
		if(G.isDefined(LayersViewer.instance)){
			alert("Nieje možné vytvoriť viac ako jednu inštanciu LayersViewera!!!!");
			return;
		}
		LayersViewer.instance = this;
		if(typeof arg !== "object"){
			alert("Argument musí byť objekt");
			return;
		}

		if(typeof arg.element === "undefined"){
			alert("arg.element musí byť definovaný");
			return;
		}

        let element 			= arg.element;
		this._defaultName 		= arg.defaultLayertName || "Layer_";
		this._counter 			= 0;
		this._layers 			= {};
		this._activeLayer 		= "";
		this._existingLayers 	= 0;
		this._selectedLayer 	= null;
		this._layersViewer 		= this._createDiv();
		this.visible 			= arg.visible !== false || false;


		element.appendChild(this._layersViewer.first());

		if(typeof Scene !== "undefined" && G.isObject(Scene) && G.isDefined(Scene._layers)){
			each(Scene._layers, e => this.createLayer(e), this);
		}
	}

	set visible(val){
		val ? this._layersViewer.show() : this._layersViewer.hide();
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
        let input 	= G(element);
        let oldName = input.parent().attr("oldName");
        let newName = input.first().value;
		
		element.onblur = element.onkeydown = null;

		//aj je nový názov prázdny tak vložíme pôvodný názov
		if(newName.length === 0){
			Logger.error("Názov nemôže byť prázdny");
			input.parent().text(oldName);
			return;
		}

		//ak vrstva už existuje tak uporoníme používatela
		if(G.isDefined(LayersViewer.instance._layers[newName])){
			Logger.error("vrstva " + newName + " už existuje");
			input.parent().text(oldName);
			return;
		}

		input.parent().text(newName);

		//ak sa názov nezmenil nič nepremenujeme
		if(oldName === newName){
			return;
		}
		

		if(typeof Scene !== "undefined" && Scene.renameLayer){
			Scene.renameLayer(oldName, newName);
		}
		else{
			alert("Scene nieje definovaná");
		}

		LayersViewer.instance._layers[newName] = LayersViewer.instance._layers[oldName];
		LayersViewer.instance._layers[newName].title = newName;
		delete LayersViewer.instance._layers[oldName];

	}

	static changeName(element){
        let textBox = G(element);
        let text = textBox.text();
		textBox.attr("oldName", text);
        let input = G.createElement("input", {
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
        let layer = LayersViewer.instance._layers[G(element).parent().text()];
		if(layer){
			layer.div.find(".visible.true").toggleClass("false");
			layer.layer.visible = !layer.layer.visible;
		}
	}

	static showOptions(element, e){
        let data = {
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
        let pos = G.position(element);
        let size = G.size(element);
		G("#layerContextMenu").delete();

        let items = [];
		G.each(data.items, (e) => {
            let element = G.createElement("li", {onclick: "LayersViewer.clickOnContext(this, \"" + e.attr + "\")"}, G.createElement("a", {}, e.label));
			if(e.type === "boolean"){
                let classa = "visible";
				if(LayersViewer.instance.activeLayer[e.attr] === false){
					classa += " false";
				}
				element.append(G.createElement("div", {class: classa, attr: e.attr}));
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
        let el = G(element);
        let childrens = el.children(".visible");
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
        let layer = new G(element);
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
		if(typeof title !== "string" || title.length === 0){
			title = this.activeLayerName;
		}

        let layer = this._layers[title].div;

		//ak sa maže označená vrstva tak sa označí dalšia;
		if(layer.hasClass("selected") && this._existingLayers > 1){
			for(let i in this._layers){
				if(i !== title && this._layers.hasOwnProperty(i)){
					this._layers[i].div.addClass("selected");
					this.selectedLayer = this._layers[i].title;
					break;
				}
			}
		}
		layer.delete();
		delete this._layers[title];
		this._existingLayers--;
	}
}
