/**
 * Created by Gabriel on 31. 10. 2016.
 */


var _sendBuffers = function(buffers){
	var i, userData = null;
	for(i in buffers)
		if(buffers.hasOwnProperty(i)){
			userData = buffers[i];
			userData["socket"].emit("receivedBuffer", {buffer: userData["buffer"]});
			userData["buffer"] = [];
		}
};

module.exports.BufferManager = function(utils){
	var inst = this;
	this._eventManager = new utils.EventTimer(function(){
		_sendBuffers(inst._buffer);
	}, 1000);
	this._buffer = {};
};

module.exports.BufferManager.prototype.addUser = function(user_id, socket){
	this._buffer[user_id] = {
		buffer: [],
		socket: socket
	};
};

module.exports.BufferManager.prototype.addMessage = function(user_id, action, data){
	this._buffer[user_id].buffer.push({action: action, data: data});
	this._eventManager.callIfCan();
};

