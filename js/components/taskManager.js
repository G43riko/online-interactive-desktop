/*
	compatible:	14.9.2016
*/
class TaskManager{
	constructor(results, title, layer){
		this._title 		= title;
		this._layer 		= layer;
		this._resultCount 	= 0;
		this._results 		= {};
		this._start 		= Date.now();

		each(results, (e, i) =>{
			this._results[i] = {
				correctValue: e,
				correct: false
			};
			this._resultCount++;
		});
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}
	onSuccess(){
		Logger.write("Všetko je vyriešené správne");
	}
	_getMissingResultsCount(){
		let missing = 0;
		each(this._results, (e) => {
			if(!e.correct)
				missing++;
		});

		return missing
	}

	checkResult(el){
		if(this._results[el.id] && this._results[el.id].correctValue === el.text){
			this._results[el.id].correct = true;
			this._results[el.id].time = Date.now();
			if(this._getMissingResultsCount() === 0)
				this.onSuccess();
			return true;
		}

		return false;
	}

	draw(){
		
	}
}