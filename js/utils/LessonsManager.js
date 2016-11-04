/**
 * Created by Gabriel on 31. 10. 2016.
 */

var lessons = {};
var users = {};

var createUser = function(user_id, lesson_id,socket){
	users[user_id] = {
		socket: socket,
		status: "connected",
		lesson: lesson_id
	};
};

module.exports.startLesson = function(lesson_id, user_id, type, socket){
	createUser(user_id, lesson_id, socket);
	lessons[lesson_id] = {
		owner: user_id,
		members: [],
		type: type
	}
};

module.exports.addMember = function(lesson_id, user_id, socket){
	createUser(user_id, lesson_id, socket);
	lessons[lesson_id]["members"].push(user_id);
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

module.exports.getUserSocket = function(user_id){
	return users[user_id]["socket"];
};
