class LogManager {
	error(msg){
		var e = new Error(msg);
		console.log("nastala chyba: " + e + ", kde: " + e.stack);
	}
	warn(msg){
		console.warn(msg);
	}
}