class LogManager {
	constructor(){
		LogManager.LOGS 	= "logs";
		LogManager.WARNS 	= "warns";
		LogManager.ERRORS 	= "errors";

		this._logs = [];
		this._data = {};
		this._show = {};
		
		this._data[LogManager.LOGS]		= {};
		this._data[LogManager.WARNS]	= {};
		this._data[LogManager.ERRORS]	= {};

		this._show[LogManager.LOGS] = this._show[LogManager.WARNS] = this._show[LogManager.ERRORS] = true;
	}

	log(msg, type){
		let source = "unknown";
		try {
			throw new Error();
		}
		catch (e) { 
			source = e.stack.split("\n")[2].trim();
		}
		this._logs.push([Date.now(), msg, type, source]);
	}

	exception(msg, error){
		this.error(msg + ": " + error.stack);
	}

	write(msg){
		Alert.info(msg);
		this._data[LogManager.LOGS][Date.now()] = msg;
		if(this._show[LogManager.LOGS]){
			console.log(msg);
		}
	}

	error(msg, id){
		Alert.danger(msg);
		$.post("http://localhost:3000/logError", JSON.stringify({
			msg: msg,
			time: Date.now()
		}));
		this._data[LogManager.ERRORS][Date.now()] = msg;
		if(this._show[LogManager.ERRORS]){
			if(id){
				console.error(getErrorMessage(id) + msg);
			}
			else{
				console.error(typeof msg === "number" ? getErrorMessage(msg) : msg);
			}
		}
	}

	warn(msg){
		Alert.warning(msg);
		this._data[LogManager.WARNS][Date.now()] = msg;
		if(this._show[LogManager.WARNS]){
			console.warn(msg);
		}
	}


	showLogs(){
		let div = G("#showLogs");
		if(div.length() > 0){
			div.empty().append(FormManager.createTable(["Time", "Message", "Type", "Source"], this._logs));
			G("#showLogs").show();
    		G("#modalWindow").show();
		}
	}

	get data(){
		return this._data;
	}
}


let getErrorMessage = function(id){
    "use strict";
	switch(id){
		case 0 :
			return "Nezadaný parameter";
		case 1 :
			return "Neznáma Input akcia: ";
		case 2 :
			return "Neznáma Object akcia: ";
		case 3 :
			return "Neznáma Paint akcia: ";
		default :
			return "Neznáma chyba";
	}
};