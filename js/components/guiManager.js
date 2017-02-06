/*
	compatible: canvas, getElementByClassName, JSON parsing 14.9.2016
*/

//SHOWERS

var showPanel = function(id){
	G("#" + id).show();
	G("#modalWindow").show();
	G("canvas").addClass("blur");
}

var showOptions 			= () => showPanel("optionsForm");
var showColors				= () => showPanel("colorPalete");
var showWatcherOptions		= () => showPanel("watchForm");
var showSharingOptions		= () => showPanel("shareForm");
var showXmlSavingOptions	= () => {
	G("#idProjectTitle").val(Project.title);
	showPanel("saveXmlForm");
};

function showSavingOptions(){
	G("#idImageWidth").val(canvas.width);
	G("#idImageHeight").val(canvas.height);
	var div, el1, el2, counter = 0, parent = G("#layersSavionOptions").empty();
	each(Scene.layers, a => {
		el1 = new G("input", {attr : {
				type : "checkbox",
				class : "layerVisibility",
				id : "layer" + counter,
				checked : true,
				name: a.title
		}});

		el2 = new G("label", {
			attr : {for: "layer" + counter++},
			cont : a.title
		});
		
		parent.append(new G("div", {cont: [el1, el2]}));
	});

	G("#saveForm").show();
	G("#modalWindow").show();
	G("canvas").addClass("blur");
}

//SERIALIZATORS

function serializeSaveData(){
	var getValueIfExist = (e, val = false) => e ? (e.type == "checkbox" ? e.checked : e.value) : val;
	var result = [];
	result["width"]			= getValueIfExist(G.byId("idImageWidth"), canvas.width);
	result["height"]		= getValueIfExist(G.byId("idImageHeight"), canvas.height);
	result["name"]			= getValueIfExist(G.byId("idImageName"));
	result["background"]	= getValueIfExist(G.byId("idBackground"), KEYWORD_TRANSPARENT);

	result["format"] = 	G.byId("idImageFormat");
	result["format"] =	result["format"].options &&
						result["format"].selectedIndex &&
						result["format"].options[result["format"].selectedIndex] &&
						result["format"].options[result["format"].selectedIndex].value;

	var layerCheckboxes = G.byClass("layerVisibility");
	result["selectedLayers"] = [];
	//musí byť tento for ináč to dá viackrát to isté
	for(var i=0 ; i < layerCheckboxes.length ; i++){
		layerCheckboxes[i].checked && result["selectedLayers"].push(layerCheckboxes[i].name);
	}

	processImageData(result);
}

function serializeShareData(){
	var getValueIfExists = e => e ? (e.type == "checkbox" ? e.checked : e.value) : false;
	var result = {};
	//NEW
	result["user_name"]		= getValueIfExists(G.byId("idUserName"));
	result["type"]			= getValueIfExists(G.byId("idType"));
	result["limit"]			= getValueIfExists(G.byId("idMaxWatchers"));
	//BOTH
	result["password"]		= getValueIfExists(G.byId("idSharingPassword"));

	result["shareMenu"]		= getValueIfExists(G.byId("idShareMenu"));
	result["sharePaints"]	= getValueIfExists(G.byId("idSharePaints"));
	result["shareObjects"]	= getValueIfExists(G.byId("idShareObjects"));
	result["shareCreator"]	= getValueIfExists(G.byId("idShareCreator"));
	result["shareLayers"]	= getValueIfExists(G.byId("idShareLayers"));
	result["shareTitle"]	= getValueIfExists(G.byId("idShareTitle"));

	
	//OLD
	/*
	result["realTime"] = getValueIfExists(G.byId("idRealtimeSharing"));
	result["maxWatchers"] = getValueIfExists(G.byId("idMaxWatchers"));
	result["detailMovement"] = getValueIfExists(G.byId("idDetailMovement"));

	result["publicShare"] = getValueIfExists(G.byId("idPublicShare"));
	*/

	$.post("/checkConnectionData", {content: JSON.stringify(result)}, function(response){
		if(response.result > 0){
			closeDialog();
			Project.connection.connect(result);
		}
		else{
			Logger.error(response.msg)
		}
	}, "JSON");

	//Sharer.startShare(result);
}

function serializeWatcherData(){
	var getValueIfExists = e => e ? (e.type == "checkbox" ? e.checked : e.value) : false;
	var result = {};
	//NEW
	result["user_name"]			= getValueIfExists(G.byId("idWatchUserName"));
	result["less_id"]			= getValueIfExists(G.byId("idLessonId"));
	//BOTH
	result["password"]			= getValueIfExists(G.byId("idWatchSharingPassword"));
	//OLD
	result["nickName"]			= getValueIfExists(G.byId("idNickName"));
	result["password"]			= getValueIfExists(G.byId("idSharingPassword"));
	result["timeLine"]			= getValueIfExists(G.byId("idShowTimeLine"));
	result["changeResolution"]	= getValueIfExists(G.byId("idChangeResolution"));
	result["showChat"]			= getValueIfExists(G.byId("idShowChat"));
	result["shareId"]			= getValueIfExists(G.byId("idShareId"));

	//result = processValues({}, "idNickName", "idSharingPassword", "idShowTimeLine", "idChangeResolution", "idShowChat", "idShareId")
	processWatchData(result);
	//Watcher = new WatcherManager(result);
}

function serializeSaveXmlData(){
	var processValues = (result, el, ...args) => {
		var process = item => {if(item) result[item.name] = item.type == "checkbox" ? item.checked : item.value};
		process(G.byId(el));
		each(args, e => process(G.byId(e)));
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
	var form = G.createElement("form"), createInput = (name, value) => {
			return createElement({name: "input", attr: {value: value, name: name}});
	};
	data["innerWidth"] = window.innerWidth;
	data["innerHeight"] = window.innerHeight;
	data["type"] = "watch";
	$.post("/checkConnectionData", {content: JSON.stringify(data)}, function(response){
		if(response["result"] > 0){
			closeDialog();
			data["type"] = response["type"];
			if(data["type"] === "exercise"){ //pri exercise chceme aby to čo sa má zdielať nastavoval zakladatel
				data["sharePaints"]		= response["sharePaints"];
				data["shareInput"]		= response["shareInput"];
				data["shareCreator"]	= response["shareCreator"];
				data["shareLayers"]		= response["shareLayers"];
				data["shareObjects"]	= response["shareObjects"];
			}
			Project.connection.connect(data);
		}
		else{
			Logger.error(Alert.danger(response.msg));
		}
	}, "JSON");
}

function processImageData(data){
	data["name"]			= isString(data["name"])	|| "desktopScreen";
	data["format"]			= isString(data["format"])	|| IMAGE_FORMAT_PNG;
	data["width"]			= data["width"]				|| canvas.width;
	data["height"]			= data["height"]			|| canvas.height;
	data["selectedLayers"]	= data["selectedLayers"]	|| [];


	/*
	 * velký canvas kde sa všetko nakreslí
	 */
	var ca = G("canvas", {attr: {width: canvas.width, height: canvas.height}}).first();
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
			Scene.getLayer(data["selectedLayers"][i]).draw(resContext);
		}
	}


	/*
	 * malý canvas kde sa prekreslí velký canvas
	 */
	 var resCanvas = G("canvas", {attr: {width: data.width, height: data.height}}).first();

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
	var process = item => {
		if(item){
			result[item.name] = item.type == "checkbox" ? item.checked : item.value
		}
	};
	process(G.byId(el));
	each(args, e => process(G.byId(e)));
	return result;
}

function shareALl(el){
	Options.setOpt("grid", el.checked);
	G.byId("idShareMenu").checked = el.checked;
	G.byId("idSharePaints").checked = el.checked;
	G.byId("idShareObjects").checked = el.checked;
	G.byId("idShareCreator").checked = el.checked;
	G.byId("idShareLayers").checked = el.checked;
}

class GuiManager{
	constructor(){
		this._topMenu = new MenuManager();
		this._actContextMenu = null;
	}

	get menu(){
		return this._topMenu;
	}
	get contextMenu(){
		return this._actContextMenu;
	}

	showOptionsByComponents(){
		var setDisabledIfExist = (id, value) =>{
			var el = G.byId(id);
			if(el){
				el.parentElement.style.display = value ? "block" : "none";
			}
		}

		setDisabledIfExist("idAllowedSnapping", Components.edit());
		setDisabledIfExist("idShadows", Components.edit());
		setDisabledIfExist("idShowLayersViewer", Components.layers());
		setDisabledIfExist("idMovingSilhouette", Components.edit());

	}
}