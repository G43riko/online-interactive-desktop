class PanelManager{
	constructor(){
		this._running = false;
		this._watchers = [];
		//this._panel = document.getElementsByClassName("panel")[0];
		this._panel = createEl("div", {class: "guiPanel minimalized showChat", style: "display: none;"});

		this._bodyPanel =createEl("div", {class: "panelBody"});

		append(this._panel, this._initPanelHead());
		append(this._panel, this._bodyPanel);

		append(document.body, this._panel);

	}

	_startRun(){
		this._running = true;
		this._interval = setInterval(() => this._update(), 1000);
	}
	startTask(){
		this._type = "Task";
		this._startRun();
	}

	startShare(){
		append(this._headerPanel, this._initTitle());
		this._initChatPanel();
		this._initWatcherPanel();
		this._type = "Share";
		this._panel.style.display = "block";
		this._startRun();
	}

	_update(){
		this._durationSpan.innerText = toHHMMSS(Sharer.duration);
	}

	_initChatPanel(){
		//HEADER
		var chatButton = createEl("div", {class: "headerButton minimalize", id: "toggleChat"}, createText("Chat"));
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

		var chatHistory = createEl("div", {id: "chatHistory"});
		var chatWrapper = createEl("div", {id: "chatHistoryWrapper"}, chatHistory);
		var input = createEl("div", {id: "chatInput", contenteditable: true});
		var chatPanel = createEl("div", {class: "panelContent", id: "panelChat"}, chatWrapper);
		append(chatPanel, input);
		append(this._bodyPanel, chatPanel);	
	}

	addWatcher(name){
		this._watchers.push({name})
		var watcherProfil = createEl("div", {class: "watcherProfil"}, createText(name));
		append(this._watchersWrapper, createEl("div", {class: "panelLine"}, watcherProfil));
		this._actualConnected.innerText = this._watchers.length;
	}

	_initWatcherPanel(){
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

		//var time = this._sharer ? this._sharer.duration : this._task.timeLeft;

		append(this._headerTitle, createEl("span", {id: "title"}, createText(Project.title)));
		append(this._headerTitle, createText(" čas: "));
		this._durationSpan = createEl("span", {id: "duration"}, createText(toHHMMSS(Sharer.duration)));
		append(this._headerTitle, this._durationSpan);
		return this._headerTitle;
	}

	_initPanelHead(Project){
		


		//PANEL
		this._headerPanel = createEl("div", {class: "panelHeader noselect"});
		append(this._headerPanel, createEl("div", {class: "headerButton minimalize"}, createText("Stop")));
		return this._headerPanel;

	}
}