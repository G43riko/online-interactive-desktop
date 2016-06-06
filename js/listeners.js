class ListenersManager{
	mouseDown(position, button){
		if($(canvas).hasClass("blur"))
			return false;

		if(actContextMenu)
			if(actContextMenu.clickIn(position.x, position.y))
				return;
		if(button == LEFT_BUTTON)
			Scene.forEach(function(o){
				if(o.clickIn(position.x, position.y, button)){
					o.moving = true;
					movedObject = o;
					return true;
				}
			});


		if(Menu.isToolActive() && !Creator.object)
			Creator.createObject(position);


		draw();
	}

	mousePress(position){
		if(Menu.pressIn(position.x, position.y)){
			draw();
			return true;
		}

		actContextMenu = new ContexMenuManager(position);


		if(movedObject){
			movedObject.moving = false;
			movedObject = false;
		}

		draw();
		return false;
	}

	mouseDoubleClick(position, button){
		var result = false,
			vec = new GVector2f(100, 40);

		Scene.forEach(function(e){
			if(result)
				return;
			if(typeof e.doubleClickIn !== "undefined" && e.doubleClickIn(position.x, position.y))
				result = e;

		});

		if(result === false)
			getText("", position, vec, function(val){
				if(val.length > 0)
					Scene.addToScene(new Text(val, position, vec));
			});
		draw();
		return true;
	}

	mouseUp(position){
		var result = false;

		if(actContextMenu){
			if(!actContextMenu.clickIn(position.x, position.y))
				actContextMenu = false;
			else
				return
		}

		if(Creator.object && Creator.object.name != "Join"){
			Scene.addToScene(Creator.object);
			Creator.object = false;
			return;
		}

		if(Menu.clickIn(position.x, position.y))
			return;

		closeDialog();
		if(movedObject)
			movedObject.moving = false;
		movedObject = false;

		if(Creator.operation == OPERATION_DRAW_PATH){
			Scene.paint.addPoint(position, Creator.color);
			Scene.paint.breakLine();
		}
		Scene.forEach(function(o){
			if(result)
				return;
			if(o.clickIn(position.x, position.y)) {
				if(Creator.object){
					if(o.selectedConnector){
						Creator.object.obj2 = o;
						Scene.addToScene(Creator.object);
					}
				}
				else
					Input.isKeyDown(L_CTRL_KEY) ? selectedObjects.add(o) : selectedObjects.clearAndAdd(o);
				result = true;

			}
		});

		Creator.object = false;
		if(!result)
			selectedObjects.clear();
			//deselectAll();
	}

	mouseMove(position, movX, movY){
		//ak sa hýbe nejakým objektom
		if(movedObject && Creator.operation != OPERATION_DRAW_PATH){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(function(e){
				Movement.move(e, movX, movY);
			});
			//for(var i in selectedObjects)
			//	Movement.move(selectedObjects[i], movement.x, movement.y)

			//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
			if(!movedObject.selected)
				Movement.move(movedObject, movX, movY);

			//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného
			if(selectedObjects.size() > 0)
				updateSelectedObjectView(selectedObjects.get(selectedObjects.size() - 1));
			else if(movedObject)
				updateSelectedObjectView(movedObject);
		}

		//ak sa kreslí čiara tak sa nakreslí nové posunutie
		if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH){
			Scene.paint.addPoint(position, Creator.color);
			draw();
		}

		//ak sa vytvára objekt tak sa nakreslí nový posunutie
		if(Creator.object){
			updateSelectedObjectView(Creator.object);
			Creator.object.updateCreatingPosition(position);
		}

		if(movedObject || Input.isKeyDown(SHIFT_KEY) || Creator.object)
			draw();
	}
}