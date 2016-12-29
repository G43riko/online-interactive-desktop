/*
	compatible:	Date.now, geolocation, JSON parsing 14.9.2016
*/
class ProjectManager{
	constructor(author, title = "OIP Project"){
		this._createdAt = Date.now();
		this._title = title;
		this._autor = author;
		this._idCounter = 0;
		this._scene = new SceneManager();
		this._options = new OptionsManager();
		this._canvasManager = null;
		this._drawCounter = 0;
		this._connection = null;

		if(typeof ConnectionManager === "function")
			this._connection = new ConnectionManager();

		ProjectManager.url = "http://192.168.0.123:3000/anonymousData";
		//PAINT_MANAGER
		//CREATOR
		//TYPE 
		//ALLOWED_COMPONENTS
		
		Logger.log("Bol vytvorený objekt " + this.constructor.name, LOGGER_COMPONENT_CREATE);
		this._browserData = this._analyzeWindow(this._analyzeBrowser());
		this._sendAnonymousData(this._browserData);
		if(getCookie("send_data") === ""){
	        setCookie("send_data", 1);
	    }
	}

	initCanvas(){
		this._canvasManager = new CanvasManager(window.innerWidth, window.innerHeight);
	}

	generateId(){
		var s = "000000000" + (this._idCounter++);
		return (this._connection ? this._connection.userId : "") + s.substr(s.length - 6);
	}

	get canvasManager(){return this._canvasManager;}
	get canvas(){return this._canvasManager && this._canvasManager.canvas.canvas;}
	get context(){return this._canvasManager && this._canvasManager.canvas.context;}
	get drawCounter(){return this._drawCounter;}
	get scene(){return this._scene;}
	get options(){return this._options;}
	get connection(){return this._connection;}
	get runOnMobile(){return this._browserData.mobile > 0;}

	increaseDrawCounter(){
		this._drawCounter++;
	}
	
	_analyzeWindow(data){
		data["userAgent"] = navigator.userAgent;
		data["language"] = navigator.language;
		data["platform"] = navigator.platform;
		data["vendor"] = navigator.vendor;
		data["innerHeight"] = window.innerHeight;
		data["innerWidth"] = window.innerWidth;
		data["availHeight"] = screen.availHeight;
		data["availWidth"] = screen.availWidth;
		data["connectedAt"] = getFormattedDate();
		return data;
	}
	
	_analyzeBrowser(){
		/*
		 *	browser:
		 *		ed = Microsoft Edge
		 *		ie9 = Explorer 9
		 *		ie10 = Explorer 10
		 *		ie11 = Explorer 11
		 *		ie? = Explorer 8 and below
		 *		ff = Firefox
		 *		gc = Google Chrome
		 *		sa = Safari
		 *		op = Opera
		 *	mobile - including tablets:
		 *		0 = Not a mobile or tablet device
		 *		w = Windows Phone (Nokia Lumia)
		 *		i = iOS (iPhone iPad)
		 *		a = Android
		 *		b = Blackberry
		 *		s = Undetected mobile device running Safari
		 *		1 = Undetected mobile device
		 */
	    var e = navigator.userAgent;
		return {
			browser: /Edge\/\d+/.test(e) ? 'ed' : /MSIE 9/.test(e) ? 'ie9' : /MSIE 10/.test(e) ? 'ie10' : /MSIE 11/.test(e) ? 'ie11' : /MSIE\s\d/.test(e) ? 'ie?' : /rv\:11/.test(e) ? 'ie11' : /Firefox\W\d/.test(e) ? 'ff' : /Chrom(e|ium)\W\d|CriOS\W\d/.test(e) ? 'gc' : /\bSafari\W\d/.test(e) ? 'sa' : /\bOpera\W\d/.test(e) ? 'op' : /\bOPR\W\d/i.test(e) ? 'op' : typeof MSPointerEvent !== 'undefined' ? 'ie?' : '',
			os: /Windows NT 10/.test(e) ? "win10" : /Windows NT 6\.0/.test(e) ? "winvista" : /Windows NT 6\.1/.test(e) ? "win7" : /Windows NT 6\.\d/.test(e) ? "win8" : /Windows NT 5\.1/.test(e) ? "winxp" : /Windows NT [1-5]\./.test(e) ? "winnt" : /Mac/.test(e) ? "mac" : /Linux/.test(e) ? "linux" : /X11/.test(e) ? "nix" : "",
			mobile: /IEMobile|Windows Phone|Lumia/i.test(e) ? 'w' : /iPhone|iP[oa]d/.test(e) ? 'i' : /Android/.test(e) ? 'a' : /BlackBerry|PlayBook|BB10/.test(e) ? 'b' : /Mobile Safari/.test(e) ? 's' : /webOS|Mobile|Tablet|Opera Mini|\bCrMo\/|Opera Mobi/i.test(e) ? 1 : 0,
			tablet: /Tablet|iPad/i.test(e),
			touch: 'ontouchstart' in document.documentElement
		}
	}

	_sendAnonymousData(data = {}){
		try{
			var sendData = c =>	$.post(ProjectManager.url, {content: JSON.stringify(c)});
		}
		catch(e){
			console.warn("Nepodarilo sa odoslať anonymní dáta: ", e);
		}

        if (navigator.geolocation)
            navigator.geolocation.watchPosition(position => {
            	navigator.geolocation.getCurrentPosition(a => {
					data["accuracy"] = a.coords && a.coords.accuracy  || "unknown";
					data["position"]   = {
						lat : a.coords.latitude,
						lon : a.coords.longitude
					};
					sendData(data);
				});
			},
			function (error) {
				if (error.code == error.PERMISSION_DENIED)
					sendData(data);
			});
        else
            sendData(data);
    }

	set autor(val){this._autor = val;};

	get isMobile(){return this._browserData["mobile"] !== 0;}

	get title(){return this._title;}
	get autor(){return this._autor;}

	get time(){return Date.now() - this._createdAt; }
}