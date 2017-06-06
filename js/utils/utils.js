/*
	compatible:	strictMode, Array.isArray 14.9.2016
*/

glob.testCompatibility = function(){
    let ca = document.createElement("canvas");
    let co = ca.getContext("2d");

    let isUndefined = function(object, key){
		if(typeof object[key] === "undefined"){
			alert("objekt " + object + " neobsahuje atribut " + key);
		}
	};
	isUndefined(co, "canvas");
	isUndefined(co, "currentTransform");//
	isUndefined(co, "direction");//
	isUndefined(co, "fillStyle");
	isUndefined(co, "filter");//
	isUndefined(co, "font");
	isUndefined(co, "globalAlpha");
	isUndefined(co, "globalCompositeOperation");
	isUndefined(co, "imageSmoothingEnabled");//
	isUndefined(co, "imageSmoothingQuality");//
	isUndefined(co, "lineCap");
	isUndefined(co, "lineDashOffset");//
	isUndefined(co, "lineJoin");
	isUndefined(co, "lineWidth");
	isUndefined(co, "miterLimit");
	isUndefined(co, "shadowBlur");
	isUndefined(co, "shadowColor");
	isUndefined(co, "shadowOffsetX");
	isUndefined(co, "shadowOffsetY");
	isUndefined(co, "strokeStyle");
	isUndefined(co, "textAlign");
	isUndefined(co, "textBaseline");

	isUndefined(co, "addHitRegion");//
	isUndefined(co, "arc");
	isUndefined(co, "arcTo");
	isUndefined(co, "asyncDrawXULElement");//
	isUndefined(co, "beginPath");
	isUndefined(co, "bezierCurveTo");
	isUndefined(co, "clearHitRegions");//
	isUndefined(co, "clearRect");
	isUndefined(co, "clip");
	isUndefined(co, "closePath");
	isUndefined(co, "createImageData");
	isUndefined(co, "createLinearGradient");
	isUndefined(co, "createPattern");
	isUndefined(co, "createRadialGradient");
	isUndefined(co, "drawFocusIfNeeded");//
	isUndefined(co, "drawImage");
	isUndefined(co, "drawWidgetAsOnScreen");//
	isUndefined(co, "drawWindow");//
	isUndefined(co, "ellipse");//
	isUndefined(co, "fill");
	isUndefined(co, "fillRect");
	isUndefined(co, "fillText");
	isUndefined(co, "getImageData");
	isUndefined(co, "getLineDash");//
	isUndefined(co, "isPointInPath");
	isUndefined(co, "isPointInStroke");//
	isUndefined(co, "lineTo");
	isUndefined(co, "measureText");
	isUndefined(co, "moveTo");
	isUndefined(co, "putImageData");
	isUndefined(co, "quadraticCurveTo");
	isUndefined(co, "rect");
	isUndefined(co, "removeHitRegion");//
	isUndefined(co, "resetTransform");//
	isUndefined(co, "restore");
	isUndefined(co, "rotate");
	isUndefined(co, "save");
	isUndefined(co, "scale");
	isUndefined(co, "scrollPathIntoView");//
	isUndefined(co, "setLineDash");//
	isUndefined(co, "setTransform");
	isUndefined(co, "stroke");
	isUndefined(co, "strokeRect");
	isUndefined(co, "strokeText");
	isUndefined(co, "transform");
	isUndefined(co, "translate");
	
	isUndefined(window, "performance");
};

glob.showKey = function(key){
	if(Options.showKeys){
        let char = "";

		switch(key){
			case KEY_DELETE :
				char = "DEL";
				break;
			case KEY_L_CTRL :
				char = "CTRL";
				break;
			case KEY_L_ALT :
				char = "ALT";
				break;
			case KEY_SHIFT :
				char = "SHIFT";
				break;
			case KEY_ARROW_UP :
				char = "▲";
				break;
			case KEY_ARROW_LEFT :
				char = "◀";
				break;
			case KEY_ARROW_DOWN :
				char = "▼";
				break;
			case KEY_ARROW_RIGHT :
				char = "▶";
				break;
			case KEY_ENTER :
				char = 	"⏎";
				break;
			case KEY_TABULATOR :
				char = 	"TAB";
				break;
			case KEY_ESCAPE :
				char = 	"ESC";
				break;
			default: 
				char = String.fromCharCode(key);
		}

        let element = G.createElement("div", {}, char);
		setTimeout(() => element.remove(), 2000);
		G("#keysViewerHolder").append(element);
	}
};

class Animation{
	static init(loop){
		Animation._running = false;
		Animation._loop = loop;
		Animation._counter = 0;
	}

	static _mainLoop(timestamp){
		Animation._loop(timestamp);
		
		if(Animation._running){
			requestAnimationFrame(Animation._mainLoop);
		}
	}

	static stop(){
		Animation._running = false;
	
	}
	static start(){
		Animation._running = true;

		let test = (time) => {
			Animation._mainLoop(time);
		};
		requestAnimationFrame(test);
	}
}

glob.queryString = function(){
    let query_string = {};
    let query = window.location.search.substring(1);
    let vars = query.split("&");
	for (let i=0 ; i<vars.length ; i++) {
        let pair = vars[i].split("=");
		if(typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
		}
		else if(typeof query_string[pair[0]] === "string") {
			query_string[pair[0]] = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
		}
		else{
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
};

function isIn(obj, data){
	//return arguments.some((e, i) => i && e === obj);
    let i;
	if(isArray(data)){
		for(i=0 ; i<data.length ; i++){
			if(data[i] == obj){
				return true;
			}
		}
	}
	else{
		for(i=1 ; i<arguments.length ; i++){
			if(arguments[i] === obj){
				return true;
			}
		}
	}

	return false;
}

glob.lerp = function(obj1, obj2, ratio){
	if(typeof obj1 === "number" && typeof obj2 === "number"){
		return obj1 * ration + obj2 * (1 - ratio);
	}
    if(obj1 instanceof GVector2f && obj2 instanceof GVector2f){
		return obj1.getClone().mul(ratio).add(obj2.getClone().mul(1 - ration));
    }
};

class Color{
    constructor(){
        this._light = true;
        Color._namedColors = {
            'transparent':'rgba(0, 0, 0, 0)','aliceblue':'#F0F8FF','antiquewhite':'#FAEBD7','aqua':'#00FFFF','aquamarine':'#7FFFD4',
            'azure':'#F0FFFF','beige':'#F5F5DC','bisque':'#FFE4C4','black':'#000000','blanchedalmond':'#FFEBCD','blue':'#0000FF','blueviolet':'#8A2BE2',
            'brown':'#A52A2A','burlywood':'#DEB887','cadetblue':'#5F9EA0','chartreuse':'#7FFF00','chocolate':'#D2691E','coral':'#FF7F50',
            'cornflowerblue':'#6495ED','cornsilk':'#FFF8DC','crimson':'#DC143C','cyan':'#00FFFF','darkblue':'#00008B','darkcyan':'#008B8B','darkgoldenrod':'#B8860B',
            'darkgray':'#A9A9A9','darkgrey':'#A9A9A9','darkgreen':'#006400','darkkhaki':'#BDB76B','darkmagenta':'#8B008B','darkolivegreen':'#556B2F',
            'darkorange':'#FF8C00','darkorchid':'#9932CC','darkred':'#8B0000','darksalmon':'#E9967A','darkseagreen':'#8FBC8F','darkslateblue':'#483D8B',
            'darkslategray':'#2F4F4F','darkslategrey':'#2F4F4F','darkturquoise':'#00CED1','darkviolet':'#9400D3','deeppink':'#FF1493','deepskyblue':'#00BFFF',
            'dimgray':'#696969','dimgrey':'#696969','dodgerblue':'#1E90FF','firebrick':'#B22222','floralwhite':'#FFFAF0','forestgreen':'#228B22',
            'fuchsia':'#FF00FF','gainsboro':'#DCDCDC','ghostwhite':'#F8F8FF','gold':'#FFD700','goldenrod':'#DAA520','gray':'#808080','grey':'#808080',
            'green':'#008000','greenyellow':'#ADFF2F','honeydew':'#F0FFF0','hotpink':'#FF69B4','indianred':'#CD5C5C','indigo':'#4B0082','ivory':'#FFFFF0',
            'khaki':'#F0E68C','lavender':'#E6E6FA','lavenderblush':'#FFF0F5','lawngreen':'#7CFC00','lemonchiffon':'#FFFACD','lightblue':'#ADD8E6',
            'lightcoral':'#F08080','lightcyan':'#E0FFFF','lightgoldenrodyellow':'#FAFAD2','lightgray':'#D3D3D3','lightgrey':'#D3D3D3','lightgreen':'#90EE90',
            'lightpink':'#FFB6C1','lightsalmon':'#FFA07A','lightseagreen':'#20B2AA','lightskyblue':'#87CEFA','lightslategray':'#778899',
            'lightslategrey':'#778899','lightsteelblue':'#B0C4DE','lightyellow':'#FFFFE0','lime':'#00FF00','limegreen':'#32CD32','linen':'#FAF0E6',
            'magenta':'#FF00FF','maroon':'#800000','mediumaquamarine':'#66CDAA','mediumblue':'#0000CD','mediumorchid':'#BA55D3','mediumpurple':'#9370D8',
            'mediumseagreen':'#3CB371','mediumslateblue':'#7B68EE','mediumspringgreen':'#00FA9A','mediumturquoise':'#48D1CC','mediumvioletred':'#C71585',
            'midnightblue':'#191970','mintcream':'#F5FFFA','mistyrose':'#FFE4E1','moccasin':'#FFE4B5','navajowhite':'#FFDEAD','navy':'#000080','oldlace':'#FDF5E6',
            'olive':'#808000','olivedrab':'#6B8E23','orange':'#FFA500','orangered':'#FF4500','orchid':'#DA70D6','palegoldenrod':'#EEE8AA',
            'palegreen':'#98FB98','paleturquoise':'#AFEEEE','palevioletred':'#D87093','papayawhip':'#FFEFD5','peachpuff':'#FFDAB9','peru':'#CD853F',
            'pink':'#FFC0CB','plum':'#DDA0DD','powderblue':'#B0E0E6','purple':'#800080','red':'#FF0000','rosybrown':'#BC8F8F','royalblue':'#4169E1',
            'saddlebrown':'#8B4513','salmon':'#FA8072','sandybrown':'#F4A460','seagreen':'#2E8B57','seashell':'#FFF5EE','sienna':'#A0522D','silver':'#C0C0C0',
            'skyblue':'#87CEEB','slateblue':'#6A5ACD','slategray':'#708090','slategrey':'#708090','snow':'#FFFAFA','springgreen':'#00FF7F',
            'steelblue':'#4682B4','tan':'#D2B48C','teal':'#008080','thistle':'#D8BFD8','tomato':'#FF6347','turquoise':'#40E0D0','violet':'#EE82EE'
        };
        this.setColor.apply(this, arguments);
    }

	/*
	 * CONVERTORS
	 */

    static _RGB2INT(R, G, B){
        return R << 16 | (G << 8) & 0xffff | B;
    }

    static _INT2RGB(val){
        return [val >> 16, (val >> 8) & 0xFF, val & 0xFF];
    }

    static _RGB2HSV(r, g, b){
        let computedH = 0;
        let computedS = 0;
        let computedV = 0;

        //remove spaces from input RGB values, convert to int
        r = parseInt( (''+r).replace(/\s/g,''),10 );
        g = parseInt( (''+g).replace(/\s/g,''),10 );
        b = parseInt( (''+b).replace(/\s/g,''),10 );

        if ( r==null || g==null || b==null ||
            isNaN(r) || isNaN(g)|| isNaN(b) ) {
            alert ('Please enter numeric RGB values!');
            return;
        }
        if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
            alert ('RGB values must be in the range 0 to 255.');
            return;
        }
        r=r/255; g=g/255; b=b/255;
        let minRGB = Math.min(r,Math.min(g,b));
        let maxRGB = Math.max(r,Math.max(g,b));

        // Black-gray-white
        if (minRGB==maxRGB) {
            computedV = minRGB;
            return [0,0,computedV];
        }

        // Colors other than black-gray-white:
        let d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
        let h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
        computedH = 60*(h - d/(maxRGB - minRGB));
        computedS = (maxRGB - minRGB)/maxRGB;
        computedV = maxRGB;
        return [computedH,computedS,computedV];
    	/*
        let maxc = Math.max(Math.max(r, g), b);
        let minc = Math.min(Math.min(r, g), b);
        let h, s, v;
        v = maxc;
        if (minc == maxc){
        	return [0, 0, v];
        }
        let diff = maxc - minc;
        s = diff / maxc;
        let rc = (maxc - r) / diff;
        let gc = (maxc - g) / diff;
        let bc = (maxc - b) / diff;
        if(r == maxc){
        	h = bc - gc
        }
    	else if(g == maxc){
        	h = 2.0 + rc - bc
        }
    	else{
        	h = 4.0 + gc - rc
        }
        h = (h / 6.0) % 1.0; //this calculates only the fractional part of h/6
        return [h, s, v];
        */
    }

    static _HSV2RGB(h, s, v){
        let r, g, b;
        let i;
        let f, p, q, t;

        // Make sure our arguments stay in-range
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        v = Math.max(0, Math.min(100, v));

        // We accept saturation and value arguments from 0 to 100 because that's
        // how Photoshop represents those values. Internally, however, the
        // saturation and value are calculated from a range of 0 to 1. We make
        // That conversion here.
        s /= 100;
        v /= 100;

        if(s == 0) {
            // Achromatic (grey)
            r = g = b = v;
            return [
                Math.round(r * 255),
                Math.round(g * 255),
                Math.round(b * 255)
            ];
        }

        h /= 60; // sector 0 to 5
        i = Math.floor(h);
        f = h - i; // factorial part of h
        p = v * (1 - s);
        q = v * (1 - s * f);
        t = v * (1 - s * (1 - f));

        switch(i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;

            case 1:
                r = q;
                g = v;
                b = p;
                break;

            case 2:
                r = p;
                g = v;
                b = t;
                break;

            case 3:
                r = p;
                g = q;
                b = v;
                break;

            case 4:
                r = t;
                g = p;
                b = v;
                break;

            default: // case 5:
                r = v;
                g = p;
                b = q;
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }

    static _HEX2RGB(color) {
        let num = parseInt(color.slice(1), 16);
        return [num >> 16, num >> 8 & 0x00FF, num & 0x0000FF];
    }

    static _RGB2HEX(R, G, B){
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    static _HEX2INT(val){
        return parseInt(val.replace("#", ""), 16);
    }

    static _INT2HEX(val){
        let x = val.toString(16);
        x = '000000'.substr(0, 6 - x.length) + x;
        return '#' + x.toUpperCase();
    }

	/*
	 * UPDATERS
	 */
    _rgbUpdate(){
        this._hex = Color._RGB2HEX(this._r, this._g, this._b);
        this._int = Color._RGB2INT(this._r, this._g, this._b);
    }

    darker(val){

    }

    brighter(val){

    }

    add(color){
        this.setRGB(this._r + color._r, this._g + color._g, this._b + color._b, this._a + color._a);
    }
    sub(color){
        this.setRGB(this._r - color._r, this._g - color._g, this._b - color._b, this._a - color._a);
    }
    mul(color){
        this.setRGB(this._r * color._r, this._g * color._g, this._b * color._b, this._a * color._a);
    }
    div(color){
        this.setRGB(this._r / color._r, this._g / color._g, this._b / color._b, this._a / color._a);
    }


	/*
	 * GETTERS
	 */
    get red(){return this._r;}
    get green(){return this._g;}
    get blue(){return this._b;}
    get RGB(){return [this._r, this._g, this._b];}
    get RGBA(){return [this._r, this._g, this._b, this._a];}
    get hex(){return this._hex;}
    get int(){return this._int;}
    get alpha(){return this._a;}

    isLight(){return this._light;}


	/*
	 * SETTERS
	 */
    setLight(val){this._light = val;}

    set red(val){this._r = val; this._rgbUpdate();}
    set green(val){this._g = val; this._rgbUpdate();}
    set blue(val){this._b = val; this._rgbUpdate();}
    set alpha(val){this._a = val;}

    set int(val){
        this._int = val;
        this.setRGB(Color._INT2RGB(val));
        this._hex = Color._INT2HEX(val);
    }

    set hex(val){
        this._hex = val;
        this.setRGB(Color._HEX2RGB(this._hex));
        this._int = Color._HEX2INT(this._hex);
    }

    setRGB(){
        if(arguments.length == 1){
            if(Array.isArray(arguments[0])){ //setRGB([255, 255, 255])
                this._r = arguments[0][0];
                this._g = arguments[0][1];
                this._b = arguments[0][2];
            }
            else if(typeof arguments[0] === "number"){ //setRGB([255])
                arguments[0] = Math.min(255, Math.max(0, arguments[0]));
                this._r = arguments[0];
                this._g = arguments[0];
                this._b = arguments[0];
            }
        }
        else if(arguments.length == 3){ //setRGB(255, 255, 255)
            this._r = arguments[0];
            this._g = arguments[1];
            this._b = arguments[2];
        }
        this._rgbUpdate();
        return this;
    }

    setColor(){
        if(!arguments.length){ //setColor()
            this.setRGBA(0, 0, 0, 255);
        }
        else if(arguments.length == 1){
            if(typeof arguments[0] === "number"){ //setColor(1538)
                this.int = arguments[0];
            }
            else if(Array.isArray(arguments[0])){ //setColor([255, 255, 0])
                //this.setRGB(arguments[0]);
                //>> 1.2.2017 ak je pole len s 3 parametrov tak sa pridá alpha a zavolá sa setRGB
                if(arguments[0].length === 3){
                    arguments[0].push(255);
                }
                this.setRGB.apply(this, arguments[0]);
                //<< 1.2.2017
            }
            else if(typeof arguments[0] === "string"){ //setColor("#FFFFFF" | "red")
                if(Color._namedColors.hasOwnProperty(arguments[0])){
                    this.setColor(Color._namedColors[arguments[0]]);
                }
                else{
                    this.hex = arguments[0];
                }
            }
            this._a = 255;
        }
        else if(arguments.length == 3){
            this.setRGBA(arguments[0], arguments[1], arguments[2], 255);
        }
        else if(arguments.length == 4){
            this.setRGBA.apply(this, arguments);
        }
        else{
            console.error("setRGBA: parametrov: 0-4, zadanych: " + arguments.length + ", parametre: ",arguments);
        }
        return this;
    }

    setRGBA(){
        if(arguments.length == 4){
            this._a = arguments[3];
            this.setRGB(arguments[0], arguments[1], arguments[2]);
        }
        else{
            console.error("setRGBA: parametrov: 4, zadanych: " + arguments.length + ", parametre: ",arguments);
        }

        return this;
    }
}

glob.roughSizeOfObject = function(object) {
    let objectList = [];
    let stack = [object];
    let bytes = 0;

	while (stack.length) {
        let value = stack.pop();
		if(isBoolean(value)){
			bytes += 4;
		}
		else if(isString(value)){
			bytes += value.length << 1;
		}
		else if(isNumber(value)){
			bytes += 8;
		}
		else if(isObject(value) && objectList.indexOf( value ) === -1){
			objectList.push(value);
			for(let i in value){
				if(value.hasOwnProperty(i)){
					stack.push(value[i]);
				}
			}
		}
	}
	return bytes;
};

let isUndefined 	= e => typeof e === KEYWORD_UNDEFINED,
	isDefined 		= e => typeof e !== KEYWORD_UNDEFINED,
	isFunction 		= e => typeof e === KEYWORD_FUNCTION,
	isNumber		= e => typeof e === KEYWORD_NUMBER,
	isString		= e => typeof e === KEYWORD_STRING,
	isObject		= e => typeof e === KEYWORD_OBJECT,
	isBoolean		= e => typeof e === KEYWORD_BOOLEAN,
	isArray			= e => Array.isArray(e),
	isNull			= e => e === null,
	isEmptyObject   = e => e && Object.keys(e).length === 0 && e.constructor === Object,
	isEmptyArray    = e => isArray(e) && e.length === 0,
	getLength		= function(obj){let counter = 0; each(obj, e => counter++); return counter;},
	isSharing		= () => typeof Sharer !== "undefined" && Sharer.isSharing,
	isInt 			= e => Number(e) === e && e % 1 === 0,
	isFloat 		= e => Number(e) === e && e % 1 !== 0,
	callIfFunc 		= e => isFunction(e) ? e() : false,
	angleBetween 	= (a, b) => Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x),
	getClassOf 		= Function.prototype.call.bind(Object.prototype.toString),
	nvl				= (obj1, obj2) => obj1 ? obj1 : obj2,
	getLastElement	= el => isArray(el) && el.length ? el[el.length - 1] : false,
	round 			= (num, val = DEFAULT_ROUND_VAL) => val === 1 ? num : Math.floor(num / val) * val;


glob.toHHMMSS = function(time, decimals = 0) {
    let sec_num = parseInt(time, 10) / 1000;
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10){ hours   = "0" + hours;}
    if (minutes < 10){ minutes = "0" + minutes;}
    if (seconds < 10){
    	seconds = "0" + seconds.toFixed(decimals);
    }
    else {
    	seconds = seconds.toFixed(decimals);
    }
    return hours + ':' + minutes + ':' + seconds;
};

function each(obj, func, thisArg = false){
    let i;
	if(Array.isArray(obj)){
		if(thisArg){
			for(i=0 ; i<obj.length ; i++){
				func.call(thisArg, obj[i], i, obj);
			}
		}
		else{
			for(i=0 ; i<obj.length ; i++){
				func(obj[i], i, obj);
			}
		}
	}
	else{
		if(thisArg){
			for(i in obj){
				if(obj.hasOwnProperty(i)){
					func.call(thisArg, obj[i], i, obj);
				}
			}
		}
		else{
			for(i in obj){
				if(obj.hasOwnProperty(i)){
					func(obj[i], i, obj);
				}
			}
		}
	}
}

glob.loadPage = function(url){
	let tag = document.createElement('script');

	tag.src = url;
	let firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

glob.toString = function(obj){
  for(let i in obj){
      if(obj.hasOwnProperty(i)){
          if(typeof obj[i] === "function"){
              obj[i] = obj[i].toString();
          }
      }
  }
  return JSON.stringify(obj);
};

glob.parse = function(obj){
    let result = JSON.parse(obj);
    for(let i in result){
        if(result.hasOwnProperty(i)){
            if(typeof result[i] === "string"){
                if(result[i].indexOf("function (") === 0){
                    try{
                        eval("result[i] = " + result[i]);
                    }
                    catch(e){
                        result[i] = e;
                    }
                }
            }
        }
    }
    return result;
};

glob.testJSON = function(){
    let testObj = {
        "number" : 23,
        "string" : "gabo",
        "array" : [1, "a", []],
        "object" : {},
        "function" : function(a, b){return a + b;}
    };
    let stringObj = glob.toString(testObj);
    console.log("stringObj: ", stringObj);
    let resultObj = glob.parse(stringObj);
    console.log("resultObj: ", resultObj);
    console.log("test: ", resultObj.function(2, 4));
};

glob.eachFiltered = function(obj, func1, func2, thisArg = false){
	each(obj, (e, i, arr) => func1(e, i, arr) && func2(e, i, arr), thisArg);
};

let Movement = {
	move: function(o, x, y, moveChildrens = true){
		if(o.movementType === MOVEMENT_NONE || (isDefined(o.locked) && o.locked)){
			return;
		}

		if(isFunction(o.change())){
			o.change();
		}

		if(isDefined(o.selectedConnector) && Creator.operation == OPERATION_DRAW_JOIN && o.selectedConnector){

		}
		else if(o.name === OBJECT_AREA){
			o.move(x, y);
		}
		else if(isDefined(o.moveType)){
			if(Creator.operation == OPERATION_DRAW_LINE && Menu.isToolActive()){

			}
			else{
				let oldPos = o.position.getClone();
                let oldSize = o.size.getClone();
				switch(o.moveType){
					case 0:
						o.position.y += y;
						o.size.y -= y;
						break;
					case 1:
						o.size.x += x;
						break;
					case 2:
						o.size.y += y;
						break;
					case 3:
						o.position.x += x;
						o.size.x -= x;
						break;
					case 4:
                        switch(o.movementType){
                            case MOVEMENT_VERTICAL:
                                x = 0;
                                break;
                            case MOVEMENT_HORIZONTAL:
                                y = 0;
                                break;
                        }
						o.position.add(x, y);
						if(moveChildrens){
							o.eachChildren(e => {
								e.moveType = 4;
								Movement.move(e, x, y, false);
								e.moveType = -1;
							});
						}
						break;
					case 5:
						if(!o.minSize || o.size.x + x >= o.minSize.x){
							o.size.x += x;
						}
						if(!o.minSize || o.size.y + y >= o.minSize.y){
							o.size.y += y;
						}
						break;
				}
			}
		}
		else if(isDefined(o.movingPoint)){
		    //zatial iba pre graf ale v buducnosti pre všetko
            if(isFunction(o.move)){
                o.move(x, y);
            }
            else{
                let intVal = 0;
                if(o.movingPoint < 0){//ak sa hýbe celým objektom
                    o.points.forEach(a => a.add(x, y));
                }
                else if(isInt(o.movingPoint)){//ak sa kliklo na bod zlomu tak sa bodom hýbe
                    if(o.movingPoint === 0){
                        o.targetA = "";
                    }
                    else if(o.movingPoint === o.points.length - 1){
                        o.targetB = "";
                    }
                    o.points[o.movingPoint].add(x, y);
                }
                else{//ináč sa vytvára nový bod
                    intVal = parseInt(o.movingPoint) + 1;
                    o.points.splice(intVal, 0, o.points[intVal - 1].getClone().add(o.points[(intVal % o.points.length)]).br(1));
                    o.movingPoint = intVal;
                }
                Entity.findMinAndMax(o.points, o.position, o.size);
            }
		}
		else{
			o.position.add(x, y);
			if(moveChildrens){
				o.eachChildren(e => e.position.add(x, y));
			}
		}

		Events.objectMove(o);
	}
};


function setCursor(val){
	canvas.style.cursor = val;
}

function closeDialog(){
	//$("#modalWindow > div").each((e) => $(e).hide());
	let win = $("#modalWindow");
	win.find("div.formContent").each(function(){
		$(this).hide();
	});
	$("#colorPalete").undelegate();
    win.hide();
	$("canvas").removeClass("blur");
}

function getText(text, position, size, func, thisArg){
    let T, x = $(document.createElement("INPUT"));

	if (arguments.length > 1){
		T = thisArg;
	}

	x.attr({
		type: "text",
		value: text,
		id: "staticInput"
	}).css({
		left: position.x + 'px',
		top: position.y + 'px',
		width: size.x,
		height: size.y,
		fontSize: size.y * 0.6
	}).blur(function(){
		func.call(T, x.val());
		x.remove();
		draw();
	}).keyup(function(e){
		if(e.keyCode == KEY_ENTER){
			x.onblur = false;
			func.call(T, x.val());
			x.remove();
			draw();
		}
	}).appendTo("body");
	x.select().focus();
}

function getFormattedDate(ms = Date.now()) {
    let date = new Date(ms);
	return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " " + date.getMilliseconds();
}

glob.setCookie = function(cname, cvalue, exdays) {
    let d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	document.cookie = cname + "=" + cvalue + ";expires="+ d.toUTCString();
};

glob.getCookie = function(cname) {
    let name = cname + "=",
		ca = document.cookie.split(';'),
		i, c;
	for(i = 0; i <ca.length; i++) {
		c = ca[i];
		while (c.charAt(0) == ' '){
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0){
			return c.substring(name.length,c.length);
		}
	}
	return "";
};

function drawBorder(ctx, o){
	if(!o.selectable || (!o.selected && o.name != "Paint")){
		return;
	}
	doRect({
		position: o.position,
		size: o.size,
		borderWidth: DEFAULT_BORDER_WIDTH << 1,
		lineDash:  [15, 5],
		ctx: ctx
	});

	if(o._selectors.hasOwnProperty("tc")){
		drawSelectArc(ctx, o.position.x + (o.size.x >> 1), o.position.y);
	}
	if(o._selectors.hasOwnProperty("cl")){
		drawSelectArc(ctx, o.position.x, o.position.y + (o.size.y >> 1));
	}
	if(o._selectors.hasOwnProperty("bc")){
		drawSelectArc(ctx, o.position.x + (o.size.x >> 1), o.position.y + o.size.y);
	}
	if(o._selectors.hasOwnProperty("cr")){
		drawSelectArc(ctx, o.position.x + o.size.x, o.position.y + (o.size.y >> 1));
	}

	if(o._selectors.hasOwnProperty("br")){
		drawSelectArc(ctx, o.position.x + o.size.x, o.position.y + o.size.y);
	}
}

glob.rectRectCollision = function(minA, sizeA, minB, sizeB){
    let ax = minA.x;
    let ay = minA.y;
    let bx = minB.x;
    let by = minB.y;
    let aw = sizeA.x;
    let ah = sizeA.y;
    let bw = sizeB.x;
    let bh = sizeB.y;

	return (bx + bw > ax) && (by + bh > ay) && (bx < ax + aw) && (by < ay + ah);
};

function objectToArray(obj){
    let result = [];
	each(obj, e => result[result.length] = e);
	return result;
}

function updateSelectedObjectView(object){
	/*
	 var container = $("#cont_select_obj");
	 container.find("#posX").text(object.position.x);
	 container.find("#posY").text(object.position.y);
	 container.find("#sizeX").text(object.size.x);
	 container.find("#sizeY").text(object.size.y);
	 container.find("#color").css("backgroundColor", object.color).text(object.color);
	 */
}

function drawConnector(vec, obj, ctx){
	vec = vec.getClone().mul(obj.size);
	doArc({
		x: obj.position.x + vec.x,
		y: obj.position.y + vec.y,
		fillColor: CONNECTOR_COLOR,
		center: true,
		width: CONNECTOR_WIDTH,
		height: CONNECTOR_HEIGHT,
		ctx: ctx
	});
}

function drawSelectArc(ctx, x, y, color = SELECTOR_COLOR, size = SELECTOR_SIZE << 1, dots = true){
	doArc({
		x: x,
		y: y,
		center: true,
		width: size,
		height: size,
		fillColor: color,
		borderWidth: DEFAULT_BORDER_WIDTH << 1,
		lineDash:  dots ? [15, 5] : [],
		borderColor: SELECTOR_BORDER_COLOR,
		ctx: ctx
	});
}

glob.showObject = function(obj){
	if(!isObject(obj)){
		console.log("parameter nieje objekt");
		return;
	}
    let type;
	for(let i in obj){
		if(obj.hasOwnProperty(i)){
            let postfix = "";
			type = typeof obj[i];
			type = type === "object" && isArray(obj[i]) ? "array" : type;

			if(type === "array"){
				postfix = " -> " + obj[i].length;
			}
			else if(type === "string" || type === "number" || type === "boolean"){
				postfix = " -> " + obj[i];
			}
			console.log(i + ": [" + type + "]" + postfix);
		}
	}
};

glob.getMousePos = function(canvasDom, mouseEvent) {
    let rect = canvasDom.getBoundingClientRect();
	return {
		x: mouseEvent["touches"][0].clientX - rect.left,
		y: mouseEvent["touches"][0].clientY - rect.top
	};
};

class EventTimer{
	constructor(event, time){
		this._event = event;
		this._time = time;
		this._timeOut = false;
		this._lastTime = Date.now();
	}

	_callEvent(inst = this){
		inst._event();
		if(inst._timeOut){
			clearTimeout(inst._timeOut);
			inst._timeOut = false;
		}
		inst._lastTime = Date.now();
	}

	_setTimeOut(diff){
		if(this._timeOut){
			return;
		}
		this._timeOut = setTimeout(() => this._callEvent(this) , this._time - diff);
	}

	callIfCan(){
        let diff = Date.now() - this._lastTime;
		diff > this._time ? this._callEvent() : this._setTimeOut(diff);
	}
}

/*
function setConstants(data){
	var constants = {};
	var setConstant = (key, val) => {
		key = key.toUpperCase();
		constants[key] = val;
		Object.defineProperty(window, key, { value : val, writable: false });
	};
	each(data, (e, i) => {
		if(typeof e === "object"){
			each(e, (ee, ii) => {
				if(typeof ee === "object"){
					each(ee, (eee, iii) => {
						if(typeof eee === "object"){
							each(eee, (eeee, iiii) => {
								setConstant(i + "_" + ii + "_" + iii + "_" + iiii, eeee);
							});
						}
						else{
							setConstant(i + "_" + ii + "_" + iii, eee);
						}
					});
				}
				else{
					setConstant(i + "_" + ii, ee);
				}
			});
		}
		else{
			setConstant(i, e);
		}
	});
	return constants;
}
*/

/**************************************************************************************
POLYFILLS
**************************************************************************************/

/*****************
MOJE
*****************/
if(!String.prototype.startsWith){
	String.prototype.startsWith = function(char){
		var s = String(this);
		if(s.length === 0){
			return false;
		}
		return s.charAt(0) === char;
	};
}
/*****************
DEFAULTNE
*****************/

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this === null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception. 
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. Let o be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of o with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = o.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of o with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of o with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}

if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP ? this : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype; 
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
