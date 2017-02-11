var Alert = {
	_closeParent: function(el){
		el.parentElement.style.opacity = 0;
		setTimeout(() => {
			if(el.parentElement.parentElement !== null){
				el.parentElement.parentElement.removeChild(el.parentElement);
			}
		}, 300);
	},
	success: (text, time = 5000) => Alert._showAlert(text, "success", time),
	warning: (text, time = 5000) => Alert._showAlert(text, "warning", time),
	danger: (text, time = 5000) => Alert._showAlert(text, "danger", time),
	info: (text, time = 5000) => Alert._showAlert(text, "info", time),
	_showAlert: function(text, type, time){
		if(typeof document === "undefined" || typeof  document.body === "undefined"){
			return false;
		}
		var createElement = function(name, params, text){
			var el = document.createElement(name);
			if(typeof params === "object"){
				for(var i in params){
					if(params.hasOwnProperty(i)){
						el.setAttribute(i, params[i]);
					}
				}
			}
			typeof text === "string" && el.appendChild(document.createTextNode(text));
			return el;
		};
		var div = createElement("div",{class: "alert alert-" + type});
		var a = createElement("a", {
			onclick: "Alert.removeEvent(event)",
			class: "close"
		}, "×");

		switch(type){
			case "success":
				type = "success! ";
				break;
			case "info":
				type = "Info! ";
				break;
			case "warning":
				type = "Warning! ";
				break;
			case "danger":
				type = "Danger! ";
				break;
		}

		div.appendChild(createElement(  "strong", {}, type));
		div.appendChild(a);
		if(typeof text === "string"){
			div.appendChild(document.createTextNode(text));
		}
		else{
			div.appendChild(text);
		}
		document.body.appendChild(div);
		setTimeout(() => Alert.removeEvent({target: a}), time);
	},

	removeEvent: function(event){
		Alert._closeParent(event.target);
		return false;
	},
	show: function(){
		Alert._showAlert("warningoš", "warning");
		Alert._showAlert("successoš", "success");
		Alert._showAlert("infoš", "info");
		Alert._showAlert("dangeroš", "danger");
	}
};