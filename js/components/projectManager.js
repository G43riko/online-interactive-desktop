class ProjectManager{
	constructor(title = "Default Title"){
		this._createdAt = Date.now();
		this._title = title;
	}


	get title(){return this._title;}

	get time(){return Date.now() - this._createdAt; }
}