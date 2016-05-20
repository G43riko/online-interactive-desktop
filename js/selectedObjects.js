selectedObjects = {
	objects: [],
	size: function(){
		return this.objects.length;
	},
	add: function(o){
		this.objects.push(o);
		o.selected = true;

		updateSelectedObjectView(o);
		$("#cont_select_obj div").show();
	},
	get: function(i){
		return this.objects.hasOwnProperty(i) ? this.objects[i] : false;
	},
	clear: function(){
		$("#cont_select_obj div").hide();
		for(var j in this.objects)
			this.objects[j].selected = false;
		this.objects = [];
	},
	clearAndAdd: function(o){
		this.clear();
		this.add(o);
	},
	forEach: function(e){
		for(var j in this.objects)
			if(e(this.objects[j]))
				return true;
		return false;
	},
	getLast: function(){
		if(this.size() == 0)
			return false;
		return this.objects[this.size() - 1];
	}
}