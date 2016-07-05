class ListenersManager{
	mouseDown(position, button){
		if($(canvas).hasClass("blur"))
			return false;

		if(actContextMenu && actContextMenu.clickIn(position.x, position.y))
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

		actContextMenu = new ContextMenuManager(position);


		if(movedObject){
			movedObject.moving = false;
			movedObject = false;
		}

		draw();
		return false;
	}

	mouseDoubleClick(position){
		var result	= false,
			vec 	= new GVector2f(100, 40);

		Scene.forEach(function(e){
			if(!result && isDefined(e.doubleClickIn) && e.doubleClickIn(position.x, position.y))
				result = e;
		});

		if(!result)
			getText("", position, vec, val => val.length && Scene.addToScene(new Text(val, position, vec)));

		draw();
		return true;
	}

	mouseUp(position){
		var result = false;

		/*
		 * SKONTROLUJE KONTEXTOVE MENU A AK SA KLILKLO NA NEHO TAK HO VYPNE A SKONCI
		 */
		if(actContextMenu){
			if(!actContextMenu.clickIn(position.x, position.y))
				actContextMenu = false;
			else
				return
		}

		if(Creator.object && Creator.object.name != "Join"){
			Creator.finishCreating(position);
			return;
		}

		if(Menu.clickIn(position.x, position.y))
			return;

		if(Creator.clickIn(position.x, position.y))
			return;

		closeDialog();

		/*
		 * AK SA HYBALO S NEJAKYM OBJEKTOM TAK SA DOKONCI POHYB
		 */
		if(movedObject){
			movedObject.moving = false;
			movedObject = false;
		}

		/*
		 * AK JE VYBRATY NASTROJ KRESBA TAK SA PRERUSI CIARA
		 */
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
		result || selectedObjects.clear();
	}

	mouseMove(position, movX, movY){
		//ak sa hýbe nejakým objektom
		if(movedObject && Creator.operation != OPERATION_DRAW_PATH){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(e => Movement.move(e, movX, movY));

			//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
			if(!movedObject.selected)
				Movement.move(movedObject, movX, movY);

			//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného
			if(selectedObjects.size())
				updateSelectedObjectView(selectedObjects.getLast());
			else if(movedObject)
				updateSelectedObjectView(movedObject);
		}

		//ak sa kreslí čiara tak sa nakreslí nové posunutie
		if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH){
			Scene.paint.addPoint(position, Creator.color);
			draw();
		}

		//ak sa vytvára objekt tak sa nakreslí nové posunutie
		if(Creator.object){
			updateSelectedObjectView(Creator.object);
			Creator.object.updateCreatingPosition(position);
		}

		if(movedObject || Input.isKeyDown(SHIFT_KEY) || Creator.object)
			draw();
	}
}