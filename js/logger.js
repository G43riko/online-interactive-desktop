var Logger = {
	error:  function(msg){
		var e = new Error(msg);
		console.log("nastala chyba: " + e + ", kde: " + e.stack);
	}
}