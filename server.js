var express 		= require('express'),
	app 			= express(),
	http 			= require('http').Server(app),
	io 				= require('socket.io')(http),
	//url 			= require('url'),
	elasticsearch	= require('elasticsearch'),
	serverLogs		= require('./js/utils/serverLogs'),
	connection 		= require('./js/utils/connectionManager');

const MAX_CHAT_ID_VALUE = 10;
const MAX_USER_ID_VALUE = 1000000;
const PORT 				= 3000;
const REQUEST_TIMEOUT	= 3000;
const ELASTIC_HOST_URL	= 'localhost:9200';

app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function(req, res) {
	serverLogs.increase("pageLoad");
	var cookies = parseCookies(req);

	if(typeof cookies["user_id"] === "undefined"){
		var id = getUserId();
		res.cookie("user_id", id).cookie("last_login", Date.now());
	}
	else
		res.cookie("last_login", Date.now());
	res.sendFile('/index.html' , { root : __dirname});
});

app.get('/watch', function(req, res){
	res.sendFile('/watch.html' , { root : __dirname});
	serverLogs.increase("watchLoad");
});

app.get('/overview', function(req, res){
	res.sendFile('/overview.html' , { root : __dirname});
});


app.post("/anonymousData", function (req, res) {
	var body = [];
	req.on("data", function(chunk){
		body.push(chunk);
	}).on('end', function() {
		var data = JSON.parse(decodeURIComponent(Buffer.concat(body).toString()).replace("content=", ""));
		data["ipAddress"] = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		data["connectedAt"] = data["connectedAt"].replace("+", " ");
		serverLogs.addAnonymData(data);
		return;
		new elasticsearch.Client({
			host: 'localhost:9200'
		}).create({
			index: 'plocha_analytics',
			type: 'anonymous',
			body: data
		}, function (error, response) {
			if(typeof error !== "undefined")
				console.log("chyba pri vkladani do ES: ", error);
		});
	});
});

app.get('/anonymousData', function(req, res){
	var client = new elasticsearch.Client({
		//log: 'trace',
		host: ELASTIC_HOST_URL
	});

	client.ping({
		requestTimeout: REQUEST_TIMEOUT,
		hello: "elasticsearch"
	}, function (error) {
		if (error)
			console.error('elasticsearch cluster is down!');
		else
			console.log('All is well');
	});
	res.send('<h1>Táto stranka slúži len ako príjemca dát</h1>');
});

io.on('connection', function(socket){
	serverLogs.increase("connected");
	socket.on("changeCreator", changeCreator);
	socket.on("completeAuth", completeAuth);
	socket.on("broadcastMsg", broadcastMsg);
	socket.on("sendAllData", sendAllData);
	socket.on("paintAction", paintAction);
	socket.on('chatMessage', chatMessage);
	socket.on("dataReqiere", dataReqiere);
	socket.on("startShare", startShare);
	socket.on("startWatch", startWatch);
	socket.on('disconnect', disconnect);
	socket.on('mouseData', mouseData);
	socket.on("action", action);
	

});

http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
});

var startShare, startWatch, completeAuth, broadcastMsg, sendAllData, disconnect, action, mouseData, paintAction, chatMessage, dataReqiere;

/*
 * dostane správu že uživaťel chce začať zdielať obrazovku
 */
startShare = function(data){
	var id = getChatId();
	serverLogs.increase("startShare");
	serverLogs.messageRecieve("startShare", data);
	console.log("začina zdielať: ", data, "id: " + id);
	connection.startShare(id, this, data);
	this.emit("confirmShare", {id: id});
};


/*
 * dostane spravu že client chce začať sledovať obrazovku
 */
startWatch = function(data){
	serverLogs.increase("startWatch");
	serverLogs.messageRecieve("startWatch", data);
	console.log("client s id " + this.id + " chce sledovať plochu");
	connection.startWatch(data["id"], this, data)

	this.emit("auth", "zadaj heslo");
	connection.getOwner(data["id"]).emit("notification", {msg: "novy watcher sa pripojil"});
};


/*
 * client úspešne zadá heslo
 */
completeAuth = function(data){
	serverLogs.messageRecieve("completeAuth", data);
	console.log("dokoncuje sa authentifikacia s uživatelom: " + this.id);

	if(connection.checkPassword(data["id"], data["passwd"])){
		this.emit("notification", {msg: "pripojenie bolo uspešne - zo zadanim hesla"});
		connection.getWatcher(data["id"], this).valid = true
		connection.getOwner(data["id"]).emit("getAllData", {target: this.id});
	}
	else{
		this.emit("notification", {msg: "zlé heslo"});
		this.emit("auth", "zadaj heslo");//TODO nejaké počítadlo lebo toto nechceme stále
	}
};


/*
 * odpoji watchera alebo sharera
 */
disconnect = function(){
	serverLogs.increase("disconnect");
	serverLogs.messageRecieve("disconnect", "");
	connection.disconnect(this, () => serverLogs.increase("disconnectWatcher"), () => serverLogs.increase("disconnectSharer"));
};


/*
 * odošle spravu všetkym pripojeným
 */
broadcastMsg = function(data){
	serverLogs.messageRecieve("broadcastMsg", data);
	writeToWatchers(connection.getWatchers(data.id), "notification", {msg: data["msg"]});
};


/*
 * prijme od sharera všetky aktualne dáta
 */
sendAllData = function(data){
	serverLogs.messageRecieve("sendAllData", data);
	data.msg["shareOptions"] = connection.getShareOptions(data.id);
	console.log("boly prijatá všetky dáta od sharera a odosielju sa uživatelovy s id " + data.target);
	connection.getWatcher(data.id, data.target).socket.emit("sendAllData", data.msg);
};


paintAction = function(data){
	serverLogs.messageRecieve("paintAction", data);
	writeToWatchers(connection.getWatchers(data.id), "paintAction", data.msg);
};

chatMessage = function(data){
	serverLogs.messageRecieve("chatMessage", data);

	writeToAllExcept(data.id, this, "chatMessage", data.msg);
}

function writeToAllExcept(id, socket, type, msg){
	var watchers = connection.getWatchers(id);
	for(var i in watchers)
		if(watchers.hasOwnProperty(i) && watchers[i].socket != socket)
			watchers[i].socket.emit(type, msg);

	var owner = connection.getOwner(id);
	if(owner != socket)
		owner.emit(type, msg)
}


action = function(data){
	serverLogs.messageRecieve("action", data);
	writeToWatchers(connection.getWatchers(data.id), "action", data.msg);
};

mouseData = function(data){
	serverLogs.messageRecieve("mouseData", data);
	if(connection.existChat(data.id))
		writeToWatchers(connection.getWatchers(data.id), "mouseData", data.msg);
	else
		console.log("id " + data.id + " neexistuje v zozname ideciek");
};

changeCreator = function(data){
	serverLogs.messageRecieve("changeCreator", data);
	writeToWatchers(connection.getWatchers(data.id), "changeCreator", data.msg);
};

dataReqiere = function(data){
	serverLogs.addOverviewSocket(this);
}

//UTILS

function getChatId(){
	return Math.floor(Math.random() * MAX_CHAT_ID_VALUE);
}

function getUserId(){
	return Math.floor(Math.random() * MAX_USER_ID_VALUE);
}

function parseCookies (request) {
	var list = {},
		rc = request.headers.cookie;

	rc && rc.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}

function writeToWatchers(watchers, type, msg){
	for(var i in watchers)
		if(watchers.hasOwnProperty(i))
			watchers[i].socket.emit(type, msg);
}