
class ConfigManager{
	constructor(){
		this._options = {};
		this._templates = {};
	}

	static setConstants(data){
		var manager = new ConfigManager();
		manager.loadOptions(data);
		for(var key in manager._options){
			//console.log(key);
			if(manager._options.hasOwnProperty(key)){
				if(key == "layers_border_color"){
					console.log("aaaaaaaa");
				}
				Object.defineProperty(window, key.toUpperCase(), {
					value : manager._options[key], 
					writable: false
				});
			}
		}
	}

	loadOptions(data, key = ""){
		var i, actualKey, patt = new RegExp("^<%= .* %>$");

		for(i in data){
			if(data.hasOwnProperty(i)){
				actualKey = key ? key + "_" : "";
				if(i.charAt(0) === "!"){
					actualKey = i.substr(1);	
				}
				else{
					actualKey += i;
				}
				
				if(typeof data[i] === "object"){
					this.loadOptions(data[i], actualKey);
				}
				else{
					if(patt.test(data[i])){
						this._templates[actualKey] = data[i];
					}
					this._options[actualKey] = data[i];
				}
			}
		}
		if(key === ""){//ak je prvá iterácia tak opraví všetky templaty
			for(i in this._templates){
				if(this._templates.hasOwnProperty(i)){
					var value = this._templates[i];
					value = value.substring(4, value.length - 3);
					key = value.replace(/\./g, "_");
					if(this._options.hasOwnProperty(key)){
						this._options[i] = this._options[key];
					}
					delete this._templates[i];
					
				}
			}
		}
	}

	setOption(key, value){
		this._options[key] = value;
	}

	get data(){
		return this._options;
	}
}
/*

var data = {
	"a" : "gabo",
	"key" : {
		"!b" : "66",
		"a" : 65,
		"delete" : 46,
		"enter" : 13,
		"escape" : 27,
		"l_alt"   : 18,
		"l_ctrl"     : 17,
		"shift" : 16,
		"y" : 89,
		"z" : "<%= font.halign.center %>"
	},
	"font" : {
		"halign" : {
			"left" : "left",
			"center" : "center",
			"right" : "right"
		},
		"valign" : {
			"middle" : "middle",
			"top" : "top",
			"alpha" : "aplhabetic",
			"hang" : "hanging",
			"ideo" : "ideographics", 
			"bott" : "bottom"
		}
	},
	"line" : {
		"cap" : {
			"butt" : "butt",
			"round" : "round",
			"square" : "square"
		},
		"join" : {
			"mitter" : "mitter",
			"round" : "round",
			"bevel" : "bevel"
		},
		"type" : {
			"linear" : 2000,
			"bazier" : 2001,
			"sequencal" : 2002
		},
		"style" : {
			"normal" : 2100,
			"stripped" : 2101,
			"filled" : 2102
		}
	}
};


var getOptions = (function(){
	var config = new ConfigManager();
	var isset = false;
	var settable = false;
	return function(arg1, arg2){
		if(typeof arg1 === "string"){
			return config._options[arg1];
		}
		if(typeof arg1 === "object" && !isset){
			isset = true;
			config.loadOptions(arg1);
			console.log(config.data);
		}
		if(arguments.length == 2 && settable){
			config.setOption(arg1, arg2);
		}
	};
})();
*/