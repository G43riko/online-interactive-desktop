var messages	= [],
	logs		= {
		startWatch	: 0,
		startShare	: 0,
		connected 	: 0,
		disconnect	: 0,
		pageLoad	: 0,
		watchLoad	: 0
	}

module.exports.messageRecieve = function (type, msg){
	if(typeof messages[type] === "undefined"){
		messages[type] = [];
		messages[type]["count"] = 0;
		messages[type]["messages"] = [];
	}

	messages[type]["count"]++;
	messages[type]["messages"].push(msg);
}

module.exports.increase = function(title){
	logs[title]++;	
}
