var messages	= {},
	startTime   = Date.now(),
	connections = null,
	logs		= {
		startWatch			: 0,
		startShare			: 0,
		connected 			: 0,
		disconnect			: 0,
		pageLoad			: 0,
		overViews			: 0,
		disconnectWatcher	: 0,
		disconnectSharer	: 0,
		watchLoad			: 0
	},
	anonymData = [],
	overviewSockets = [];

processConnData = function(data){
	var processOneConn = function(share){
		return {
			startAt: share.startTime,
			sharerRes: share.resolution.x + "x" + share.resolution.y,
			id: share.id,
			connectedWatchers: 0,
			disconnecsWatchers: 0,	
			password: share.password || "None",
			title: share.title || "Unknown",		
			//limit
			//realTime
			actualWatchers: share.watchers.length,
			time: (Date.now() - share.startTime) + "ms"
		};
	},  result = [];
	if(!data)
		return result;

	for(var i in data)
		if(data.hasOwnProperty(i))
			result.push(processOneConn(data[i]));

	return result;
};

updateOverviews = function(){
	var obj = {
		logs: logs,
		messages: messages,
		anonym: anonymData,
		startTime: startTime,
		connections: processConnData(connections)
	};

	for(var i in overviewSockets)
		if(overviewSockets.hasOwnProperty(i))
			overviewSockets[i].emit("dataRecieve", obj);
};

module.exports.init = function(conns){
	if(!connections)
		connections = conns;

	updateOverviews();
};

module.exports.addAnonymData = function(data){
	anonymData.push(data);
	updateOverviews();
};

module.exports.addOverviewSocket = function(socket){
	overviewSockets.push(socket);
	logs.overViews++;
	updateOverviews();
};

module.exports.messageRecieve = function (type, msg){
	if(typeof messages[type] === "undefined"){
		messages[type] = {};
		messages[type]["count"] = 0;
		messages[type]["messages"] = [];
	}

	messages[type]["count"]++;
	messages[type]["messages"].push(typeof msg === "string" ? msg : JSON.stringify(msg));
	updateOverviews();
};

module.exports.increase = function(title){
	logs[title]++;
	updateOverviews();
};