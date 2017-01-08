/**
 * Created by Gabriel on 29. 10. 2016.
 */
 function createTable(titles, data){
	var row = G("tr", {}), tbl = new G("table", {
		attr: {border: "1"}, 
		style: {borderCollapse : "collapse",width: "100%"}
	});
	for(let title of titles){
		row.append(new G("td", {cont: title, style: {padding: "5px", fontWeight: "bold", textAlign: "center"}}));
	}
	tbl.append(row);
	for(var i in data){
		row = G("tr", {});
		for(var j in data[i]){
			row.append(new G("td", {
				style: {padding: "5px"},
				cont: j != 0 ? data[i][j] : getFormattedDate(data[i][j])
			}));
		}
		tbl.append(row);
	}
	return tbl;
}

class FormManager{
	constructor(data){
		this._data = data;
		this._allowerAttributes = ["id", "style", "name", "value", "onclick", "onchange", "placeholder", "disabled", "visible"]
	}

	createForm(id){
		return this._generateForm(this._data[id]);
	}

	static _setAllCheckedAttributes(element, allowedAttributes, data){
		for(var i in allowedAttributes){
			if(allowedAttributes.hasOwnProperty(i) && data[allowedAttributes[i]]){
				element.setAttribute(allowedAttributes[i], data[allowedAttributes[i]]);
			}
		}
	}

	_createInput(data, isChildren = false){
		if(data["visible"] === false)
			return null;
		var i, input, result = new G("div", {});

		if(isIn(data["type"], "checkbox", "multiCheckbox") && !isChildren){
			result.attr("class", "panel");
		}

		if(data["label"] && data["id"] && !isChildren){
			result.append('<label for="' + data["id"] + '">' + data["label"] + ': </label>');
		}

		if(data["type"] === "multiCheckbox"){
			result.append(G.createElement("div", {cont: data["label"]}));
			var container = new G("div", {});

			for(i in data["items"]){
				if(data["items"].hasOwnProperty(i)){
					container.append(this._createInput(data["items"][i], true));
				}
			}

			result.append(container);
		}
		else if(data["type"] == "wrapper"){
			var wrapper = new G("div", {});
			FormManager._setAllCheckedAttributes(wrapper.first(), this._allowerAttributes, data);

			for(i in data["items"]){
				if(data["items"].hasOwnProperty(i)){
					wrapper.append(this._createInput(data["items"][i]));
				}
			}
			result.append(wrapper);
		}
		else if(data["type"] === "combobox"){
			input = new G("select", {});

			FormManager._setAllCheckedAttributes(input.first(), this._allowerAttributes, data);

			if(data["disabled"] === true){
				input.attr("disabled", data["disabled"]);
			}

			for(i in data["options"]){
				if(data["options"].hasOwnProperty(i)){
					input.append(G.createElement("option", {value: data["options"][i].value}, data["options"][i].label));
				}
			}
			result.append(input);
		}
		else if(data["type"] === "plainText"){
			result.append(data["text"]);
		}
		else{
			input = new G("input", {attr: {type: data["type"]}});
			if(typeof data["checked"] === "boolean"){
				input.attr("checked", data["checked"]);
			}

			FormManager._setAllCheckedAttributes(input.first(), this._allowerAttributes, data);

			result.append(input);
		}
		if(isChildren){
			result.append('<label for="' + data["id"] + '">' + data["label"] + ': </label>');
		}

		return result.first();
	}

	_generateForm(form){
		var result = new G("form", {cont: "<h2>" + form.title + "</h2><br/>"});

		for(var i in form.elements){
			if(form.elements.hasOwnProperty(i)){
				var element = this._createInput(form.elements[i]);
				if(element){
					result.append(element);
				}
			}
		}

		return result.first();
	}
}