

function pickUpColor(func, thisArg){
	var T;
	if (arguments.length > 1)
		T = thisArg;
	$("#colorPalete").delegate(".colorPatern", "click", function(){
		$(".selected").removeClass("selected");
		func.call(T, $(this).addClass("selected").css("backgroundColor"));
		closeDialog();
		draw();
	});
	showColors();
}