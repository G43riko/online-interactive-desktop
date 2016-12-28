/*
	compatible: canvas, getElementByClassName, JSON parsing 14.9.2016
*/

//GLIB
var setAttr = (el, key, val) => {
	if(typeof key === "string")
		el.setAttribute(key, val);
	else if(typeof key === "object")
		for(var i in key)
			if(key.hasOwnProperty(i))
				el.setAttribute(i, key[i]);
	
	return el;
};

var append = function(element, content){
	if(typeof content === "object")
		element.appendChild(content);
	return element
};
var createEl = (type, attr, cont) => append(setAttr(document.createElement(type), attr), cont);
var createText = title => document.createTextNode(title);
var createIcon = text => createEl("i", {class: "material-icons"}, createText(text));

class G{
    constructor(el){
    	if(typeof el === "string")
    		this._e = document.querySelectorAll(el);
    	else
        	this._e = [el];
    }

    attr(key, val){
		for(var i in this._e)
			if(this._e.hasOwnProperty(i))
				G.setAttr(this._e[i], key, val);
        return this;
    }

    show(){
		for(var i in this._e)
			if(this._e.hasOwnProperty(i))
				this._e[i].style.display = "block";
        return this;
    }

    hide(){
		for(var i in this._e)
			if(this._e.hasOwnProperty(i))
				this._e[i].style.display = "none";
        return this;
    }

    append(el){
		for(var i in this._e)
			if(this._e.hasOwnProperty(i))
				this._e[i].appendChild(el);
        return this;
    }
    
    addClass(t){
		for(var i in this._e)
			if(this._e.hasOwnProperty(i) && this._e[i].style)
				this._e[i].classList ? this._e[i].classList.add(t) : this._e[i].className += ' ' + t;
        return this;
    }

    //STATIC

    static setAttr(el, key, val){
		if(typeof key === "string")
			el.setAttribute(key, val);
		else if(typeof key === "object")
			for(var i in key)
				if(key.hasOwnProperty(i))
					el.setAttribute(i, key[i]);
		
		return el;
	}
}


G.create = val => new G(document.createElement(val));
G.byId = val => new G(document.getElementById(val));
G.byTag = val => new G(val);
G.byClass = val => new G("." + val);

//SHOWERS

function showOptions(){
	G.byId("optionsForm").show();
    G.byId("modalWindow").show();
    G.byTag("canvas").addClass("blur");
}

function showXmlSavingOptions(){
	G.byId("idProjectTitle").attr("value", Project.title);
	G.byId("saveXmlForm").show();
    G.byId("modalWindow").show();
    G.byTag("canvas").addClass("blur");
}

function showColors(){
	G.byId("colorPalete").show();
    G.byId("modalWindow").show();
    G.byTag("canvas").addClass("blur");
}

function showSharingOptions(){
    G.byId("shareForm").show();
    G.byId("modalWindow").show();
    G.byTag("canvas").addClass("blur");
}

function showWatcherOptions(){
    G.byId("watchForm").show();
    G.byId("modalWindow").show();
    G.byTag("canvas").addClass("blur");
}

function showSavingOptions(){
	document.getElementById("idImageWidth").value = canvas.width;
	document.getElementById("idImageHeight").value = canvas.height;
	var div, el, counter = 0, parent = document.getElementById("layersSavionOptions");
	parent.innerHTML = "";
	each(Scene.layers, (a) => {
		div = document.createElement("div");

		el = document.createElement("input");
		el.setAttribute("type", "checkbox");
		el.setAttribute("class", "layerVisibility");
		el.setAttribute("id", "layer" + counter);
		el.setAttribute("checked", "true");

		el.setAttribute("name", a.title);
		div.appendChild(el);

		el = document.createElement("label");
		el.setAttribute("for", "layer" + (counter++));
		el.appendChild(document.createTextNode(a.title));
		div.appendChild(el);
		parent.appendChild(div);
	});

    G.byId("saveForm").show();
    G.byId("modalWindow").show();
    G.byTag("canvas").addClass("blur");
    /*
	$("#modalWindow ").find("#saveForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
	*/
}

//SERIALIZATORS

function serializeSaveData(){
	var getValueIfExist = (e, val = false) => e ? (e.type == "checkbox" ? e.checked : e.value) : val;
	var result = [];
	result["width"] = getValueIfExist(document.getElementById("idImageWidth"), canvas.width);
	result["height"] = getValueIfExist(document.getElementById("idImageHeight"), canvas.height);
	result["name"] = getValueIfExist(document.getElementById("idImageName"));
	result["background"] = getValueIfExist(document.getElementById("idBackground"), KEYWORD_TRANSPARENT);

	result["format"] = document.getElementById("idImageFormat");
	result["format"] = result["format"].options &&
		result["format"].selectedIndex &&
		result["format"].options[result["format"].selectedIndex] &&
		result["format"].options[result["format"].selectedIndex].value;

	var layerCheckboxes = document.getElementsByClassName("layerVisibility");
	result["selectedLayers"] = [];
	//musí byť tento for ináč to dá viackrát to isté
	for(var i=0 ; i < layerCheckboxes.length ; i++)
		layerCheckboxes[i].checked && result["selectedLayers"].push(layerCheckboxes[i].name);
	/*
	 for(var i=0 ; i<layerCheckboxes.length ; i++)
	 if(layerCheckboxes[i].checked)
	 result["selectedLayers"].push(layerCheckboxes[i].name);
	 */

	processImageData(result);
}

function serializeShareData(){
	var getValueIfExists = e => e ? (e.type == "checkbox" ? e.checked : e.value) : false;
	var result = {};
	//NEW
	result["user_name"] = getValueIfExists(document.getElementById("idUserName"));
	result["type"] = getValueIfExists(document.getElementById("idType"));
	result["limit"] = getValueIfExists(document.getElementById("idMaxWatchers"));

	//BOTH
	result["password"] = getValueIfExists(document.getElementById("idSharingPassword"));

	result["shareMenu"] = getValueIfExists(document.getElementById("idShareMenu"));
	result["sharePaints"] = getValueIfExists(document.getElementById("idSharePaints"));
	result["shareObjects"] = getValueIfExists(document.getElementById("idShareObjects"));
	result["shareCreator"] = getValueIfExists(document.getElementById("idShareCreator"));
	result["shareLayers"] = getValueIfExists(document.getElementById("idShareLayers"));
	result["shareTitle"] = getValueIfExists(document.getElementById("idShareTitle"));


	//OLD
	result["realTime"] = getValueIfExists(document.getElementById("idRealtimeSharing"));
	result["maxWatchers"] = getValueIfExists(document.getElementById("idMaxWatchers"));
	result["detailMovement"] = getValueIfExists(document.getElementById("idDetailMovement"));

	result["publicShare"] = getValueIfExists(document.getElementById("idPublicShare"));


	$.post("/checkConnectionData", {content: JSON.stringify(result)}, function(response){
		if(response.result > 0){
			closeDialog();
			Project.connection.connect(result);
		}
		else
			Alert.danger(response.msg);
	}, "JSON");

	//Sharer.startShare(result);
}

function serializeWatcherData(){
	var getValueIfExists = e => e ? (e.type == "checkbox" ? e.checked : e.value) : false;
	var result = {};
	//NEW
	result["user_name"]          = getValueIfExists(document.getElementById("idWatchUserName"));
	result["less_id"]          = getValueIfExists(document.getElementById("idLessonId"));
	//BOTH
	result["password"]          = getValueIfExists(document.getElementById("idWatchSharingPassword"));
	//OLD
	result["nickName"]          = getValueIfExists(document.getElementById("idNickName"));
	result["password"]          = getValueIfExists(document.getElementById("idSharingPassword"));
	result["timeLine"]          = getValueIfExists(document.getElementById("idShowTimeLine"));
	result["changeResolution"]  = getValueIfExists(document.getElementById("idChangeResolution"));
	result["showChat"]          = getValueIfExists(document.getElementById("idShowChat"));
	result["shareId"]           = getValueIfExists(document.getElementById("idShareId"));

	//result = processValues({}, "idNickName", "idSharingPassword", "idShowTimeLine", "idChangeResolution", "idShowChat", "idShareId")
	processWatchData(result);
	//Watcher = new WatcherManager(result);
}

function serializeSaveXmlData(){
	var processValues = (result, el, ...args) => {
		var process = item => {if(item) result[item.name] = item.type == "checkbox" ? item.checked : item.value};
		process(document.getElementById(el));
		each(args, e => process(document.getElementById(e)));
		return result;
	};
	saveSceneAsFile(processValues({}, "idProjectTitle", "idSaveCreator", "idSavePaint", "idSaveTask", "idTaskHint", "idTaskTimeLimit", "idSaveHistory", "idStoreStatistics"));
}

//PROCESSORS

function processWatchData(data){
	var checkData = {
		shareId: data["shareId"],
		nickName: data["nickName"],
		password: data["password"]
	};
	var form = document.createElement("form"),
		createInput = (name, value) => {
			var el = document.createElement("input");
			el.value = value;
			el.name = name;
			return el;
		};
	data["innerWidth"] = window.innerWidth;
	data["innerHeight"] = window.innerHeight;
	data["type"] = "watch";
	$.post("/checkConnectionData", {content: JSON.stringify(data)}, function(response){
		if(response["result"] > 0){
			closeDialog();
			data["type"] = response["type"];
			Project.connection.connect(data);
		}
		else
			Alert.danger(response.msg);
	}, "JSON");
	/*
	$.post("/checkWatchData", {content: JSON.stringify(data)}, function(response){
		if(response.result > 0){
			location.href = "/watch?id=" + data["shareId"] + "&userId=" + response["userId"];
			return;
			document.body.appendChild(form);
			form.appendChild(createInput("content", JSON.stringify(data)));
			form.style.display = "none";
			form.method = "POST";
			form.action = "/watch?id=" + data["shareId"] + "&userId=" + response["userId"];
			form.submit();
		}
		else
			Alert.danger(response.msg);
	}, "JSON");
	*/
	return false;

	/*
	for(var i in data)
		if(data.hasOwnProperty(i))
			form.appendChild(createInput(i, data[i]));
	*/
	document.body.appendChild(form);
	form.appendChild(createInput("content", JSON.stringify(data)));
	form.style.display = "none";
	form.method = "POST";
	form.action = "/watch?id=" + data["shareId"];
	form.submit();
	//document.body.removeChild(form);
}

function processImageData(data){
	data["name"] = isString(data["name"]) || "desktopScreen";
	data["format"] = isString(data["format"]) || IMAGE_FORMAT_PNG;
	data["width"] = data["width"] || canvas.width;
	data["height"] = data["height"] || canvas.height;
	data["selectedLayers"] = data["selectedLayers"] || [];


	/*
	 * velký canvas kde sa všetko nakreslí
	 */
	var ca = document.createElement("canvas");
	ca.width = canvas.width;
	ca.height = canvas.height;
	var resContext = ca.getContext("2d");

	/*
	 * prekreslí pozadie ak je nastavene a nieje priesvitné
	 */
	if(isString(data["background"]) && data["background"] !== KEYWORD_TRANSPARENT){
		doRect({
			x: 0,
			y: 0,
			width: ca.width,
			height: ca.height,
			fillColor: data["background"],
			ctx: resContext
		});
	}
	/*
	 * Vykreslí vrstvy určené na vykresleni
	 */
	for(var i in data["selectedLayers"]){
		if(data["selectedLayers"].hasOwnProperty(i))
			Scene.getLayer(data["selectedLayers"][i]).draw(resContext);
	}


	/*
	 * malý canvas kde sa prekreslí velký canvas
	 */
	var resCanvas =  document.createElement("canvas");
	resCanvas.width = data["width"];
	resCanvas.height = data["height"];
	resContext = resCanvas.getContext("2d");
	resContext.drawImage(ca, 0, 0, resCanvas.width, resCanvas.height);


	/*
	 * uloženie súboru
	 */
	Files.saveImage(data["name"], resCanvas.toDataURL(data["format"]));
	closeDialog();
}

//UTILS

var processValues = (result, el, ...args) => {
	var process = item => {if(item) result[item.name] = item.type == "checkbox" ? item.checked : item.value};
	process(document.getElementById(el));
	each(args, e => process(document.getElementById(e)));
	return result;
}

function shareALl(el){
	Options.setOpt("grid", el.checked);
	document.getElementById("idShareMenu").checked = el.checked;
	document.getElementById("idSharePaints").checked = el.checked;
	document.getElementById("idShareObjects").checked = el.checked;
	document.getElementById("idShareCreator").checked = el.checked;
	document.getElementById("idShareLayers").checked = el.checked;
}

class GuiManager{
	constructor(){

	}

	showOptionsByComponents(){
		var setDisabledIfExist = (id, value) =>{
			var el = document.getElementById(id);
			if(el)
				el.parentElement.style.display = value ? "block" : "none";
		}

		setDisabledIfExist("idAllowedSnapping", Components.edit());
		setDisabledIfExist("idShadows", Components.edit());
		setDisabledIfExist("idShowLayersViewer", Components.layers());
		setDisabledIfExist("idMovingSilhouette", Components.edit());

	}
}