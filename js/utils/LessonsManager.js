/**
 * Created by Gabriel on 31. 10. 2016.
 */

var lessons = {};
var users = {};
var eventManager = null;

var createUser = function(user_id, lesson_id,socket){
	users[user_id] = {
		socket: socket,
		status: "connected",
		lesson: lesson_id,
		nickname : "Unnamed",
		buffer: []
	};
};

var sendBuffers = function(){
	var user = null;
	for(var i in users){
		if(users.hasOwnProperty(i)){
			user = users[i];
			if(user["buffer"].length){
				user["socket"].emit("receivedBuffer", {buffer: user["buffer"]});
				user["buffer"] = [];
			}
		}
	}
};

module.exports.init = function(utils, time){
	eventManager = new utils.EventTimer(function(){sendBuffers()}, time);
};

module.exports.getMemberType = function(lesson_id){
	var type = lessons[lesson_id]["type"];
	return type === "share" ? "watch" : type === "teach" ? "exercise" : "unknown"
};

module.exports.existLesson = function(lesson_id){
	return typeof lessons[lesson_id] === "object";
};

module.exports.sendMessage = function(user_id, action, message, trySend){
	if(trySend !== false){
		trySend = true;
	}

	users[user_id]["buffer"].push({action: action, data: message});

	if(trySend){
		eventManager.callIfCan();
	}
};

module.exports.sendMessageAllMembers = function(less_id, action, message){
	var lesson = lessons[less_id];
	for(var i in lesson["members"]){
		if(lesson["members"].hasOwnProperty(i)){
			module.exports.sendMessage(lesson["members"][i], action, message, false);
		}
	}
	eventManager.callIfCan();
};

module.exports.startLesson = function(lesson_id, user_id, type, socket){
	createUser(user_id, lesson_id, socket);
	lessons[lesson_id] = {
		owner: user_id,
		members: [],
		type: type
	}
};

module.exports.isMember = function(lesson_id, user_id){
	return lessons[lesson_id] && lessons[lesson_id]["members"].indexOf(user_id) >= 0;
};

module.exports.addMember = function(lesson_id, user_id, socket){
	createUser(user_id, lesson_id, socket);
	lessons[lesson_id]["members"].push(user_id);
};

module.exports.getAllMembers = function(lesson_id){
	return lessons[lesson_id]["members"];
};

module.exports.disconnectUser = function(user_id){
	users[user_id]["status"] = "disconnected";
	//TODO všetky veci po odpojení
};

module.exports.getLesson = function(lesson_id){
	return lessons[lesson_id];
};

module.exports.getOwner = function(lesson_id){
	return lessons[lesson_id]["owner"];
};
module.exports.isSharing = function(lesson_id){
	var type = lessons[lesson_id]["type"];
	return type == "share" || type == "teach";
};

module.exports.getUserSocket = function(user_id){
	return users[user_id]["socket"];
};
