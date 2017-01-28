"use strict"

function initContextMenu(query){
	var taskItemClassName = 'task';
	var items = document.querySelectorAll(query);
	var menuState = 0;
	var menu = document.querySelector("#context-menu");
	document.addEventListener("click", function(e){
		var target = e.target;
		
		do{
			if(target.getAttribute("id") === "context-menu"){
				return;
			}
		}while(target = target.parentElement);
		menu.classList.remove("active");
		menu.classList.remove("left");
	});
	var contextMenuListener = function(el){
		el.addEventListener("contextmenu", function(e) {
			e.preventDefault();
			showMenu(e);
			return false;
		});
	};

	var showMenu = function(e){
		//var contexMenuWidth = 240;
		menu.classList.add("active");
		var contexMenuWidth = menu.querySelector("ul").offsetWidth;
		var contexMenuHeight = menu.querySelector("ul").offsetHeight;

		menu.style.top = Math.min(e.clientY, (window.innerHeight - contexMenuHeight)) + "px";
		menu.style.left = Math.min(e.clientX, (window.innerWidth - contexMenuWidth)) + "px";
		console.log(menu.style.left, window.innerWidth - (contexMenuWidth << 1));
		menu.classList.toggle("left", parseInt(menu.style.left.replace("px", "")) > window.innerWidth - (contexMenuWidth << 1));

	};
	for(var i=0 ; i<items.length; i++){
		contextMenuListener(items[i]);
	}
};


