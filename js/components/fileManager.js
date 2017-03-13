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
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

	saveFile(name, text, type = "text/plain"){
		this._link.href = URL.createObjectURL(new Blob([text], {type: type}));
		this._link.download = name;
		this._link.click();
	}

	saveImage(name, image){
		this._link.href = isString(image) ? image : image.src;
		this._link.download = name;
		this._link.click();
	}

	loadImage(func){
		this._input.onchange = function(e){
            let reader = new FileReader();
			reader.onload = function(){
                let image = new Image();
				image.src = reader.result;
				func(image);
			};
			reader.readAsDataURL(e.target.files[0]);
		};
		this._input.click();
	}

	loadFile(func){
		this._input.onchange = function(e){
            let reader = new FileReader();
			reader.onload = () => func(reader.result);
			reader.readAsText(e.target.files[0]);
		};
		this._input.click();
	}


}

function saveFile(name, text, type){
	if(typeof type === "undefined"){
		type = "text/plain";
	}
	let file = new Blob([text], {type: type}),
		a   = document.getElementById("fileLink");

	a.href = URL.createObjectURL(file);
	a.download = name;
	a.click();
}

function saveImage(name, image){
    let a = document.getElementById("fileLink");
	a.href = image;
	a.download = name;
	a.click();
}

function loadImage(func){
    let el = document.getElementById("fileInput");
	el.onchange = function(e){
        let reader = new FileReader();
		reader.onload = function(){
            let image = new Image();
			image.src = reader.result;
			func(image);
		};
		reader.readAsDataURL(e.target.files[0]);
	};
	el.click();
}

function loadFile(func){
	//var el = document.getElementById("fileInput");
    let el = document.createElement("input");
	el.setAttribute("id", "fileInput");
	el.setAttribute("type", "file");
	el.setAttribute("value", "files");
	el.setAttribute("class", "hide");

	el.onchange = function(e){
        let reader = new FileReader();
		reader.onload = () => func(reader.result);
		reader.readAsText(e.target.files[0]);
	};
	el.click();
}


function saveSceneAsFile(params = {projectTitle: "scene_backup"}){
	/*
	var data = {
		scene: Project.scene.toObject(),
		creator: Project.creator.toObject(),
		paints: Paints.toObject(),
		type: 2500
	};
	*/

	saveFile(params.projectTitle, JSON.stringify(Project.toObject()));
}

function saveSceneAsTask(fileName = "default_task"){
    let result = {};

	if(Project.scene.getTaskObject(result)){
        let data = {
			scene: result.content,
			results:  result.results,
			title: fileName,
			type: 2501
		};
		saveFile(fileName, JSON.stringify(data));
	}
	else{
		Logger.error(getMessage(MSG_FILE_SAVE_ERROR, result.error));
	}
}

function loadTask(scene, results, title){
	if(Task){
		return Logger.error(getMessage(MSG_TASK_EXIST));
	}

    let layer = Scene.createLayer(title, "task");
	each(scene, e => {
		e.layer = layer.title;
		Project.creator.create(e);
	});
	Task = new TaskManager(results, title, layer);
	Logger.write(getMessage(MSG_TASK_CREATED, title));
}

function loadSceneFromFile(){
	loadFile(function(content){
		//try{
        let data = JSON.parse(content);
		if(data.type && data.type === 2501){
			loadTask(data.scene, data.results, data.title);
		}
		else{
			Project.fromObject(data);
			/*
			Project.scene.fromObject(data.scene);
			Project.creator.fromObject(data.creator);
			Paints.fromObject(data.paints);
			*/
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