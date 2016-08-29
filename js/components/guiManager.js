function showOptions(){
	$("#modalWindow ").find("#optionsForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function showColors(){
	$("#modalWindow ").find("#colorPalete").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function shareALl(el){
	Options.setOpt("grid", el.checked);
	document.getElementById("idShareMenu").checked = el.checked;
	document.getElementById("idSharePaints").checked = el.checked;
	document.getElementById("idShareObjects").checked = el.checked;
	document.getElementById("idShareCreator").checked = el.checked;
	document.getElementById("idShareLayers").checked = el.checked;
}

function showSharingOptions(){
	$("#modalWindow ").find("#shareForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
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

	$("#modalWindow ").find("#saveForm").show();
	$("#modalWindow").show();
	$("canvas").addClass("blur");
}

function serializeSaveData(){
	var getValueIfExist = (e, val = false) => e ? (e.type == "checkbox" ? e.checked : e.value) : val;
	var result = [];
	result["width"] = getValueIfExist(document.getElementById("idImageWidth"), canvas.width);
	result["height"] = getValueIfExist(document.getElementById("idImageHeight"), canvas.height);
	result["name"] = getValueIfExist(document.getElementById("idImageName"));

	result["format"] = document.getElementById("idImageFormat");
	result["format"] = result["format"].options &&
		result["format"].selectedIndex &&
		result["format"].options[result["format"].selectedIndex] &&
		result["format"].options[result["format"].selectedIndex].value;

	var layerCheckboxes = document.getElementsByClassName("layerVisibility");
	result["selectedLayers"] = [];
	each(layerCheckboxes, e => e.checked && result["selectedLayers"].push(e.name));
	/*
	 for(var i=0 ; i<layerCheckboxes.length ; i++)
	 if(layerCheckboxes[i].checked)
	 result["selectedLayers"].push(layerCheckboxes[i].name);
	 */

	//TODO načítať farbu pozadia
	result["background"] = KEYWORD_TRANSPARENT;

	processImageData(result);
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
		if(data["selectedLayers"].hasOwnProperty(i)){
			//TODO vykreslenie jednotlivých vrstiev
		}
	}

	//TODO toto zakomentovať lebo to prekresluje všetko
	resContext.drawImage(canvas, 0, 0);

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

function serializeShareData(){
	var getValueIfExists = e => e ? (e.type == "checkbox" ? e.checked : e.value) : false;
	var result = {};
	result["realTime"] = getValueIfExists(document.getElementById("idRealtimeSharing"));
	result["maxWatchers"] = getValueIfExists(document.getElementById("idMaxWatchers"));
	result["password"] = getValueIfExists(document.getElementById("idSharingPassword"));
	result["detailMovement"] = getValueIfExists(document.getElementById("idDetailMovement"));

	result["shareMenu"] = getValueIfExists(document.getElementById("idShareMenu"));
	result["sharePaints"] = getValueIfExists(document.getElementById("idSharePaints"));
	result["shareObjects"] = getValueIfExists(document.getElementById("idShareObjects"));
	result["shareCreator"] = getValueIfExists(document.getElementById("idShareCreator"));
	result["shareLayers"] = getValueIfExists(document.getElementById("idShareLayers"));
	
	closeDialog();
	Sharer.startShare(result);
}