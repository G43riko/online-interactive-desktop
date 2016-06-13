var express 	= require('express'),
	app 		= express(),
	http 		= require('http').Server(app),
	io 			= require('socket.io')(http),
	url 		= require('url'),
	connections = {};

app.use("/css", express.static(__dirname + '/css'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/js", express.static(__dirname + '/js'));

app.get('/', function(req, res) {
	res.sendFile('/index.html' , { root : __dirname});
});

app.get('/watch', function(req, res){
	res.sendFile('/watch.html' , { root : __dirname});
});

function getId(){
	return parseInt(Math.random() * 100000) + "";
}

io.on('connection', function(socket){
	console.log('a user connected');

	/*
	 * dostane spravu že client chce začať sledovať obrazovku
	 */
	socket.on("startWatch", function(msg){
		var data = JSON.parse(msg);
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
	});

	/*
	 * client úspešne zadá heslo
	 */
	socket.on("completeAuth", function(msg){
		//POROVNAJU SA HESLA
		console.log("dokoncuje sa authentifikacia s uživatelom: " + socket.id);
		var data = JSON.parse(msg);
		if(data["passwd"] == connections[data["id"]].password || true){
			socket.emit("notification", JSON.stringify({msg: "pripojenie bolo uspešne - zo zadanim hesla"}));
			connections[data["id"]].watchers[socket.id].valid = true;
			connections[data["id"]].owner.emit("getAllData", JSON.stringify({target: socket.id}));
		}
		else
			socket.emit("notification", JSON.stringify({msg: "zlé heslo"}));
	});


	/*
	 * dostane správu že uživaťel chce začať zdielať obrazovku
	 */
	socket.on("startShare", function(msg){
		var id = getId();
		var data = JSON.parse(msg);
		console.log("začina zdielať: ", data, "id: " + id);
		connections[id] = {
			owner: socket,
			id: id,
			resolution: data["res"],
			password: data["pass"],
			limit: data["limit"],
			watchers: []
		};
		socket.emit("confirmShare", JSON.stringify({id: id}));
	});

	/*
	 * odošle spravu všetkym pripojeným
	 */
	socket.on("broadcastMsg", function(msg){
		var data = JSON.parse(msg);
		writeToWatchers(connections[data.id]["watchers"], "notification", JSON.stringify({msg: data["msg"]}));
		/*
		for(var i in connections[data.id]["watchers"])
			if(connections[data.id]["watchers"].hasOwnProperty(i))
				connections[data.id]["watchers"][i].socket.emit("notification", JSON.stringify({msg: data["msg"]}));
		*/
	});

	/*
	 * prijme od sharera všetky aktualne dáta
	 */
	socket.on("sendAllData", function(msg){
		var data = JSON.parse(msg);
		console.log("boly prijatá všetky dáta od sharera a odosielju sa uživatelovy s id " + data.target);
		connections[data.id]["watchers"][data.target].socket.emit("sendAllData", JSON.stringify(data.content));
	});


	socket.on('disconnect', function(){
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
	});

	socket.on("action", function(msg){
		var data = JSON.parse(msg);
		//console.log("bola prijatá akcia");
		writeToWatchers(connections[data.id].watchers, "action", JSON.stringify(data.msg));
	});
});

function writeToWatchers(watchers, type, msg){
	for(var i in watchers)
		if(watchers.hasOwnProperty(i))
			watchers[i].socket.emit(type, msg);
}

http.listen(3000, function(){
	console.log('listening on *:3000');
});
