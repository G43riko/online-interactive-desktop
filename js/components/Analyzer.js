/**
 * Created by gabriel on 30.12.2016.
 * JShint 4.2.2017
 */
let createAnalyzer = (function(){
	let _created = false;
    let _url;
    let _browserData;

    /**
	 * Funckia odošle dáta na zadanú URL
	 *
     * @param data - dáta určené na odoslanie
     * @private
     */
    let _sendData = data => $.post(_url, {
        content: JSON.stringify(data)
    }).fail(() => Logger.warn(getMessage(MSG_ANNONYM_FAILED)));

    /**
	 * Funckia spracuje a následne odošle spracované dáta
	 *
     * @param data - objekt do ktorého sa pridajú spracované dáta
     * @private
     */
    let _sendAnonymousData = function(data = {}){
        if(navigator.geolocation){
            navigator.geolocation.watchPosition(position => {
                    navigator.geolocation.getCurrentPosition(a => {
                        data.accuracy = a.coords && a.coords.accuracy  || "unknown";
                        data.position = {
                            lat : a.coords.latitude,
                            lon : a.coords.longitude
                        };
                        _sendData(data);
                    });
                },
                function (error) {
                    if (error.code == error.PERMISSION_DENIED){
                        _sendData(data);
                    }
                });
            return;
        }

        _sendData(data);
    };

    /**
	 *Funkcia získa údaje o Window objekte
     *
	 * @param data - objekt do ktorého sa pridajú získané dáta
     * @returns {*}
     * @private
     */
    let _analyzeWindow = function(data){
        data.userAgent		= navigator.userAgent;
        data.language		= navigator.language;
        data.platform		= navigator.platform;
        data.vendor			= navigator.vendor;
        data.innerHeight	= window.innerHeight;
        data.innerWidth		= window.innerWidth;
        data.availHeight	= screen.availHeight;
        data.availWidth		= screen.availWidth;
        data.connectedAt	= getFormattedDate();
        return data;
    };

    /**
	 *
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
	 *
     * @returns {{browser: string, os: string, mobile: string, tablet: boolean, touch: boolean}}
     * @private
     */
    let _analyzeBrowser = function(){
        let e = navigator.userAgent;
        return {
            browser: /Edge\/\d+/.test(e) ? 'ed' : /MSIE 9/.test(e) ? 'ie9' : /MSIE 10/.test(e) ? 'ie10' : /MSIE 11/.test(e) ? 'ie11' : /MSIE\s\d/.test(e) ? 'ie?' : /rv\:11/.test(e) ? 'ie11' : /Firefox\W\d/.test(e) ? 'ff' : /Chrom(e|ium)\W\d|CriOS\W\d/.test(e) ? 'gc' : /\bSafari\W\d/.test(e) ? 'sa' : /\bOpera\W\d/.test(e) ? 'op' : /\bOPR\W\d/i.test(e) ? 'op' : typeof MSPointerEvent !== 'undefined' ? 'ie?' : '',
            os: /Windows NT 10/.test(e) ? "win10" : /Windows NT 6\.0/.test(e) ? "winvista" : /Windows NT 6\.1/.test(e) ? "win7" : /Windows NT 6\.\d/.test(e) ? "win8" : /Windows NT 5\.1/.test(e) ? "winxp" : /Windows NT [1-5]\./.test(e) ? "winnt" : /Mac/.test(e) ? "mac" : /Linux/.test(e) ? "linux" : /X11/.test(e) ? "nix" : "",
            mobile: /IEMobile|Windows Phone|Lumia/i.test(e) ? 'w' : /iPhone|iP[oa]d/.test(e) ? 'i' : /Android/.test(e) ? 'a' : /BlackBerry|PlayBook|BB10/.test(e) ? 'b' : /Mobile Safari/.test(e) ? 's' : /webOS|Mobile|Tablet|Opera Mini|\bCrMo\/|Opera Mobi/i.test(e) ? 1 : 0,
            tablet: /Tablet|iPad/i.test(e),
            touch: 'ontouchstart' in document.documentElement
        };
    };
    
	return function(url){
		if(_created){
			return null;
		}
		_url = url;
        _created = true;
        _browserData = _analyzeWindow(_analyzeBrowser());
		return {
            get browserData(){
                return _browserData;
            },
            get isMobile(){
                return _browserData.mobile !== 0;
            },
            sendData(){
                _sendAnonymousData(_browserData);
            }
		}
	}
})();


class Analyzer{
	constructor(url){
		if(Analyzer._instatnce){
			alert("Nemôžeš vytvoriť viacej inštancií analyzera!!!");
			return;
		}
        Analyzer._instatnce = this;
		this._url = url;
		this._browserData = Analyzer._analyzeWindow(this._analyzeBrowser());
		
		Logger.log(getMessage(MSG_OBJECT_CREATED, this.constructor.name), LOGGER_COMPONENT_CREATE);
	}

	get browserData(){
		return this._browserData;
	}
	get isMobile(){
		return this._browserData.mobile !== 0;
	}

	sendData(){
		this._sendAnonymousData(this._browserData);
	}

	_sendAnonymousData(data = {}){
		let sendData = c =>	$.post(this._url, {
			content: JSON.stringify(c)
		}).fail(() => Logger.warn(getMessage(MSG_ANNONYM_FAILED)));

		if(navigator.geolocation){
			navigator.geolocation.watchPosition(position => {
					navigator.geolocation.getCurrentPosition(a => {
						data.accuracy = a.coords && a.coords.accuracy  || "unknown";
						data.position = {
							lat : a.coords.latitude,
							lon : a.coords.longitude
						};
						sendData(data);
					});
				},
				function (error) {
					if (error.code == error.PERMISSION_DENIED){
						sendData(data);
					}
				});
			return;
		}
		
		sendData(data);
	}

	static _analyzeWindow(data){
		data.userAgent		= navigator.userAgent;
		data.language		= navigator.language;
		data.platform		= navigator.platform;
		data.vendor			= navigator.vendor;
		data.innerHeight	= window.innerHeight;
		data.innerWidth		= window.innerWidth;
		data.availHeight	= screen.availHeight;
		data.availWidth		= screen.availWidth;
		data.connectedAt	= getFormattedDate();
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
		let e = navigator.userAgent;
		return {
			browser: /Edge\/\d+/.test(e) ? 'ed' : /MSIE 9/.test(e) ? 'ie9' : /MSIE 10/.test(e) ? 'ie10' : /MSIE 11/.test(e) ? 'ie11' : /MSIE\s\d/.test(e) ? 'ie?' : /rv\:11/.test(e) ? 'ie11' : /Firefox\W\d/.test(e) ? 'ff' : /Chrom(e|ium)\W\d|CriOS\W\d/.test(e) ? 'gc' : /\bSafari\W\d/.test(e) ? 'sa' : /\bOpera\W\d/.test(e) ? 'op' : /\bOPR\W\d/i.test(e) ? 'op' : typeof MSPointerEvent !== 'undefined' ? 'ie?' : '',
			os: /Windows NT 10/.test(e) ? "win10" : /Windows NT 6\.0/.test(e) ? "winvista" : /Windows NT 6\.1/.test(e) ? "win7" : /Windows NT 6\.\d/.test(e) ? "win8" : /Windows NT 5\.1/.test(e) ? "winxp" : /Windows NT [1-5]\./.test(e) ? "winnt" : /Mac/.test(e) ? "mac" : /Linux/.test(e) ? "linux" : /X11/.test(e) ? "nix" : "",
			mobile: /IEMobile|Windows Phone|Lumia/i.test(e) ? 'w' : /iPhone|iP[oa]d/.test(e) ? 'i' : /Android/.test(e) ? 'a' : /BlackBerry|PlayBook|BB10/.test(e) ? 'b' : /Mobile Safari/.test(e) ? 's' : /webOS|Mobile|Tablet|Opera Mini|\bCrMo\/|Opera Mobi/i.test(e) ? 1 : 0,
			tablet: /Tablet|iPad/i.test(e),
			touch: 'ontouchstart' in document.documentElement
		};
	}
}