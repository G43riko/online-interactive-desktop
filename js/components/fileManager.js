/*
	compatible: blob constructing, File API, FileReader API, JSON parsing 14.9.2016
*/
class FileManager{
	constructor(){
		this._input = document.createElement("input");
		this._input.setAttribute("type", "file");
		this._input.setAttribute("value", "files");
		this._input.setAttribute("class", "hide");

		this._link = document.createElement("a");
		this._link.setAttribute("class", "hide");
		this._link.setAttribute("href", "");
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}

	saveFile(name, text, type = "text/plain"){
		this._link.href = URL.createObjectURL(new Blob([text], {type: type}));
		this._link.download = name;
		this._link.click();
	}

	saveImage(name, image){
		this._link.href = typeof image === "string" ? image : image.src;
		this._link.download = name;
		this._link.click();
	}

	loadImage(func){
		this._input.onchange = function(e){
			var reader = new FileReader();
			reader.onload = function(){
				var image = new Image();
				image.src = reader.result;
				func(image);
			};
			reader.readAsDataURL(e.target.files[0]);
		};
		this._input.click();
	}

	loadFile(func){
		this._input.onchange = function(e){
			var reader = new FileReader();
			reader.onload = () => func(reader.result);
			reader.readAsText(e.target.files[0]);
		};
		this._input.click();
	}


}

function saveFile(name, text, type){
	if(typeof type === "undefined")
		type = "text/plain";
	var file = new Blob([text], {type: type}),
		a   = document.getElementById("fileLink");

	a.href = URL.createObjectURL(file);
	a.download = name;
	a.click()
}

function saveImage(name, image){
	var a = document.getElementById("fileLink");
	a.href = image;
	a.download = name;
	a.click();
}

function loadImage(func){
	var el = document.getElementById("fileInput");
	el.onchange = function(e){
		var reader = new FileReader();
		reader.onload = function(){
			var image = new Image();
			image.src = reader.result;
			func(image);
		};
		reader.readAsDataURL(e.target["files"][0]);
	};
	el.click();
}

function loadFile(func){
	//var el = document.getElementById("fileInput");
	var el = document.createElement("input");
	el.setAttribute("id", "fileInput");
	el.setAttribute("type", "file");
	el.setAttribute("value", "files");
	el.setAttribute("class", "hide");

	el.onchange = function(e){
		var reader = new FileReader();
		reader.onload = () => func(reader.result);
		reader.readAsText(e.target["files"][0]);
	};
	el.click();
}


function saveSceneAsFile(data = {projectTitle: "scene_backup"}){
	console.log(data);
	var data = {
		scene: Scene.toObject(),
		creator: Creator.toObject(),
		paints: Paints.toObject(),
		type: 2500
	};

	saveFile(data.projectTitle, JSON.stringify(data));
}

function saveSceneAsTask(fileName = "default_task"){
	var result = {};

	if(Scene.getTaskObject(result)){
		var data = {
			scene: result.content,
			results:  result.results,
			title: fileName,
			type: 2501
		};
		saveFile(fileName, JSON.stringify(data));
	}
	else{
		Logger.error("Chyba pri ukladaní súboru: ", result.error);
	}
}

function loadTask(scene, results, title){
	if(Task)
		return Logger.error(getMessage(MSG_TASK_EXIST));

	var layer = Scene.createLayer(title, "task");
	each(scene, e => {
		e.layer = layer.title;
		Creator.create(e);
	});
	Task = new TaskManager(results, title, layer);
	Logger.write(getMessage(MSG_TASK_CREATED, title));
}

function loadSceneFromFile(){
	loadFile(function(content){
		//try{
		var data = JSON.parse(content);
		if(data["type"] && data["type"] === 2501)
			loadTask(data["scene"], data["results"], data["title"]);
		else{
			Scene.fromObject(data.scene);
			Creator.fromObject(data.creator);
			Paints.fromObject(data.paints);
		}
		draw();
		/*
		 }
		 catch(err){
		 Logger.error("nepodarilo sa načítať súbor s dôvodu: ", err);
		 }
		 */
	});
}