class TaskManager{
	constructor(results, title, layer){
		this._title = title;
		this._results = results;
		this._layer = layer;
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
	}
}