class OptionsManager{
	constructor(){
		this._options = {
			snapping: {
				id: "idAllowedSnapping",
				attr: "value",
				val: 0 //0, 30, 45, 90
			},
			grid: {
				id: "idShowGrid",
				attr: "checked",
				val: OPTION_SHOW_GRID
			},
			showLayersViewer: {
				id: "idShowLayersViewer",
				attr: "checked",
				val: OPTION_SHOW_LAYERS_VIEWER
			},
			shadows: {
				id: "idShadows",
				attr: "checked",
				val: OPTION_SHOW_SHADOWS
			},
			movingSilhouette: {
				id: "idMovingSilhouette",
				attr: "checked",
				val: OPTION_MOVING_SILHOUETTE
			},
			changeCursor: {
				id: "idChangeCursor",
				attr: "checked",
				val: OPTION_CHANGE_CURSOR
			},
			canvasBlur: {
				id: "idCanvasBlur",
				attr: "checked",
				val: OPTION_CANVAS_BLUR
			}
		};
		Logger && Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
	_processAndSetValueIfExistById(id, val, attr){
		var e = document.getElementById(id);
		if(e){
			e.value = this[val];
			e.onchange = e => this.setOpt(val, e.target[attr], false);
		}
	}

	init(){
		each(this._options, (e, i) => this._processAndSetValueIfExistById(e["id"], i, e["attr"]));
	}

	get grid(){return this._options["grid"]["val"];}
	get shadows(){return this._options["shadows"]["val"];}
	get snapping(){return this._options["snapping"]["val"];}
	get canvasBlur(){return this._options["canvasBlur"]["val"];}
	get changeCursor(){return this._options["changeCursor"]["val"];}
	get showLayersViewer(){return this._options["showLayersViewer"]["val"];}
	get movingSilhouette(){return this._options["movingSilhouette"]["val"];}


	setOpt(key, val, setElement = true){
		var obj = this._options[key];
		if(setElement){
			var e = document.getElementById(obj["id"]);
			if(e)
				e[obj["attr"]] = val
		}

		if(key === "showLayersViewer")
			Entity.setAttr(Layers, "visible", val);
		
		Logger.log("nastavila sa možnosť " + key + " na hodnotu " + val, LOGGER_CHANGE_OPTION);
		obj["val"] = val;
		draw();
	}
}