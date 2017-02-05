"use strict"

class TopMenu{
	constructor(data){
		this._menuHolder = new G("#topMenuHolder").html(this.createMainMenu(data["mainMenu"], data));

		document.addEventListener("click", function(e){
			G("#topMenuHolder .selected").each(function(){
				if(e.target !== this.children[0] && this.childElementCount > 1){
					this.classList.remove("selected");
				}
			});
		});
	}

	static clickOnLi(element){
		if(!G.hasClass(G.parent(element), "disabled")){//ak nieje disablovany
			G("#topMenuHolder .selected").each(function(){ //pozrie sa na všetky označené
				if(element !== this.children[0] && this.childElementCount === 1){ //ak to nieje on
					this.classList.remove("selected"); //tak ich odznačí
				}
			});
			G.parent(element).classList.toggle("selected");//prehodí samého seba
		}
	}

	deselectAll(){
		G("#topMenuHolder .selected").each(function(){
			this.classList.remove("selected");
		});
	}

	disabled(value, menu, submenu = null){
		var string = "#topMenuHolder .item_" + menu;
		if(G.isString(submenu)){
			string += " .item_" + submenu
		}

		G(string).class((value ? "+" : "-") + "disabled");
	}

	setVisible(value, menu, submenu = null){
		var string = "#topMenuHolder .item_" + menu;
		if(G.isString(submenu)){
			string += " .item_" + submenu
		}

		G(string).class((value ? "-" : "+") + "hidden");
	}

	createMainMenu(menuData, allData = null){
		var ul = G("ul", {attr: {class: "menu"}})
		G.each(menuData, function(e, i, array){
			var classes = "menuItem item_" + i;
			if(e.disabled === true){
				classes += " disabled";
			}
			if(e.visible === false){
				classes += " hidden";
			}
			var li = G("li", {
				attr: {class: classes}, 
				cont: G.createElement("a", {
					href: "javascript: void(0)",
					class: "itemLink",
					onclick: allData !== null ? "TopMenu.clickOnLi(this);" : ""
				}, e.label || i)
			});
			if(allData && allData.hasOwnProperty(i)){
				li.append(this.createMainMenu(allData[i]));
			}

			ul.append(li);
		}, this);
		return ul.first();
	}

	set visible(val){
		this._menuHolder.class("/hidden", !val);
	}

	get width(){
		return this._menuHolder.width();
	}
	get height(){
		return this._menuHolder.height();
	}
}

var dataNew = {
	"items" : [
		{
			"key" : "tools",
			"label" : "Nástroje",
			"visible" : true,
			"disable" : false,
			"items" : [
				{
					"key" : "draw",
					"visible" : true,
					"disabled" : false,
					"bgOffset" : 0
				},
				{
					"key" : "rect",
					"visible" : true,
					"disabled" : false,
					"bgOffset" : 1
				},
				{
					"key:" : "line",
					"visible" : true,
					"disabled" : false,
					"bgOffset" : 2
				},
				{
					"key:" : "arc",
					"visible" : true,
					"disabled" : false,
					"bgOffset" : 3
				},
				{
					"key:" : "text",
					"visible" : true,
					"disabled" : true,
					"bgOffset" : 4
				},
				{
					"key:" : "join",
					"visible" : true,
					"disabled" : false,
					"bgOffset" : 5
				},
				{
					"key:" : "table",
					"visible" : true,
					"disabled" : true,
					"bgOffset" : 6
				},
				{
					"key:" : "class",
					"visible" : true,
					"disabled" : true,
					"bgOffset" : 7
				},
				{
					"key:" : "image",
					"visible" : true,
					"disabled" : false,
					"bgOffset" : 8
				},
				{
					"key:" : "polygon",
					"visible" : true,
					"disabled" : true,
					"bgOffset" : 9
				}
			]
		},
		{
			"key" : "file",
			"label" : "Súbory",
			"visible" : true,
			"disable" : false,
			"items" : [
				{
					"key" : "saveImg",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "saveXML",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "saveTask",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "loadXML",
					"visible" : true,
					"disabled" : false
				}
			]
		},
		{
			"key" : "content",
			"label" : "Obsah",
			"visible" : true,
			"disable" : false,
			"items" : [
				{
					"key" : "loadLocalImage",
					"label" : "locImg",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "loadLocalHTML",
					"label" : "locHtml",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "loadExternalImage",
					"label" : "extImg",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "loadExternalHTML",
					"label" : "extHtml",
					"visible" : true,
					"disabled" : false
				}
			]
		},
		{
			"key" : "sharing",
			"label" : "Pripojenie",
			"visible" : true,
			"disable" : false,
			"items" : [
				{
					"key" : "startShare",
					"visible" : true,
					"disabled" : false
				},
				{
					"key" : "stopShare",
					"visible" : true,
					"disabled" : true
				},
				{
					"key" : "shareOptions",
					"visible" : true,
					"disabled" : true
				},
				{
					"key" : "copyUrl",
					"visible" : true,
					"disabled" : true
				},
				{
					"key" : "watch",
					"visible" : true,
					"disabled" : false
				}
			]
		},
		{
			"key" : "options",
			"label" : "Možnsoti",
			"visible" : true,
			"disable" : false
		},
		{
			"key" : "help",
			"label" : "Pomoc",
			"visible" : true,
			"disable" : true,
			"items" : [
			]
		},
		{
			"key" : "undo",
			"label" : "Späť",
			"visible" : false,
			"disable" : false
		},
		{
			"key" : "redo",
			"label" : "Vpred",
			"visible" : false,
			"disable" : false
		}
	]
};
var data = {
	"mainMenu" : {
		"tools" : {
			"visible" : true,
			"disabled" : false
		},
		"file": {
			"visible" : true,
			"disabled" : false
		},
		"content" : {
			"visible" : true,
			"disabled" : false
		},
		"sharing": {
			"visible" : true,
			"disabled" : false
		},
		"options" : {
			"visible" : true,
			"disabled" : false
		},
		"help" : {
			"visible" : true,
			"disabled" : true
		},
		"undo": {
			"visible" : false,
			"disabled" : true
		},
		"redo" : {
			"visible" : false,
			"disabled" : true
		},
		"rubber" : {
			"visible" : true,
			"disabled" : false
		},
		"area" : {
			"visible" : true,
			"disabled" : false
		},
		"ctrl": {
			"visible" : false,
			"disabled" : true
		},
		"lineWidth" : {
			"visible" : false,
			"disabled" : true
		},
		"brushes" : {
			"visible" : false,
			"disabled" : true
		}
	},
	"tools": {
		"draw": {
			"visible" : true,
			"disabled" : false
		},
		"rect": {
			"visible" : true,
			"disabled" : false
		},
		"line": {
			"visible" : true,
			"disabled" : false
		},
		"arc": {
			"visible" : true,
			"disabled" : false
		},
		"text": {
			"visible" : true,
			"disabled" : true
		},
		"join": {
			"visible" : true,
			"disabled" : false
		},
		"table": {
			"visible" : true,
			"disabled" : true
		},
		"class": {
			"visible" : true,
			"disabled" : true
		},
		"image": {
			"visible" : true,
			"disabled" : false
		},
		"polygon": {
			"visible" : true,
			"disabled" : true
		}
	},
	"file": {
		"saveImg" : {
			"visible" : true,
			"disabled" : false
		},
		"saveXML" : {
			"visible" : true,
			"disabled" : false
		},
		"saveTask" : {
			"visible" : true,
			"disabled" : false
		},
		"loadXML" : {
			"visible" : true,
			"disabled" : false
		}
	},
	"content": {
		"loadLocalImage" : {
			"visible" : true,
			"disabled" : false
		},
		"loadLocalHTML" : {
			"visible" : true,
			"disabled" : false
		},
		"loadExternalImage" : {
			"visible" : true,
			"disabled" : false
		},
		"loadExternalHTML" : {
			"visible" : true,
			"disabled" : false
		}
	},
	"sharing": {
		"startShare" : {
			"visible" : true,
			"disabled" : false
		},
		"stopShare" : {
			"visible" : true,
			"disabled" : true
		},
		"shareOptions" : {
			"visible" : true,
			"disabled" : true
		},
		"copyUrl": {
			"visible" : true,
			"disabled" : true
		},
		"watch" : {
			"visible" : true,
			"disabled" : false
		}
	},
	"lineWidth" : {
		"defaultWidth" : {
			"visible" : true,
			"values" : [1, 2, 5, 10, 20]
		}
	},
	"brushes" : {
		"defaultBrushes" : {
			"visible" : true,
			"values" : ["brush1.png", "brush2.png", "brush3.png"]
		}
	}
}