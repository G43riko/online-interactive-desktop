Input = {
	keys: [],
	timer: false,
	presPosition: false,
	button: [],
	keyDown: function(val){
		this.keys[val] = true;
	},
	keyUp: function(val){
		this.keys[val] = false;
	},
	isKeyDown: function(val){
		return this.keys[val];
	},
	pressCheck: function(button){
		canvas.onmousepress({
			position: Input.presPosition,
			button: button
		});
	},
	mouseMove: function(val){
		if(this.timer)
			if(this.presPosition.dist(val.offsetX, val.offsetY) > TOUCH_VARIATION)
				clearTimeout(this.timer);
	},
	buttonDown: function(val){
		this.button[val.button] = true;
		if (this.timer)
			clearTimeout(this.timer);
		this.timer = setTimeout(function(){Input.pressCheck(val.button)}, TOUCH_DURATION); 
		this.presPosition = new GVector2f(val.offsetX, val.offsetY);
	},
	buttonUp: function(val){
		if (this.timer)
			clearTimeout(this.timer);
		this.button[val.button] = false;
	},

	isButtonDown: function(val){
		return this.button[val];
	}
}