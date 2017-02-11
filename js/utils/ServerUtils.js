/**
 * Created by Gabriel on 31. 10. 2016.
 */
module.exports.EventTimer = function(event, time){
	this._event = event;
	this._time = time;
	this._timeOut = false;
	this._lastTime = Date.now();
};

module.exports.EventTimer.prototype._callEvent = function(inst){
	if(!inst){
		inst = this;
	}
	inst._event();
	if(inst._timeOut){
		clearTimeout(inst._timeOut);
		inst._timeOut = false;
	}
	inst._lastTime = Date.now();
};

module.exports.EventTimer.prototype._setTimeOut = function(diff){
	if(this._timeOut){
		return;
	}
	this._timeOut = setTimeout(() => this._callEvent(this) , this._time - diff);
};

module.exports.EventTimer.prototype.callIfCan = function(){
	var diff = Date.now() - this._lastTime;
	diff > this._time ? this._callEvent() : this._setTimeOut(diff);
};