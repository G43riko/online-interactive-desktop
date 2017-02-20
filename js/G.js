/*
 * G(selector) - vyhladá elementy podla selectora a vráti G object
 * G(nazov, {attr:{}, "obsah elementu", style:{}}) - vytvorý nový G object
 * G(nazov, {attr:{}, element, style:{}}) - vytvorý nový G object
 *
 * @param args - argumenty funkcie
 * @constructor
 */
var G = function(){
	//ak sa nevolá ako konštruktor
	if(!(this instanceof G)){
		var inst = Object.create(G.prototype);
		G.apply(inst, arguments);
		return inst;
	}
	if(arguments.length === 0){
		this.elements = [];
	}
	else if(arguments.length === 1){
		if(G.isString(arguments[0])){ //query selector
			this.elements = G.find(arguments[0]);
		}
		else if(G.isArray(arguments[0])){ //pole elementov
			this.elements = [];
			G.each(arguments[0], e => {
				if(G.isElement(e)){
					this.elements[this.elements.length] = e;
				}
			});
		}
		else if(G.isElement(arguments[0])){ //HTML Element
			this.elements = [arguments[0]];
		}
		else if(arguments[0] !== null && G.isDefined(arguments[0]) && G.isG(arguments[0])){ //G Object
			this.elements = arguments[0].elements;
		}
	}
	else if(arguments.length === 2 && G.isString(arguments[0]) && G.isObject(arguments[1])){
		this.elements = [G.createElement(arguments[0], arguments[1].attr, arguments[1].cont, arguments[1].style)];
	}

	//ak nieje definované pole elementov upozorníme používatela a vytvoríme ho
	if(G.isUndefined(this.elements)){
		G.warn("nepodarilo sa rozpoznať argumenty: ", arguments);
		this.elements = [];
	}
	//ak zoznam elementov nieje pole tak vytvoríme pole a upozorníme používatela
	if(!G.isArray(this.elements)){
		G.warn("elementy niesu pole ale " + G.typeOf(this.elements), arguments);
		this.elements = [];
	}
	this.size = this.length();
};


var tests = function(G){
	var body = new G(document.body);

	body.append(G.createElement("div", {id: "idecko"}, "id"));
	body.append(G.createElement("div", {class: "classa"}, "id"));
	body.append(G.createElement("div", {id: "rodic"}, [
		G.createElement("div", {class: "aaa"}),
		G.createElement("div", {class: "aaa"},
			G.createElement("ul", {}, [
				G.createElement("li"),
				G.createElement("li", {class: "temno"}, "temno vnutorne"),
				G.createElement("li"),
				G.createElement("li")
			])
		),
		G.createElement("div", {class: "aaa"})
	]));
	body.append(G.createElement("div", {class: "temno"}, "temno vonkajsie"));

	/*
	 * empty();
	 * append();
	 * length();
	 * createElement();
	 */
	body.empty();
	if(body.children().length() !== 0){
		G.warn("dlžka prazdneho objektu je: " + body.length());
	}

	body.append("<div id='idecko'>jupilajda</div>");
	body.append(new G("div", {
		attr : {
			class: "clasa"
		},
		cont: "toto je classsa"
	}));
	var elementP = document.createElement("p");
	elementP.appendChild(document.createTextNode("juhuuu toto je paragraf"));
	body.append(elementP);
	if(body.children().length() !== 3){
		G.warn("dlžka objektu s 2 detmi je: " + body.children().length());
	}

	var idecko = new G("#idecko");
	var clasa = new G(".clasa");
	var par = new G("p");

	/*
	 * constructor()
	 * find()
	 * first();
	 */

	if(G.isDefined(new G().first())){
		G.warn("pri prazdnom G to nevratilo ako prvý element null");
	}

	if(idecko.first() !== document.getElementById("idecko")){
		G.warn("nenašiel sa správny element podla id");
	}

	if(clasa.first() !== document.getElementsByClassName("clasa")[0]){
		G.warn("nenašiel sa správny element podla class");
	}

	if(par.first() !== document.getElementsByTagName("p")[0]){
		G.warn("nenašiel sa správny element podla tagu");
	}

	/*
	 * css
	 */

	if(!G.isObject(idecko.css())){
		G.error("css() nevratilo objekt");
	}

	idecko.css("color", "");
	if(idecko.css("color") !== ""){
		G.error("nenastavený css nieje prazdny");
	}

	idecko.css("color", "red");
	if(idecko.css("color") !== "red"){
		G.error("nesprávne to nastavilo css štýl");
	}

	idecko.css({color: "blue", width: "200px"});

	if(idecko.css("color") !== "blue" || idecko.css("width") !== "200px"){
		G.error("nesprávne to nastavilo css štýl s objektu");
	}

	if(idecko.parent().first() !== body.first()){
		G.error("parent nefunguje správne");
	}

	/*
	 * extends
	 */

	var a = {a: "aa"};
	var b = {b: "bb", c: "cc"};
	var c = {a: "aaa", c: "cccc"};

	var res = G.extend({}, a, b, c);

	if(res.a !== "aaa" || res.b !== "bb" || res.c !== "cccc"){
		G.error("nefunguje extendse pretože po zlučenie", a, b, c, " vzniklo: ", res, "a malo vzniknut: ", {a: "aaa", b: "bb", c: "cccc"});
	}


	/*
	 * find, parents, parent, is, prev, childrens, next, attr
	 */

	G("div", {
		attr: {id: "container"},
		cont: [
			G.createElement("nav", {id: "topMenu"}, [
					G.createElement("ul", {}, [
						G.createElement("li", {},
							G.createElement("a", {class: "firstLink", href: "stranka"})
						),
						G.createElement("li", {},
							G.createElement("a", {class: "secondLink"})
						)
					]),
					G.createElement("div", {id: "wrapper", class: "wrappedDiv"},
						G.createElement("nav", {id: "rightMenu"},
							G.createElement("ul", {class: "secondUl"}, [
								G.createElement("li", {class: "firstLi"},
									G.createElement("a", {class: "firstLink"})
								),
								G.createElement("li", {class: "middleLi disabled"},
									G.createElement("a", {class: "secondLink"})
								),
								G.createElement("li", {class: "lastLi disabled"},
									G.createElement("a", {class: "thirdLink"})
								),
							])
						)
					)
				]
			)]
	}).appendTo(body);

	if(G("#topMenu").find(".firstLink").attr("href") !== "stranka"){
		console.log("zlihalo 1");
	}
	if(G(".thirdLink").parents("#wrapper").is(".wrappedDiv") !== true){
		console.log("zlihalo 2");
	}
	if(G("#rightMenu").find("ul").children(":not(.disabled)").is(".firstLi") === false){
		console.log("zlihalo 3");
	}
	if(G(".middleLi").prev().is(".firstLi") !== true){
		console.log("zlihalo 4");
	}
	if(G(".middleLi").next().is(".lastLi") !== true){
		console.log("zlihalo 5");
	}
	if(G(".secondUl").parent().is("#rightMenu") !== true){
		console.log("zlihalo 6");
	}

	/*
     * //click
	 */

	body.append(G.createElement("span", {id: "resultSpan"}));

	if(G("#resultSpan").text() !== ""){
		console.log("zlahalo 1");
	}
	body.append(G.createElement("input", {type: "button", id: "resultButton", value: "klikni"}));


	var clickFunction = function(){
		G("#resultSpan").text("kuriatko");
	};

	G("#resultButton").click(clickFunction);

	G("#resultButton").first().click();

	if(G("#resultSpan").text() !== "kuriatko"){
		console.log("zlahalo 2");
	}

	G("#resultButton").unbind("click", clickFunction);
	G("#resultSpan").text("maciatko");
	G("#resultButton").first().click();

	if(G("#resultSpan").text() !== "maciatko"){
		console.log("zlahalo 3");
	}

	/*
	 * APPEND
	 */
	var parent = new G("div", {attr: {id :"parentElement"}});
	parent.append("<li>a</li>");
	parent.append(new G("li", {cont: "b"}));
	parent.append(G.createElement("li", {}, "c"));
	if(parent.text() !== "abc"){
		console.log("append nefunguje");
	}

	/*
	 * HTML
	 */
	parent = new G("div", {attr: {id :"parentElement"}});
	parent.html("<li>abc</li>");
	if(parent.text() !== "abc" && parent.html() !== "<li>abc</li>"){
		console.log("html nefunguje 1");
	}
	parent.html("abc");
	if(parent.text() !== "abc" && parent.html() !== "abc"){
		console.log("html nefunguje 2");
	}
	parent.html(G.createElement("li", {}, "abc"));
	if(parent.text() !== "abc" && parent.html() !== "<li>abc</li>"){
		console.log("html nefunguje 3");
	}
	parent.html("+abc");
	if(parent.text() !== "abcabc" && parent.html() !== "<li>abc</li>abc"){
		console.log("html nefunguje 4");
	}
	parent.html("+<li>abc</li>");
	if(parent.text() !== "abcabcabc" && parent.html() !== "<li>abc</li>abc<li>abc</li>"){
		console.log("html nefunguje 5");
	}
	if(parent.children().length() !== 2){
		console.log("html nefunguje 6");
	}
	

	//ADD

	var data = new G();
	data.add(G.createElement("span", {class: "pes macka"}, "volačo"));
	data.add(G.createElement("div", {class: "pes kura"}, "niečo iné"));
	data.add(G.createElement("p", {class: "macka kura"}, "niečo zasa iné"));
	if(data.has(".pes").length() !== 2){
		console.log("add nefunguje 1");
	}
	if(data.has(".pterodaktil").length() !== 0){
		console.log("add nefunguje 2");
	}
	if(data.not(".kura").length() !== 1){
		console.log("not nefunguje 2");
	}
};


/**
 * Funkcia spustí AJAXové volanie na danu url a po uspešnej odpovedi zavolá callback funkciu
 *
 * @param url
 * @param options
 * @param dataType
 * @returns {*}
 */
G.ajax = function(url, options, dataType){
	var start = 0;
	/*
	if(!window.XMLHttpRequest){
		G.error("Lutujeme ale váš prehliadaš nepodporuje AJAX");
		return false;
	}
	*/
	var http = window.XMLHttpRequest ?  new XMLHttpRequest() :  new ActiveXObject("Microsoft.XMLHTTP");

	if(G.isFunction(options)){
		options = {success: options};
		if(G.isString(dataType)){
			options.dataType = dataType;
		}
	}
	else if(!G.isObject(options)){
		options = {};
	}

	if(!G.isString(url)){
		G.error("url nieje string a je: ", url);
		return false;
	}

	options.method = options.method || "GET";
	options.async  = options.async || true;

	if(G.isFunction(options.abort)){
		http.onabort = options.abort;
	}
	if(G.isFunction(options.error)){
		http.onerror = options.error;
	}
	if(G.isFunction(options.progress)){
		http.onprogress = options.progress;
	}
	if(G.isFunction(options.timeout)){
		http.ontimeout = options.timeout;
	}
	if(G.isFunction(options.loadEnd)){
		http.onloadend = () => options.loadEnd((G.now() - start));
	}
	if(G.isFunction(options.loadStart)){
		http.onloadstart = () => {
			options.loadStart();
			start = G.now();
		};
	}

	if(G.isFunction(options.success)){
		http.onreadystatechange = () => {
			if (http.readyState === 4 && http.status === 200){
				switch(options.dataType){
					case "json" :
						options.success(JSON.parse(http.responseText));
						break;
					case "html" :
						options.success(new DOMParser().parseFromString(http.responseText, "text/xml"));
						break;
					case "xml" :
						options.success(new DOMParser().parseFromString(http.responseText, "text/xml"));
						break;
					default :
						options.success(http.responseText);
				}
			}
		};
	}
	else{
		G.error("nieje zadaná Succes funkcia");
	}
	http.open(options.method, url, options.async);
	http.send();
	return http;
};

G.loadScript = function(src, async) {
    var script, tag;

	if(!G.isBool(async)){
		async = false;
	}

    script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = async;
    script.src = src;

    tag = G.byTag('script')[0];
    tag.parentNode.insertBefore(script, tag);
    return script;
};

/*************************************************************************************
 UTILITOVE FUNKCIE
 *************************************************************************************/

G.byClass 	= title => document.getElementsByClassName(title);
G.byName 	= title => document.getElementsByName(title);
G.byTag 	= title => document.getElementsByTagName(title);
G.byId 		= title => document.getElementById(title);

G.hasClass = function(element, className){
	if(G.isElement(element) && G.isString(className)){
		return element.classList.contains(className);
	}
	G.warn("argumenty musia byť (element, string) a sú ", G.typeOf(element), G.typeOf(className));
	return false;
};

/**
 * Funkcie spracuje chybové hlášky
 * @param arguments
 */
G.error = function(){
	console.error.apply(console, arguments);
};

G.warn = function(){
	console.warn.apply(console, arguments);
};

G.log = function(){
	console.log.apply(console, arguments);
};

/*
 G._error = function(key, ...args){
 //TODO všetky výpisi budú du zoradené podla IDčka chyby
 };
 */

/**
 * Funkcia vytvorý nový element a vráty ho
 *
 * G.createElement("div") => <div></div>;
 * G.createElement("div", {id: "ide"}) => <div id="ide"></div>;
 * G.createElement("div", {}, "text") => <div>text</div>;
 * G.createElement("div", {}, "<b>text</b>") => <div><b>text</b></div>;
 * G.createElement("div", {}, "text", {color: "blue"}) => <div style="color: blue;">text</div>
 *
 * @param name - názov elementu
 * @param attr - objekt kde kluče su nazvy atribútov a hodnoty su hodnoty atribútov
 * @param cont - string s textom alebo element alebo pole elementov
 * @param style - objekt kde kluče su nazvy štýlov a hodnoty su hodnoty štýlov
 * @returns {Element} - novo vytvorený element
 */
G.createElement = function(name, attr, cont, style){
	var el;

	//ak je prvý parameter objekt tak zavoláme rekurzívne túto funkciu s hodnotami objektu
	if(G.isObject(name)){
		if(G.isString(name.name)){
			G.createElement(name.name, name.attr || {}, name.cont || "", name.style || {});
		}
		else{
			return G.error("prví parameter funkcie[Object] musí obsahovať name[String] ale ten je: ", name.name);
		}
	}

	//Vytvoríme element podla názvu
	if(G.isString(name)){
		el = document.createElement(name);
	}
	else{
		return G.error("prvý parameter(nazov elementu) musí byť string a je: ", name);
	}
	//Ak sú atributy objekt tak priradíme elementu všetky atribúty
	if(G.isObject(attr)){
		G.each(attr, (e, i) => el.setAttribute(i, e));
	}
	//Ak sú štýly objekt tak priradíme elementu všetky štýly
	if(G.isObject(style)){
		G.each(style, (e, i) => el.style[i] = e);
	}

	//Priradíme elementu obsah
	if(G.isString(cont)){
		G.html(el, cont);
	}
	else if(G.isArray(cont)){
		G.each(cont, e => {
			if(G.isElement(e)){
				el.appendChild(e);
			}
		});
	}
	else if(G.isElement(cont)){
		el.appendChild(cont);
	}
	else if(G.isG(cont)){
		el.appendChild(cont.first());
	}

	return el;
};
G.now = () => new Date().getTime();
G.typeOf = val => typeof val;
G.isFunction = val => G.typeOf(val) === "function";
G.isDefined = val => G.typeOf(val) !== "undefined";
G.isString = val => G.typeOf(val) === "string";
G.isObject = val => G.typeOf(val) === "object";
G.isNumber = val => G.typeOf(val) === "number";
//G.isNum = obj => !G.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
G.isInt = val => G.isNumber(val) && val % 1 === 0;
G.isFloat = val => G.isNumber(val) && val % 1 !== 0;
G.isBool = val => G.typeOf(val) === "boolean";
//G.isG = val => G.isObject(val) && val.__proto__ === G.prototype;
G.isG = val => G.isObject(val) && Object.getPrototypeOf(val) === G.prototype;
G.isUndefined = val => !G.isDefined(val);
//G.isArray = val => Array.isArray(val);
G.isArray = val => Object.prototype.toString.call(val) === '[object Array]';
G.isToStringable = val => G.isNumber(val) || G.isString(val) || G.isBool(val); //deprecated since 29.1.2017
G.isEmpty = val => val === {} || val === [] || val === "";
//G.isGElement = val => val["isGElement"] === true;
G.isElement = obj => {
	try {
		return obj instanceof HTMLElement;
	}
	catch(e){
		return G.isObject(obj) && 
			   obj.nodeType === 1 && 
			   G.isObject(obj.style) && 
			   G.isObject(obj.ownerDocument);
	}
};


/**
 * Funkcia vráti posledný prvok pola ak existuje alebo undefined
 *
 * @param arr - pole ktorého posledný prvok potrebujeme
 * @returns object - posledný prvok alebo undefined
 */
G.last = function(arr){
	if(!G.isArray(arr)){
		return undefined;
	}

	if(arr.length === 0){
		return undefined;
	}

	return arr[arr.length - 1];
};

/**
 * Funkcia či sa prvok nachádza v poli alebo v zozname argumentov
 *
 * @param obj
 * @param data
 * @returns {boolean}
 */
G.isIn = function(obj, data){//testovane 8.1.2017
	if(G.isArray(data)){
		if(data.indexOf(obj) >= 0){
			return true;
		}
	}
	else{
		for(var i=1 ; i<arguments.length ; i++){
			if(arguments[i] === obj){
				return true;
			}
		}
	}
	return false;
};

/**
 * Funkcia zlúči objekty na vstupe do jedného (prvého) objektu
 *
 * G.extend({a: "aa", b: "bb"}, {c: "cc", a: "aaa"}, {c: "ccc"}) => Object {a: "aaa", b: "bb", c: "ccc"}
 */
 G.extend = function(target, ... args){
	 if(G.isObject(target)){
		G.each(args, (e, i) => {
			if(G.isObject(e)){
				G.each(e, (ee, key) => target[key] = ee);
			}
			else{
				G.error("args[" + i + "] ma byť object a je : ", e);
			}
		});
	 }
	 else{
	 	G.error("prvý argument musí byť objekt. teraz je: ", target);
	 }
	 return target;
 };
 
 G.matches = function(element, queryString){
 	/*
 	//ak prvý parameter nieje element vráti false
 	if(!G.isElement(element)){
 		return false;
 	}
 	//ak druhý parameter nieje string vráti false
 	if(!G.isString(queryString)){
 		return false;
 	}
	*/
 	//porovnám či element vyhovuje selectoru
	try{
		return element.matches(queryString);
	}
	catch(err){
		G.error(err);
	}
 	return false;
 };

/**
 * Funkcia preloopuje pole alebo objekt daný ako argument a zavolá funkciu a
 * umožnuje nastaviť lubovolný this objekt.
 * V prípade že funckia daná ako argument vráti false tak sa loop ukončí
 *
 * @param obj - objekt ktorý sa má preloopovať
 * @param func - funkcia ktorá sa má zavoláť pre každý objekt a jej parametre su: (element, index, pole)
 * @param thisArg - objekt ktorý má byť dosadený sa this premennú
 */
G.each = function(obj, func, thisArg){
	var i;
	if(G.isObject(obj) && G.isFunction(func)){
		if(G.isArray(obj)){
			if(G.isObject(thisArg)){
				for(i = 0 ; i<obj.length ; i++){
					if(func.call(thisArg, obj[i], i, obj) === false){
						break;
					}
				}
			}
			else{
				for(i = 0 ; i<obj.length ; i++){
					if(func(obj[i], i, obj) === false){
						break;
					}
				}
			}
		}
		else{
			if(G.isObject(thisArg)){
				for(i in obj){
					if(obj.hasOwnProperty(i)){
						if(func.call(thisArg, obj[i], i, obj) === false){
							break;
						}
					}
				}
			}
			else{
				for(i in obj){
					if(obj.hasOwnProperty(i)){
						if(func(obj[i], i, obj) === false){
							break;
						}
					}
				}
			}
		}
	}
	else{
		G.error("argumenty majú byť (object, function) a sú:", obj, func);
	}
};


/**
 * Funkcia najde v rodičovnskom objekde objekty ktoré najde CSS selector
 *
 * @param queryString - klúč podla ktorého sa má hladať
 * @param parent - element v ktorom sa má hladadť. Defaultne je do document
 * @returns {Array} - pole nájdených výsledkov
 */
G.find = function(queryString, parent){//testovane 28.1.2017
	var result = [];

	if(!G.isElement(parent)){
		parent = document;
	}

	if(G.isString(queryString)){
		var data = parent.querySelectorAll(queryString);
		G.each(data, e => result[result.length] = e);
	}
	else{
		G.error("argument funkcie musí byť string a je ", queryString);
	}

	return result;
};

/**
 * Funkcia vráti rodičovský element elementu na vstupe alebo null
 *
 * @param element - element ktorému sa hladá rodičovský element
 * @returns {Element} - rodičovský element alebo null ak sa nenašiel rodič
 */
G.parent = function(element){//testovane 28.1.2017
	if(G.isElement(element)){
		return element.parentElement;
	}

	G.warn("argument funcie musí byť element a teraz je: ", element);
	return null;
};

/**
 * Funkcia vráti rodičovské elementy elementu na vstupe alebo []
 *
 * @param element - element ktorému sa hladájú rodičovské elementy
 * @param condition = "" - podmienka pre rodičovksé elementy ktoré sa majú vrátiť
 * @param finish = "" - podmienka rodičovký element po ktorý sa má hladať
 * @param limit = 0 - maximálne počet elementov kolko sa má nájsť alebo 0 ak hladáme všetky
 * @returns {Element[]} - rodičovské elementy alebo [] ak sa nenašiel žiadny rodič
 */
G.parents = function(params){//testovane 28.1.2017
	return G._iterate({
		condition: 	G.isString(params.condition) ? params.condition : "",
		finish: 	G.isString(params.finish) ? params.finish : "",
		limit: 		G.isNumber(params.limit) ? params.limit : 0,
		operation: 	e => e.parentElement,
		element: 	params.element
	});
};

G._iterate = function(params){
	var result 	= [];

	if(!G.isElement(params.element) || !G.isFunction(params.operation)){
		return result;
	}

	params.element = params.operation(params.element);
	while(params.element){
		if(G.isEmpty(params.condition) || G.matches(params.element, params.condition)){
			result[result.length] = params.element;
			if(params.limit && result.length === params.limit){
				break;
			}
			if(params.finish && G.matches(params.element, params.finish)){
				break;
			}
		}
		params.element = params.operation(params.element);
	}
	return result;
};

/**
 * Funkcia nastavý alebo pridá obsah elementu
 *
 * @param element
 * @param text
 * @param append = false
 * @returns {*}
 */


G.text = function(element, text, append = false){
	if(G.isElement(element)){
		if(G.isUndefined(text)){
			return element.textContent;
		}

		if(G.isString(text)){
			if(append === true){
				element.textContent += text;
			}
			else{
				element.textContent = text;
			}
		}
		else{
			G.error("druhý argument musí byť string a je: ", text);
		}
	}
	else{
		G.error("prvý argument musí byť objekt a je: ", element);
	}
	return element;
};

/**
 * Funkcia nastavý alebo pridá html obsah elementu
 *
 * @param element
 * @param html
 * @param append
 * @returns {*}
 */
G.html = function(element, html, append = false){//testovane 29.1.2017
	if(G.isElement(element)){
		if(G.isUndefined(html)){
			return element.innerHTML();
		}

		if(G.isString(html)){
			if(append){
				element.innerHTML += html;
			}
			else{
				element.innerHTML = html;
			}
		}
		else{
			G.error("druhý argument musí byť string a je: ", html);
		}
	}
	else{
		G.error("prvý argument musí byť objekt a je: ", element);
	}
	return element;
};


/**
 * Funkcia vráti dalšieho surodenca elementu
 * @param element
 * @returns {*}
 */
G.next = function (params){//testovane 28.1.2017
	if(G.isElement(params)){
		return params.nextElementSibling;
	}
	return G._iterate({
		condition: 	G.isString(params.condition) ? params.condition : "",
		finish: 	G.isString(params.finish) ? params.finish : "",
		limit: 		G.isNumber(params.limit) ? params.limit : 0,
		operation: 	e => e.nextElementSibling,
		element: 	params.element
	});
};


/**
 * Funkcia vráti predchádzajúceho súrodenca elementu
 * @param element
 * @returns {*}
 */
G.prev = function (params){//testovane 28.1.2017
	if(G.isElement(params)){
		return params.previousElementSibling;
	}
	return G._iterate({
		condition: 	G.isString(params.condition) ? params.condition : "",
		finish: 	G.isString(params.finish) ? params.finish : "",
		limit: 		G.isNumber(params.limit) ? params.limit : 0,
		operation: 	e => e.previousElementSibling,
		element: 	params.element
	});
};


/**
 * Funkcia vráti pole deti elementu na vstupe
 *
 * @param element - element ktorého deti sa majú vrátiť
 * @param condition = "" - podmienka pre deti ktoré sa majú vrátiť
 * @returns {Element[]} - pole elementov detí elebo prázdne pole ak element nemá žiadne deti
 */

G.childrens = function(element, condition = "*"){
	if(!G.isString(condition) || G.isEmpty(condition)){
		condition = "*";
	}
	var result = [];
	if(G.isElement(element)){
		var data = element.children;
		G.each(data, element => {
			if(result.indexOf(element) < 0){//ak sa nenachádze medzi výsledkami
				if(G.matches(element, condition)){
					result[result.length] = element;
				}
			}
		});
	}
	else{
		G.error("argument funcie musí byť element a teraz je: ", element);
	}
	return result;
};

G.children = function(element, condition = "*"){//testovane 28.1.2017 //deprecated since 29.1.2017, poižiť G.childrens
	return G.childrens(element, condition);
};


/**
 * Funkcia vymaže element na vstupe
 *
 * @param element - element ktorý sa má vymazať
 */
G.delete = function(element){
	try{
		element.parentElement.removeChild(element);
	}
	catch(err){
		G.error("pri mazaní nastala chyba: ", err);
	}
	/*
	if(G.isElement(element)){
		element.parentElement.removeChild(element);
	}
	else{
		G.error("argument funcie musí byť element a teraz je: ", element);
	}
	*/
};

/*************************************************************************************
 FUNKCIE NA UPRAVU G ELEMENTU
 *************************************************************************************/

/**
 * Funcia zistí čí prví element spĺňa podmienku
 *
 * @param selectorString - podmienka ktorú musí element splniť
 * @return boolean - či objekt spĺňa podmienku alebo null ak sa žiadny objekt nenachádza alebo je zlý selector
 */

G.prototype.is = function(selectorString){//testovane 28.1.2017
	if(this.isEmpty()){
		return false;
	}

	return G.matches(this.first(), selectorString);
};

/**
 * Funckia zistí či sa selector zadaný ako parameter nezhoduje s elementom
 *
 * @param selectorString - paramter ktorý sa negovaný porovná s elementom
 * @returns boolean - či objekt spĺna podmienku
 */
G.prototype.not = function(selectorString){
	return this.has(":not(" + selectorString + ")");
};

/**
 * Funkcia vráti G objekt obsahujúci elementy s pôvodného objektu 
 * ktoré spĺnajú podmienku danú ako parameter
 *
 * @param selectorString - podmienka podla ktorého sa vyberajú vhodné elementy
 * @returns {G} - G objekt
 */
G.prototype.has = function(selectorString){
	var result = new G();

	this.each(function(){
		if(G.matches(this, selectorString)){
			result.add(this);
		}
	});

	return result;
};

/**
 * Funkcia pridá do objektu elementy ktoré sú na vstupe alebo string pre vyhladanie
 *
 * @param arguments - objekty ktoré sa majú pridať
 * @returns {G} - G objekt
 */
G.prototype.add = function(){
	G.each(arguments, (e, i) => {
		if(G.isElement(e)){
			this.elements[this.elements.length] = e;
		}
		else if(G.isString(e)){
			this.elements.push.apply(this, G.find(e));
		}
		else{
			G.error("argumenty funkcie: (string[]), " + i +" -ty argument: ", e);
		}
	});
	return this;
};


/**
 * Funkcia vymaže všetky objekty na vstupe
 *
 * @param arguments
 * @returns {G}
 */
G.prototype.remove = function(){//TODO otestovať
	var index;
	G.each(arguments, e => {
		if(G.isElement(e)){
			index = this.elements.indexOf(e);
			if(index >= 0){
				this.elements.splice(index, 1);
			}
		}
	});
	return this;
};


/**
 * Funkcia vyprázdni obsah G objektu
 *
 * @returns {G}
 */
G.prototype.clear = function(){
	this.elements = [];
	return this;
};

/**
 * Funckia porovná 2 G objekty či majú všetky prvky rovnaké
 *
 * @param obj - G objekt s ktorým sa má porovnať
 * @returns {boolean}
 */
G.prototype.equalAll = function(obj){
	//ak parameter nieje G objekt tak vráti false
	if(!G.isG(obj)){
		return false;
	}

	//ak nesedia dĺžky tak vráti false
	if(obj.length() !== this.length()){
		return false;
	}

	//ak sa nejaký element nenachádza v druhom elemente tak vráti false
	G.each(this.elements, e => {
		if(obj.elements.indexOf(e) < 0){
			return false;
		}
	});

	//ak sa nejaký element nenachádza v tomto element tak vráti false
	G.each(obj.elements, e => {
		if(this.elements.indexOf(e) < 0){
			return false;
		}
	});
	//ak všetko úspešne skontrolovalo tak vráti true
	return true;
};

/**
 *
 * @param element
 * @returns {boolean}
 */
G.prototype.contains = function(element){//TODO otestovať
	if(G.isElement){
		for(var i=0 ; i<this.element.length ; i++){
			if(this.element[i] === element){
				return true;
			}
		}
	}
	else{
		G.error("argument funkcie musí byť element a teraz je: ", element);
	}

	return false;
};

/**
 * Funcka porovná či sa G objekt zhoduje s parametrom čo je buď G objekt alebo element 
 *
 * @param element
 * @returns {boolean}
 */
G.prototype.equal = function(element) {
	if (G.isG(element)){
		return this.first() === element.first();
	}
	else if (G.isElement(element)){
		return this.first() === element;
	}
	else{
		G.error("argument funkcie môže byť iba element alebo G objekt");
	}
	return false;
};

/*************************************************************************************
 FUNKCIE NA ZJEDNODUSENIE
 *************************************************************************************/


G.prototype.width = function(){//testovane 26.1.2017
	if(this.isEmpty()){
		return null;
	}
	return this.first().offsetWidth;
};

G.prototype.height = function(){//testovane 26.1.2017
	if(this.isEmpty()){
		return null;
	}
	return this.first().offsetHeight;
};

G.prototype.show = function(){
	return this.css("display", "block");
};

G.prototype.hide = function(){
	return this.css("display", "none");
};

G.prototype.toggle = function(){
	return  this.css("display") === "none" ? this.show() : this.hide();
};

G.prototype.emptyAll = function(){
	G.each(this.elements, e => G.html(e, ""));
	return this;
};

G.prototype.empty = function(){
	return this.html("");
};

G.prototype.hasClass = function(className){
	return this.class(className);
};

G.prototype.val = function(){
	return this.attr("value", arguments[0]);
};

G.prototype.addClass = function(className){
	return this.class("+" + className);
};

G.prototype.removeClass = function(className){
	return this.class("-" + className);
};

G.prototype.toggleClass = function(className){
	return this.class("/" + className);
};

/*************************************************************************************
 TRAVERSINGOVE FUNKCIE
 *************************************************************************************/

/**
 *
 */
G.prototype.parents = function(selectorString = ""){//testovane 28.1.2017
	return new G(G.parents({
		element: this.first(), 
		condition: selectorString
	}));
};

G.prototype.parentsUntil = function(selectorString = ""){//testovane 28.1.2017
	return new G(G.parents({
		element: this.first(), 
		finish: selectorString
	}));
};

/**
 *
 *
 */
G.prototype.find = function(selectorString){//testovane 28.1.2017
	return new G(G.find(selectorString, this.first()));
};


/**
 * Funkcia vráti G objekt obsahujuci rodiča daného elementu
 *
 * @returns {G}
 */
G.prototype.parent = function(){//testovane 29.1.2017
	return new G(G.parent(this.first()));
};

G.prototype.next = function(){//testovane 29.1.2017
	return new G(G.next(this.first()));
};

G.prototype.nextAll = function(selectorString = ""){//TODO otestovať
	return new G(G.next({
		element: this.first(),
		condition: selectorString
	}));
};

G.prototype.nextUntil = function(selectorString = ""){//TODO otestovať
	return new G(G.next({
		element: this.first(),
		finish: selectorString
	}));
};

G.prototype.prev = function(){//testovane 29.1.2017
	return new G(G.prev(this.first()));
};

G.prototype.prevAll = function(selectorString = ""){//TODO otestovať
	return new G(G.prev({
		element: this.first(),
		condition: selectorString
	}));
};

G.prototype.prevUntil = function(selectorString = ""){//TODO otestovať
	return new G(G.prev({
		element: this.first(),
		finish: selectorString
	}));
};

G.prototype.children = function(selectorString = ""){//deprecated 11.2.2017
	return this.childrens(selectorString);
};
G.prototype.childrens = function(selectorString = ""){//TODO otestovať - pridať možnosť filtrovať deti
	return new G(G.childrens(this.first(), selectorString));
};
/*************************************************************************************
 NEZARADENE FUNKCIE
 *************************************************************************************/

G.prototype.first = function(){//testovane 29.1.2017
	return this.elements[0];
};

G.prototype.length = function(){//testovane 29.1.2017
	return this.elements.length;
};

G.prototype.isEmpty = function(){//testovane 29.1.2017
	return this.length() === 0;
};

G.prototype.each = function(func, ...args){//testovane 29.1.2017
	if(G.isFunction(func)){
		G.each(this.elements, e => func.apply(e, args));
	}
	else{
		G.error("prvý parameter musí byť funkcia a je: ", func);
	}

	return this;
 };
 

/*************************************************************************************
 HTML/CSS FUNKCIE
 *************************************************************************************/


/**
 * Funkcia zmaže všetky objekty uložené v G objekte
 */

G.prototype.deleteAll = function(){
	G.each(this.elements, e => G.delete(e));
	this.elements = [];
	return this;
};

G.prototype.prependTo = function(data){//TODO otestovať
	if(this.isEmpty()){
		return this;
	}

	if(G.isElement(data)){
		data.parentElement.insertBefore(this.first(), data.parentElement.firstElementChild);
	}
	else if(G.isG(data) && !data.isEmpty()){
		data.parent().first().insertBefore(this.first(), data.parent().first().firstElementChild);
	}
	else{
		G.error("argument funkcie musí byť element a je: ", data);
	}
	return this;
};

G.prototype.appendTo = function(data){//testovane 28.1.2017
	if(this.isEmpty()){
		return this;
	}

	if(G.isElement(data)){
		data.appendChild(this.first());
	}
	else if(G.isG(data) && !data.isEmpty()){
		data.first().appendChild(this.first());
	}
	else{
		G.error("argument funkcie musí byť element a je: ", data);
	}

	return this;
};

G.prototype.prepend = function(data){//testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}

	if(G.isElement(data)){
		this.first().insertBefore(data, this.first().firstElementChild);
	}
	else if(G.isString(data)){
		this.html(data + this.html());
	}
	else{
		G.error("argument funkcie musí byť element alebo string a teraz je: ", data);
	}
	return this;
};

/**
 * funkcia pridá text, objekt alebo G objekt na začiatok prvého elementu
 *
 * @param data - objekt ktorý sa má pridať
 * @return {*}
 */
G.prototype.append = function(data){//testovane 28.1.2017 //testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}

	if(G.isElement(data)){
		this.first().appendChild(data);
	}
	else if(G.isString(data)){
		G.html(this.first(), data, true);
	}
	else if(G.isG(data) && !data.isEmpty()){
		this.first().appendChild(data.first());
	}
	else{
		G.error("argument funkcie musí byť element alebo string a teraz je: ", data);
	}

	return this;
};

G.prototype.delay = function(func, delay = 0){
	setTimeout(func, delay);
	return this;
};

//TODO after
//TODO before


/**
 * text() - vráti obsah ako text
 * text("juhuuu") - text elementu bude "juchuuu"
 * text("<b>ju</b><p>huuu</p>") - text elementu bude "juhuuu"
 *
 * @param text
 * @param append
 * @returns {*}
 */
G.prototype.text = function(text, append = false){//testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}
	if(G.isUndefined(text)){
		return G.text(this.first());
	}

	if(text[0] === "+"){
		G.text(this.first(), text.substring(1), true);
	}
	else{
		G.text(this.first(), text);
	}
	return this;
};

/**
 * html() - vráti HTML obsah elementu
 * html("<b>bold</b>") - nastavý HTML obsah elementu
 * html("Element") - nastavý ako jedine dieťa nový element
 *
 * @param html
 * @returns {*}
 */
G.prototype.html = function(html){//testovane 26.1.2017 //testovane 29.1.2017
	//ak je G objekt prázdny tak vráti G objekt
	if(this.isEmpty()){
		return this;
	}

	//ak nieje zadaný parameter tak sa vráti HTML prvého elementu 
	if(G.isUndefined(html)){
		return G.html(this.first());
	}
	else if(G.isString(html)){
		if(html[0] === "+"){
			G.html(this.first(), html.substring(1), true);
		}
		else{
			G.html(this.first(), html);
		}
	}
	else if(G.isElement(html)){
		G.html(this.first(), "");
		this.append(html);
	}
	return this;
};

/**
 * Funkcia vymaže prvý element v zozname a vráti G object
 *
 * @returns {G}
 */
G.prototype.delete = function(){//TODO otestovať - pridať možnosť filtrovať vymazane //testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}

	G.delete(this.first());
	this.elements.splice(0, 1);

	return this;
};


/**
 * class("nazov") - vrati true ak ma objekt danú triedu ináč vrát false
 * class("+nazov") - pridá objektu danú triedu
 * class("-nazov") - odstráni objektu danú triedu
 * class("/nazov") - pridá objektu danú triedu ak neexistuje ináč ju odstráni
 *
 * @param name - názov triedy
 * @param force - hodnota pri toggleovaní triedy
 * @returns {*}
 */
G.prototype.class = function(name, force){//testovane 28.1.2017
	if(this.isEmpty()){
		return this;
	}
	var classes = this.first().classList;
	if(G.isArray(name)){
		G.each(name, (e) => this.class(e));
	}
	else if(G.isString(name)){
		switch(name[0]){
			case "+":
				classes.add(name.substring(1));
				break;
			case "-":
				classes.remove(name.substring(1));
				break;
			case "/":
				name = name.substring(1);
				if(G.isBool(force)){
					classes.toggle(name, force);
				}
				else{
					classes.toggle(name);
				}
				break;
			default:
				return classes.contains(name);
		}
	}
	return this;
};


/**
 * css() - vráti všetky nastavené CSS štýly;
 * css("nazov") - vráti hodnotu CSS štýlu;
 * css("-nazov") - vymaža daný CSS štýl;
 * css("nazov", "hodnota") - nastavý danému CSS štýlu hodnotu;
 * css({"nazov1": "hodnota1", "nazov2" : "hodnota2"}) - nastavý všétkým CSS štýlom hodnoty;
 *
 * @param arguments
 * @returns {*}
 */
G.prototype.css = function(){//testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}
	//ak je 0 argumentov vráti objekt z CSS štýlmi
	if(arguments.length === 0){
		var result = {};
		var css = window.getComputedStyle(this.first());
		G.each(css, e => {
			if(css.getPropertyValue(e) !== ""){
				result[e] = css.getPropertyValue(e);
			}
		});
		return result;
	}

	//ak je prvý argument string
	if(G.isString(arguments[0])){
		//a druhý argument je zadaný a dá sa prepísať na string nastav štýl
		if(arguments.length === 2 && G.isString(arguments[1])){
			this.first().style[arguments[0]] = arguments[1];
		}
		//ak prvý argument neobsahuje symbol pre vymazanie tak vráť hodnotu štýlu
		else if(arguments[0][0] !== "-"){
			return this.first().style[arguments[0]];
		}
		//ináč štýl odstráň
		else{
			this.first().style[arguments[0].substring(1)] = "";
		}
	}
	//ak je prvý argument objekt nastav všetky štýli podla objektu
	else if(G.isObject(arguments[0])){
		G.each(arguments[0], (e, i) => {
			if(G.isString(i) && G.isString(e)){
				this.first().style[i] = e;
			}
		});
	}
	return this;
};

/**
 * attr() - vráti všetky atribúty;
 * attr("nazov") - vráti hodnotu atribútu;
 * attr("-nazov") - vymaža daný atribút;
 * attr("nazov", "hodnota") - nastavý danému atribútu hodnotu;
 * attr({"nazov1": "hodnota1", "nazov2" : "hodnota2"}) - nastavý všétkým atribútom hodnoty;
 *
 * @param arguments
 * @returns {*}
 */
G.prototype.attr = function(){//testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}

	//ak je 0 argumentov vráti objekt z atribútmi
	if(arguments.length === 0){
		var result = {};
		G.each(this.first().attributes, e => {
			result[e.nodeName] = e.nodeValue;
		});
		return result;
	}

	//ak je prvý argument string
	if(G.isString(arguments[0])){
		//a druhý argument je zadaný a dá sa prepísať na string nastav štýl
		if(arguments.length === 2 && G.isString(arguments[1])){
			this.first().setAttribute(arguments[0], arguments[1]);
		}
		//ak prvý argument obsahuje symbol pre vymazanie tak vymaž atribút
		else if(arguments[0][0] === "-"){
			this.first().removeAttribute(arguments[0].substring(1));
		}
		//ináč vrá atribút
		else{
			return this.first().getAttribute(arguments[0]);
		}
	}
	//ak je prvý argument objekt nastav všetky štýli podla objektu
	else if(G.isObject(arguments[0])){
		G.each(arguments[0], (e, i) => {
			if(G.isString(i) && G.isString(e)){
				this.first().setAttribute(i, e);
			}
		});
	}
	else{
		G.warn("prvý parameter musí byť String alebo objekt a je: ", arguments[0]);
	}
	return this;
};

/**
 * LISTENERS
 */

G._modifyListener = function(element, listener, func, type){//testovane 29.1.2017
	var allowedListeners = ["click", "blur", "submit", "focus", "scroll", "keydown", "keyup", "dblclick"];
	if(G.isElement(element)){
		if(G.isIn(listener, allowedListeners)){
			if(G.isFunction(func)){
				if(type === "unbind"){
					element.removeEventListener(listener, func);
				}
				else if(type === "bind"){
					element.addEventListener(listener, func);
				}
			}
			else{
				G.warn("tretí parameter musí byť funkcia ale je", G.typeOf(func));
			}
		}
		else{
			G.warn("druhý parameter nieje platný listenre");
		}
	}
	else{
		G.warn("prví parameter musí byť element ale je", G.typeOf(element));
	}
	return element;
};

G.prototype.undelegate = function(listener, func){//TODO otestovať
	this.unbind(listener, func);
};

G.prototype.delegate = function(condition, listener, func){//TODO otestovať
	if(G.isString(condition)){
		this.bind(listener, (e) => {
			if(G.matches(e.target, condition)){
				func(e);
			}
		});
	}
	else{
		G.warn("prví parameter musí byť string a teraz je ", G.typeof(condition));
	}
	return this;
	
};

G.prototype.unbind = function(listener, func){//testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}
	G._modifyListener(this.first(), listener, func, "unbind");
	return this;
};

G.prototype.bind = function(listener, func){//testovane 29.1.2017
	if(this.isEmpty()){
		return this;
	}
	G._modifyListener(this.first(), listener, func, "bind");
	return this;
};

G.prototype.blur = function(func){return this.bind("blur", func);};
G.prototype.keyup = function(func){return this.bind("keyup", func);};
G.prototype.click = function(func){return this.bind("click", func);};
G.prototype.focus = function(func){return this.bind("focus", func);};
G.prototype.submit = function(func){return this.bind("submit", func);};
G.prototype.scroll = function(func){return this.bind("scroll", func);};
G.prototype.keydown = function(func){return this.bind("keydown", func);};
G.prototype.dblclick = function(func){return this.bind("dblclick", func);};

G.position = function(element){//testovane 29.1.2017
	if(!G.isElement(element)){
		G.warn("argument musí byť element");
		return null;
	}
	var top = 0, left = 0;
	do {
		top  += element.offsetTop  || 0;
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);
	return {
		y: top,
		x: left
	};
};

G.left = function(element){//testovane 29.1.2017
	if(!G.isElement(element)){
		G.warn("argument musí byť element");
		return 0;
	}
	var left = 0;
	do {
		left += element.offsetLeft || 0;
		element = element.offsetParent;
	} while(element);
	return left;
};

G.top = function(element){//testovane 29.1.2017
	if(!G.isElement(element)){
		G.warn("argument musí byť element");
		return 0;
	}
	var top = 0;
	do {
		top += element.offsetTop  || 0;
		element = element.offsetParent;
	} while(element);
	return top;
};

G.size = function(element, width = true, height = true){//testovane 29.1.2017
	if(!G.isElement(element)){
		G.warn("argument musí byť element");
		return null;
	}
	return {
		width  : element.offsetWidth,
		height : element.offsetHeight
	};
};

G.width = function(element){//testovane 26.1.2017
	if(!G.isElement(element)){
		G.warn("argument musí byť element");
		return 0;
	}
	return element.offsetWidth;
};

G.height = function(element){//testovane 26.1.2017
	if(!G.isElement(element)){
		G.warn("argument musí byť element");
		return 0;
	}
	return element.offsetHeight;
};


/*
 G.ajax();
 G.error();
 G.createElement();
 G.extend();
 G.each();
 G.find();
 G.parent();
 G.html();
 G.next();
 G.prev();
 G.children();
 G.delete();

 // FUNKCIE NA UPRAVU G ELEMENTU

 G.prototype.add();
 G.prototype.remove();
 G.prototype.clear();
 G.prototype.contains();
 G.prototype.equal();

 // FUNKCIE NA ZJEDNODUSENIE

 G.prototype.show();
 G.prototype.hide();
 G.prototype.toggle();
 G.prototype.emptyAll();
 G.prototype.empty();
 G.prototype.hasClass();
 G.prototype.val();
 G.prototype.addClass();
 G.prototype.removeClass();
 G.prototype.toggleClass();

 // TRAVERSINGOVE FUNKCIE

 G.prototype.parent();
 G.prototype.next();
 G.prototype.prev();
 G.prototype.children();

 // NEZARADENE FUNKCIE

 G.prototype.first();
 G.prototype.length();
 G.prototype.isEmpty();
 G.prototype.each();

 // UTILITOVE FUNKCIE
 G.isFunction();
 G.isDefined();
 G.isString();
 G.isObject();
 G.isNumber();
 G.isNum();
 G.isBool();
 G.isG();
 G.isUndefined();
 G.isArray();
 G.isString();
 G.isGElement();
 G.isElement();

 // HTML/CSS FUNKCIE

 G.prototype.deleteAll();
 G.prototype.prependTo();
 G.prototype.appendTo();
 G.prototype.prepend();
 G.prototype.append();
 G.prototype.text();
 G.prototype.html();
 G.prototype.delete();
 G.prototype.class();
 G.prototype.css();
 G.prototype.attr();
 */

// exports.Tests = tests;
// exports.G = G;