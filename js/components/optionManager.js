/*
	compatible: 14.9.2016
*/
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
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}
	_processAndSetValueIfExistById(id, val, attr, value){
        let e = document.getElementById(id);
		if(e){
			e[attr] = value;
			e.onchange = ee => this.setOpt(val, ee.target[attr], false);
		}
	}

	init(){
		each(this._options, (e, i) => this._processAndSetValueIfExistById(e.id, i, e.attr, e.val));
	}

	get showKeys(){return OPTION_SHOW_KEYS;}
	get showClicks(){return OPTION_SHOW_CLICKS;}
	get grid(){return this._options.grid.val;}
	get shadows(){return this._options.shadows.val;}
	get snapping(){return this._options.snapping.val;}
	get canvasBlur(){return this._options.canvasBlur.val;}
	get changeCursor(){return this._options.changeCursor.val;}
	get showLayersViewer(){return this._options.showLayersViewer.val;}
	get movingSilhouette(){return this._options.movingSilhouette.val;}

	toObject(){
		return {
			showKeys : this.showKeys,
			showClicks : this.showClicks,
			grid : this.grid,
			shadows : this.shadows,
			snapping : this.snapping,
			canvasBlur : this.canvasBlur,
			changeCursor : this.changeCursor,
			showLayersViewer : this.showLayersViewer,
			movingSilhouette : this.movingSilhouette
		}
	}
	fromObject(obj){
		each(obj, (e, i) => {
			this.setOpt(i, val);
		})
	}

	setOpt(key, val, setElement = true){
        let obj = this._options[key];
		if(setElement){
            let e = document.getElementById(obj.id);
			if(e){
				e[obj.attr] = val;
			}
		}

		if(key === "showLayersViewer"){
			//Entity.setAttr(Layers, "visible", val);
            Layers.visible = val;
		}
		
		Logger.log(getMessage(MSG_OPTION_CHANGE, key, val), LOGGER_CHANGE_OPTION);
		obj.val = val;
		draw();
	}
}