var express 		= require('express'),
	app 			= express(),
	http 			= require('http').Server(app),
	io 				= require('socket.io')(http),
	url 			= require('url'),
	elasticsearch	= require('elasticsearch'),
	connections 	= {};

const MAX_ID_VALUE 	= 10;
const PORT 			= 3000;

app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function(req, res) {
	console.log("niekto sa pripája");
	var cookies = parseCookies(req);

	if(typeof cookies["user_id"] === "undefined"){
		var id = Math.random() * 1000000;
		res.cookie("user_id", id).cookie("last_login", Date.now());
	}
	else
		res.cookie("last_login", Date.now());
	res.sendFile('/index.html' , { root : __dirname});

	console.log("súbor odoslaný");
});

app.get('/watch', function(req, res){
	res.sendFile('/watch.html' , { root : __dirname});
});

app.post("/anonymousData", function (req, res) {
	var body = [];
	req.on("data", function(chunk){
		body.push(chunk);
	}).on('end', function() {
		var data = JSON.parse(decodeURIComponent(Buffer.concat(body).toString()).replace("content=", ""));
		data["ipAddress"] = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		data["connectedAt"] = data["connectedAt"].replace("+", " ");
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
		host: 'localhost:9200'
	});

	client.ping({
		requestTimeout: 3000,
		hello: "elasticsearch"
	}, function (error) {
		if (error)
			console.error('elasticsearch cluster is down!');
		else
			console.log('All is well');
	});
	res.send('<h1>Táto stranka slúži len ako príjemca dát</h1>');
});

function getId(){
	return Math.floor(Math.random() * MAX_ID_VALUE);
}

var messages = [];
var count = 0;

function messageRecieve(type, msg){
	if(typeof messages[type] === "undefined"){
		messages[type] = [];
		messages[type]["count"] = 0;
		messages[type]["messages"] = [];
	}

	messages[type]["count"]++;
	messages[type]["messages"].push(msg);

	console.log(++count);
}

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on("completeAuth", completeAuth);
	socket.on("broadcastMsg", broadcastMsg);
	socket.on("sendAllData", sendAllData);
	socket.on("paintAction", paintAction);
	socket.on("startShare", startShare);
	socket.on("startWatch", startWatch);
	socket.on('disconnect', disconnect);
	socket.on('mouseData', mouseData);
	socket.on("action", action);
});

function writeToWatchers(watchers, type, msg){
	for(var i in watchers)
		if(watchers.hasOwnProperty(i))
			watchers[i].socket.emit(type, msg);
}

http.listen(PORT, function(){
	console.log('listening on *:' + PORT);
});

var startShare, startWatch, completeAuth, broadcastMsg, sendAllData, disconnect, action, mouseData, paintAction;

/*
 * dostane správu že uživaťel chce začať zdielať obrazovku
 */
startShare = function(msg){
	var id = getId(),
		data = JSON.parse(msg),
		socket = this;
	messageRecieve("startShare", msg);
	console.log("začina zdielať: ", data, "id: " + id);
	connections[id] = {
		owner: socket,
		id: id,
		resolution: data["res"],
		password: data["pass"],
		limit: data["limit"],
		watchers: [],
		realTime: data["realTime"],
		detailMovement: data["detailMovement"],
		shareMenu: data["shareMenu"],
		sharePaints: data["sharePaints"],
		shareObjects: data["shareObjects"]
	};
	socket.emit("confirmShare", JSON.stringify({id: id}));
};


/*
 * dostane spravu že client chce začať sledovať obrazovku
 */
startWatch = function(msg){
	var data = JSON.parse(msg),
		socket = this;
	messageRecieve("startWatch", msg);
	console.log("client s id " + socket.id + " chce sledovať plochu");
	connections[data["id"]].watchers[socket.id] = {
		resolution: data["res"],
		valid: false,
		socket: socket,
		connected: true
	};

	if(connections[data["id"]].password != "")
		socket.emit("auth", "zadaj heslo");
	else
		socket.emit("notification", JSON.stringify({msg: "pripojenie bolo uspešne - bez zadanie hesla"}));
	connections[data["id"]].owner.emit("notification", JSON.stringify({msg: "novy watcher sa pripojil"}));
};


/*
 * client úspešne zadá heslo
 */
completeAuth = function(msg){
	var data = JSON.parse(msg),
		socket = this;
	messageRecieve("completeAuth", msg);
	console.log("dokoncuje sa authentifikacia s uživatelom: " + socket.id);

	if(data["passwd"] == connections[data["id"]].password || true){
		socket.emit("notification", JSON.stringify({msg: "pripojenie bolo uspešne - zo zadanim hesla"}));
		connections[data["id"]].watchers[socket.id].valid = true;
		connections[data["id"]].owner.emit("getAllData", JSON.stringify({target: socket.id}));
	}
	else
		socket.emit("notification", JSON.stringify({msg: "zlé heslo"}));
};


/*
 * odpoji watchera alebo sharera
 */
disconnect = function(){
	var socket = this;
	messageRecieve("disconnect", "");
	for(var i in connections){
		if(connections.hasOwnProperty(i)){
			if(connections[i].owner.id == socket.id){
				//ODPOJIL SA SHARER
				for(var j in connections[i].watchers)
					if(connections[i].watchers.hasOwnProperty(j))
						connections[i].watchers[j].socket.emit("endShare", "endShare");
				console.log("SHARER s id " + socket.id + " sa odpojil");
				break;
			}
			else{
				if(typeof connections[i].watchers[socket.id] !== "undefined"){
					//ODPOJIL SA WATCHER
					delete connections[i].watchers[socket.id];
					console.log("watcher s id " + socket.id + " sa odpojil");
					break;
				}
			}
		}
	}
};


/*
 * odošle spravu všetkym pripojeným
 */
broadcastMsg = function(msg){
	var data = JSON.parse(msg);
	messageRecieve("broadcastMsg", msg);
	writeToWatchers(connections[data.id]["watchers"], "notification", JSON.stringify({msg: data["msg"]}));
};


/*
 * prijme od sharera všetky aktualne dáta
 */
sendAllData = function(msg){
	var data = JSON.parse(msg);
	messageRecieve("sendAllData", msg);
	console.log("boly prijatá všetky dáta od sharera a odosielju sa uživatelovy s id " + data.target);
	connections[data.id]["watchers"][data.target].socket.emit("sendAllData", JSON.stringify(data.content));
};


paintAction = function(msg){
	var data = JSON.parse(msg);
	messageRecieve("paintAction", msg);
	//console.log("bola prijatá paintAction");
	writeToWatchers(connections[data.id].watchers, "paintAction", JSON.stringify(data.msg));
};


action = function(msg){
	var data = JSON.parse(msg);
	messageRecieve("action", msg);
	//console.log("bola prijatá akcia");
	writeToWatchers(connections[data.id].watchers, "action", JSON.stringify(data.msg));
};

mouseData = function(msg){
	var data = JSON.parse(msg);
	messageRecieve("mouseMove", msg);
	writeToWatchers(connections[data.id].watchers, "mouseData", JSON.stringify(data.msg));
};

function parseCookies (request) {
	var list = {},
		rc = request.headers.cookie;

	rc && rc.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}