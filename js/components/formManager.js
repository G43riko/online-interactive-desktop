/**
 * Created by Gabriel on 29. 10. 2016.
 */

class FormManager{
	constructor(data){
		this._data = data;
		this._allowerAttributes = ["id", "style", "name", "value", "onclick", "onchange", "placeholder"]
	}

	createForm(id){
		return this._generateForm(this._data[id]);
	}

	static _setAllCheckedAttributes(element, allowedAttributes, data){
		for(var i in allowedAttributes)
			if(allowedAttributes.hasOwnProperty(i) && data[allowedAttributes[i]])
				element.setAttribute(allowedAttributes[i], data[allowedAttributes[i]]);
	}

	_createInput(data, isChildren = false){
		var result = document.createElement("div"),
			i, input;
		if(isIn(data["type"], "checkbox", "multiCheckbox") && !isChildren)
			result.setAttribute("class", "panel");

		if(data["label"] && data["id"] && !isChildren)
			result.innerHTML += '<label for="' + data["id"] + '">' + data["label"] + ': </label>';

		if(data["type"] === "multiCheckbox"){
			var title = document.createElement("div");
			title.appendChild(document.createTextNode(data["label"]));
			result.appendChild(title);

			var container = document.createElement("div");
			for(i in data["items"])
				if(data["items"].hasOwnProperty(i))
					container.appendChild(this._createInput(data["items"][i], true));

			result.appendChild(container);
		}
		else if(data["type"] == "wrapper"){
			var wrapper = document.createElement("div");
			FormManager._setAllCheckedAttributes(wrapper, this._allowerAttributes, data);

			for(i in data["items"])
				if(data["items"].hasOwnProperty(i))
					wrapper.appendChild(this._createInput(data["items"][i]));
			result.appendChild(wrapper);
		}
		else if(data["type"] === "combobox"){
			input = document.createElement("select");

			FormManager._setAllCheckedAttributes(input, this._allowerAttributes, data);

			if(data["disabled"] === true)
				input.setAttribute("disabled", data["disabled"]);

			for(i in data["options"])
				if(data["options"].hasOwnProperty(i)){
					var option = document.createElement("option");
					option.value = data["options"][i].value;
					option.appendChild(document.createTextNode(data["options"][i].label));
					input.appendChild(option);
				}
			result.appendChild(input);
		}
		else if(data["type"] === "plainText"){
			result.innerHTML += data["text"];
		}
		else{
			input = document.createElement("input");
			input.setAttribute("type", data["type"]);
			if(typeof data["checked"] === "boolean")
				input.setAttribute("checked", data["checked"]);

			FormManager._setAllCheckedAttributes(input, this._allowerAttributes, data);

			result.appendChild(input);
		}
		if(isChildren)
			result.innerHTML += '<label for="' + data["id"] + '">' + data["label"] + ': </label>';

		return result;
	}
	_generateForm(form){
		var result = document.createElement("form");
		result.innerHTML += "<h2>" + form.title + "</h2><br/>";

		for(var i in form.elements)
			if(form.elements.hasOwnProperty(i))
				result.appendChild(this._createInput(form.elements[i]));


		return result;
	}
}