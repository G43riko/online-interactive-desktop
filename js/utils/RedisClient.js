/**
 * Created by Gabriel on 29. 10. 2016.
 */

function pad(num, size) {
	var s = "000000000" + num;
	return s.substr(s.length - size);
}

module.exports.Redis = function(red, config){
	this._config = config;
	this._actualUserId = -1;
	this._actualConnectionId = -1;
	var inst = this;
	this._isConnected = false;
	this._isSynchronized = -2;
	this._client = red.createClient(config.redis.port, config.redis.host);

	this._client.on("connect", function(){
		console.log("pripojenie k redis DB bolo úspešné");
		inst._isConnected = true;
		inst._isSynchronized++;
	});

	this._client.get('userIdSequencer', function(err, reply) {
		inst._actualUserId = reply;
		inst._isSynchronized++;
		console.log("aktualneUserID je: ", reply);
	});

	this._client.get('connectionIdSequencer', function(err, reply) {
		inst._actualConnectionId = reply;
		inst._isSynchronized++;
		console.log("aktualneConnectionID je: ", reply);
	});
};

module.exports.Redis.prototype._createNewUser = function(data){
	this._client.hmset('user_' + data["user_id"], {
		create_date: Date.now(),
		last_connection: Date.now(),
		last_update: Date.now(),
		last_load: data["last_load"] || Date.now(),
		connection_number: 0,
		user_name: this._config.defaultUserName,
		scene: "",
		lesson: ""
		/*
		 ip adresses,
		 resolutions
		 */
	});

};

module.exports.Redis.prototype._updateUser = function(data){
	this._client.hincrby('user_' + data["user_id"], "connection_number", 1);

	var changedData = {};

	if(data["action"] === "create"){
		changedData["last_connection"] = Date.now();
		changedData["last_load"] = data["last_load"] || Date.now();
		if(data["clear_scene"])
			changedData["scene"] = "";
	}

	if(data["action"] === "update")
		changedData["last_update"] = Date.now();

	if(data["user_name"])
		changedData["user_name"] = data["user_name"];

	this._client.hmset('user_' + data["user_id"], changedData);
};

module.exports.Redis.prototype.createUser = function(data){
	if(data["user_id"]) {
		this._updateUser(data);
	}
	else{
		data["user_id"] = this._getNewUserId();
		this._createNewUser(data);
	}
	return data["user_id"];
};

module.exports.Redis.prototype.getAllUserData = function(id, func){
	this._client.hgetall('user_' + id, func);
};

module.exports.Redis.prototype._connectToLesson = function(data){
	this._client.sadd(["less_mem_" + data["less_id"], data["user_id"]]);
};

module.exports.Redis.prototype._createNewLesson = function(data){
	this._client.sadd(["less_mem_" + data["less_id"], data["user_id"]]);

	this._client.hmset('less_' + data["less_id"], {
		create_data: Date.now(),
		owner: data["user_id"],
		last_update: Date.now(),
		type: data["type"],
		password: data["password"] || "",
		limit: data["limit"] || this._config.maximumUsers,
		resolution: data["resolution"],
		scene: ""
	});
};

module.exports.Redis.prototype.getAllLessonData = function(id, func){
	this._client.hgetall('less_' + id, func);
};

module.exports.Redis.prototype._resetLesson = function(data){
	var inst = this;
	//vymaže a znovu vytvorí zoznam členov vyučovania
	this._client.del("less_mem_" + data["less_id"], function(err, data){
		inst._client.sadd(["less_mem_" + data["less_id"], data["user_id"]]);
	});

	var changedData = {
		create_data: Date.now(),
		last_update:  Date.now()
	};

	if(data["clear_scene"] !== false)
		changedData["scene"] = "";

	if(data["type"])
		changedData["type"] = data["type"];

	if(data["password"])
		changedData["password"] = data["password"];

	if(data["limit"])
		changedData["limit"] = data["limit"];

	if(data["resolution"])
		changedData["resolution"] = data["resolution"];

	this._client.hmset('less_' + data["less_id"], changedData);
};

module.exports.Redis.prototype.storeAnonymousData = function(data){
	this._client.sadd(["connections", JSON.stringify(data)]);
};

module.exports.Redis.prototype.initConnection = function(data){
	if(data["type"] === "exercise" || data["type"] === "watch"){
		this._connectToLesson(data);
	}
	else{
		if(data["create_new"]){
			data["less_id"] = this._getNewLessonId();
			this._createNewLesson(data);
			console.log("vytvara sa nova lesson: " + data["less_id"]);
		}
		else{
			this._resetLesson(data);
			console.log("lesson sa reštartuje: " + data["less_id"]);
		}
	}
	return data["less_id"];
};

module.exports.Redis.prototype.reset = function(){
	this._client.del("ides");
	this._client.del("userIdSequencer");
	this._client.del("connectionIdSequencer");
	this._client.sadd(["ides", 0]);
	this._client.set(["userIdSequencer", 0]);
	this._client.set(["connectionIdSequencer", 0]);
	this._actualUserId = 0;
};

module.exports.Redis.prototype._getNewUserId = function(){
	this._client.incr('userIdSequencer');
	return pad(++this._actualUserId, 4);
};

module.exports.Redis.prototype._getNewLessonId = function(){
	this._client.incr('connectionIdSequencer');
	return pad(++this._actualConnectionId, 4);
};
