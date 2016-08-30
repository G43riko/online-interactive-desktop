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

function shadeColor1(color, percent) {  // deprecated. See below.
	var num = parseInt(color.slice(1), 16),
		amt = Math.round(2.55 * percent), 
		R = (num >> 16) + amt, 
		G = (num >> 8 & 0x00FF) + amt,
		B = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
							  (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
							  (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function hexToRGBA(color) {
	var num = parseInt(color.slice(1), 16);
	return [num >> 16, num >> 8 & 0x00FF, num & 0x0000FF];
}
