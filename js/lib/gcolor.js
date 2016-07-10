class Color{
	constructor(){
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

	static _HEX2RGB(color) {
		var num = parseInt(color.slice(1), 16);
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
		var x = val.toString(16);
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



	/*
	 * SETTERS
	 */
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
			if(Array.isArray(arguments[0])){
				this._r = arguments[0][0];
				this._g = arguments[0][1];
				this._b = arguments[0][2];
			}
			else if(typeof arguments[0] === "number"){
				arguments[0] = Math.min(255, Math.max(0, arguments[0]));
				this._r = arguments[0];
				this._g = arguments[0];
				this._b = arguments[0];
			}
		}
		else if(arguments.length == 3){
			this._r = arguments[0];
			this._g = arguments[1];
			this._b = arguments[2];
		}
		this._rgbUpdate();
		return this;
	}

	setColor(){
		if(!arguments.length)
			this.setRGBA(0, 0, 0, 255);
		else if(arguments.length == 1){
			if(typeof arguments[0] === "number")
				this.int = arguments[0];
			else if(Array.isArray(arguments[0]))
				this.setRGB(arguments[0]);
			else if(typeof arguments[0] === "string"){
				if(Color._namedColors.hasOwnProperty(arguments[0]))
					this.setColor(Color._namedColors[arguments[0]]);
				else
					this.hex = arguments[0];
			}
			this._a = 255;
		}
		else if(arguments.length == 3)
			this.setRGBA(arguments[0], arguments[1], arguments[2], 255);
		else if(arguments.length == 4)
			this.setRGBA.apply(this, arguments);
		else
			console.error("setRGBA: parametrov: 0-4, zadanych: " + arguments.length + ", parametre: ",arguments);

		return this;
	}

	setRGBA(){
		if(arguments.length == 4){
			this._a = arguments[3];
			this.setRGB(arguments[0], arguments[1], arguments[2]);
		}
		else
			console.error("setRGBA: parametrov: 4, zadanych: " + arguments.length + ", parametre: ",arguments);

		return this;
	}
}