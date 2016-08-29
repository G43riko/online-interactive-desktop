var messages	= {},
	startTime   = Date.now();
	logs		= {
		startWatch	: 0,
		startShare	: 0,
		connected 	: 0,
		disconnect	: 0,
		pageLoad	: 0,
		overViews	: 0,
		watchLoad	: 0
	},
	anonymData = [],
	overviewSockets = [];

updateOverviews = function(){
	var obj = {messages: messages, logs: logs, startTime: startTime, anonym: anonymData};
	for(var i in overviewSockets)
		overviewSockets[i].emit("dataRecieve", obj);
}

module.exports.addAnonymData = function(data){
	anonymData.push(data)
	updateOverviews();
}

module.exports.addOverviewSocket = function(socket){
	overviewSockets.push(socket);
	logs.overViews++;
	updateOverviews();
}

module.exports.messageRecieve = function (type, msg){
	if(typeof messages[type] === "undefined"){
		messages[type] = {};
		messages[type]["count"] = 0;
		messages[type]["messages"] = [];
	}

	messages[type]["count"]++;
	messages[type]["messages"].push(msg);
	updateOverviews();
}

module.exports.increase = function(title){
	logs[title]++;
	updateOverviews();
}