
var setAttr = (el, key, val) => {
	if(typeof key === "string")
		el.setAttribute(key, val);
	else if(typeof key === "object")
		for(var i in key)
			if(key.hasOwnProperty(i))
				el.setAttribute(i, key[i]);
	
	return el;
};

var append = function(element, content){
	if(typeof content === "object")
		element.appendChild(content);
	return element
};
var createEl = (type, attr, cont) => append(setAttr(document.createElement(type), attr), cont);
var createText = title => document.createTextNode(title);
var createIcon = text => createEl("i", {class: "material-icons"}, createText(text));

class PanelManager{
	constructor(){
		this._running = false;
		//this._panel = document.getElementsByClassName("panel")[0];
		this._panel = createEl("div", {class: "guiPanel minimalized showChat", style: "display: none;"});
		this._bodyPanel = createEl("div", {class: "panelBody"});
		this._headerPanel = createEl("div", {class: "panelHeader noselect"});
		append(this._panel, this._headerPanel);
		append(this._panel, this._bodyPanel);

		append(document.body, this._panel);
	}

	//MAIN


	_update(){
		this._durationSpan.innerText = toHHMMSS(Date.now() - this._startTime);
	}

	_startRun(){
		this._startTime = Date.now();
		this._running = true;
		this._interval = setInterval(() => this._update(), 1000);
	}

	_stopRun(){
		clearInterval(this._interval)
		this._running = false;
	}

	stopShare(){
		this._stopRun();
	}

	startTask(){
		this._type = "Task";
		this._startRun();
	}

	startShare(sendMessage){
		this._type = "Share";
		append(this._headerPanel, this._initTitle());
		append(this._headerPanel, createEl("div", {class: "headerButton minimalize"}, createIcon("stop")));
		this._initChatPanel();
		this._initWatcherPanel();
		this._panel.style.display = "block";
		this._sendMessage = sendMessage;
		this._startRun();
	}

	startWatch(sendMessage){
		this._type = "Watch";
		append(this._headerPanel, this._initTitle());
		this._initChatPanel();
		this._panel.style.display = "block";
		this._sendMessage = sendMessage;
		this._startRun();
	}

	//CHAT
	_initChatPanel(){
		//DATA
		this._isShifDown	= false;


		//HEADER

		var chatButton = createEl("div", {class: "headerButton minimalize", id: "toggleChat"}, createIcon("message"));
		chatButton.onclick = e => {
			if(this._panel.classList.contains("showChat"))
				this._panel.classList.toggle("minimalized");
			
			else
				this._panel.classList.add("showChat");
			

			if(this._panel.classList.contains("showWatchers")){
				this._panel.classList.remove("showWatchers");
				this._panel.classList.remove("minimalized");
			}
		}

		append(this._headerPanel, chatButton);

		//BODY

		this._chatHistory = createEl("div", {id: "chatHistory"});
		this._chatWrapper = createEl("div", {id: "chatHistoryWrapper"}, this._chatHistory);
		this._msgInput = createEl("div", {id: "chatInput", contenteditable: true});
		this._chatPanel = createEl("div", {class: "panelContent", id: "panelChat"}, this._chatWrapper);
		append(this._chatPanel, this._msgInput);
		append(this._bodyPanel, this._chatPanel);	

		this._msgInput.onkeydown = e => {
			if(e.keyCode === SHIFT_KEY)
				this._isShifDown = true;

			e.target.onkeyup = e => {
 				if(e.keyCode === SHIFT_KEY)
 					this._isShifDown = false;
 				this._updateData();
 			};

			if(e.keyCode == ENTER_KEY && !this._isShifDown){
				this._prepareMessage();	
				return false;
			}
	 	};
	}

	recieveMessage(msg, sender){
		var string;
		if(Project.autor != sender){
			string = '<div class="messageC">';
			string += '<div class ="senderName">' + getFormattedDate() + ' - ';
			string += sender + ':</div>';
		}
		else
			string = '<div class="messageC myMessage">';
		
		string += '<div class="messageText">' + msg + '</div></div>';

		this._chatHistory.innerHTML += string;

		this._updateData(false);
	}

	_updateData(size = true, offset = true){
		if(size)
			this._chatWrapper.style.height = (this._bodyPanel.offsetHeight - this._msgInput.offsetHeight) + "px";

		if(offset)
			this._chatWrapper.scrollTop = this._chatWrapper.scrollHeight - this._chatWrapper.clientHeight;
	}

	_prepareMessage(){
		if(this._msgInput.innerHTML)
			this._sendMessage(this._msgInput.innerHTML);

		this._msgInput.innerHTML = "";
	}

	//WATCHERS

	addWatcher(name){
		this._watchers.push({name})
		var watcherProfil = createEl("div", {class: "watcherProfil"}, createText(name));
		append(this._watchersWrapper, createEl("div", {class: "panelLine"}, watcherProfil));
		this._actualConnected.innerText = this._watchers.length;
	}

	_initWatcherPanel(){
		//DATA

		this._watchers = [];

		//HEADER
		var watcherButton = createEl("div", {class: "headerButton minimalize", id: "toggleWrappers"});
		append(watcherButton, createText("\xa0"));
		this._actualConnected = createEl("span", {id: "connected"}, createText(this._watchers.length));
		append(watcherButton, this._actualConnected);
		append(watcherButton, createText("/"));
		append(watcherButton, createEl("span", {id: "maxConnected"}, createText(Sharer.maxWatchers)));
		append(watcherButton, createText("\xa0"));
		watcherButton.onclick = e => {
			if(this._panel.classList.contains("showWatchers"))
				this._panel.classList.toggle("minimalized");
			
			else
				this._panel.classList.add("showWatchers");
			
			if(this._panel.classList.contains("showChat")){
				this._panel.classList.remove("showChat");
				this._panel.classList.remove("minimalized");
			}
		}
		append(this._headerPanel, watcherButton);
		//BODY

		var panelLine, watcherProfil;
		this._watchersWrapper = createEl("div", {class: "panelContent", id: "panelWatchers"});
		for(var i in this._watchers)
			if(this._watchers.hasOwnProperty(i))
				this.addWatcher(this._watchers[i].name);

		append(this._bodyPanel, this._watchersWrapper);
		
	}

	_initTitle(){
		this._headerTitle = createEl("div", {id: "chatHeader"});


		append(this._headerTitle, createEl("span", {id: "title"}, createText(Project.title)));
		append(this._headerTitle, createText("\xa0 \xa0"));
		if(isIn(this._type, "Share", "Task"));
		this._durationSpan = createEl("span", {id: "duration"}, createText("00:00:00"));
		append(this._headerTitle, this._durationSpan);
		return this._headerTitle;
	}
}