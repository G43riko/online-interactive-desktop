/*
	compatible:	forEach, getComputedStyle, JSON parsing 14.9.2016
*/
class ListenersManager{
	constructor(){
		this._movedObject = null;
	}
	mouseDown(position, button){
		if(isDefined(timeLine) && timeLine.clickIn(position.x, position.y)){
			this._movedObject = timeLine;
			return;
		}

		if(!actContextMenu && Creator.operation == OPERATION_AREA && area)
			area.startCreate(position);

		if(SelectedText){
			var textArea = document.getElementById("selectedEditor");
			if(textArea){
				console.log("res: " + parseInt(window.getComputedStyle(textArea).fontSize, 10));
				SelectedText.text = textArea.innerText;
				document.body.removeChild(textArea);
			}
		}

		if($(canvas).hasClass("blur"))
			return false;

		/*
		if(actContextMenu && actContextMenu.clickIn(position.x, position.y))
			return;
		*/


		if(button == LEFT_BUTTON && !actContextMenu)
			Scene.forEach((o) => {
				if(o.visible && o.clickIn(position.x, position.y, button)){
					o.moving = true;
					selectedObjects.movedObject = o;
					this._movedObject = selectedObjects;
					return true;
				}
			});


		if(Menu.isToolActive() && !Creator.object){
			Creator.createObject(position);
			this._movedObject = Creator;
		}

		draw();
	}

	hashChange(){
		setUpComponents();

		if(MenuManager.dataBackup)
			Menu.init(JSON.parse(MenuManager.dataBackup));

		if(Layers)
			Entity.setAttr(Layers, "visible", Components.layers());

		Gui.showOptionsByComponents();
		draw();
	}

	keyUp(key, isCtrlDown){
		if(isCtrlDown){
			switch(key){
				case Z_KEY:
					Paints.undo();
					break;
				case Y_KEY:
					Paints.redo();
					break;
				case A_KEY:
					selectedObjects.selectAll();
					draw();
					break;
			}
		}
		else if(ESCAPE_KEY === key)
			closeDialog();
		else if(DELETE_KEY === key){
			selectedObjects.deleteAll();
			draw();
		}
	}

	mousePress(position){
		if(Menu.pressIn(position.x, position.y)){
			draw();
			return true;
		}

		actContextMenu = new ContextMenuManager(position);


		if(selectedObjects.movedObject){
			selectedObjects.movedObject.moving = false;
			selectedObjects.movedObject = false;
			this._movedObject = null;
		}

		draw();
		return false;
	}

	mouseDoubleClick(position){
		var result	= false,
			vec 	= new GVector2f(100, 40);

		Scene.forEach(e => {
			if(!result && isDefined(e.doubleClickIn) && e.doubleClickIn(position.x, position.y))
				result = e;
		});

		if(!result)
			getText("", position, vec, val => val.length && Scene.addToScene(new TextField(val, position, vec)));

		draw();
		return true;
	}

	mouseUp(position){
		var possibleChild = null;
		if(selectedObjects.size() === 1)
			possibleChild = selectedObjects.firstObject;

		this._movedObject = null;

		var result = false;

		if(Creator.operation === OPERATION_RUBBER)
			Paints.removeSelectedPaths();

		if(Creator.operation == OPERATION_AREA && area && area.isCreating){
			area.endCreate(position);
		}

		/*
		 * SKONTROLUJE KONTEXTOVE MENU A AK SA KLILKLO NA NEHO TAK HO VYPNE A SKONCI
		 */
		if(actContextMenu){
			if(!actContextMenu.clickIn(position.x, position.y))
				actContextMenu = false;
			else
				return
		}

		if(Creator.object && Creator.object.name != OBJECT_JOIN){
			Creator.finishCreating(position);
			return;
		}

		/*
		 * AK JE VYBRATY NASTROJ KRESBA TAK SA PRERUSI CIARA
		 */
		if(Creator.operation == OPERATION_DRAW_PATH && Components.draw()){
			Paints.addPoint(position);
			Paints.breakLine();
		}

		/*
		 * SKONTROLUJE SA MENU A CREATOR
		 */
		if(Menu.clickIn(position.x, position.y))
			return;

		if(Creator.clickIn(position.x, position.y))
			return;

		closeDialog();

		/*
		 * AK SA HYBALO S NEJAKYM OBJEKTOM TAK SA DOKONCI POHYB
		 */
		if(selectedObjects.movedObject){
			selectedObjects.movedObject.moving = false;
			selectedObjects.movedObject = false;
			this._movedObject = null;
		}

		var clickOnParent = false;
		Scene.forEach(o => {
			if(result)
				return;
			if(o.clickIn(position.x, position.y)) {
				if(possibleChild){
					if(possibleChild.parent === o) //ak klikol na svojho rodiča tak sa nekontroluje priradenie dietata
						clickOnParent = true;
					else if(possibleChild !== o){//TODO treba asi prerobiť na jedno dieťa;
						o.addChildren(possibleChild);
						clickOnParent = true;
					}
				}
				if(Creator.object){//toto sa stará o konektory
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

		if(possibleChild && !clickOnParent)
			possibleChild.removeParent();

		Creator.object = false;
		result || selectedObjects.clear();
	}

	mouseMove(position, movX, movY){
		if(Options.changeCursor){//TODO timeline, layersViewer, creator, Line & polygon, selectors, connectors
			var isHoverTrue = Menu.hover(position.x, position.y);

			/*
			if(actContextMenu)
				actContextMenu.hover(position.x, position.y);
			*/
			if(!isHoverTrue && Creator.operation === OPERATION_AREA)
				isHoverTrue = area.hover(position.x, position.y);

			if(!isHoverTrue){
				Scene.forEach(e => {
					if(isHoverTrue)
						return;
					isHoverTrue = e.hover(position.x, position.y);
				})
			}
		}

		if(Creator.operation == OPERATION_AREA && area && area.isCreating){
			area.addPoint(position);
		}


		Creator.drawRubber(position, {x: position.x - movX, y: position.y - movY});

		if(this._movedObject && isFunction(this._movedObject.onMouseMove)){
			this._movedObject.onMouseMove(position, movX, movY);
			draw();
		}
		else if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH && Components.draw()){
			var radius = 1;
			Paints.addPoint(radius === 1 ? position : position.div(radius).round().mul(radius));
			draw();
		}

		return false;
		/*
		/////OBJEKTY PRI POHYBE

		//ak sa hýbe nejakým objektom
		if(selectedObjects.movedObject && Creator.operation != OPERATION_DRAW_PATH){
			//prejdu sa všetky označené objekty a pohne sa nimi
			selectedObjects.forEach(e => Movement.move(e, movX, movY));

			//ak objekt s ktorým sa hýbe nieje označený(už sa sním pohlo) tak sa sním tiež pohne
			if(!selectedObjects.movedObject.selected)
				Movement.move(selectedObjects.movedObject, movX, movY);

			//ak sú nejaké objekty označené tak sa aktualizuje prehlad posledného označeného ináč iba hýbaného
			if(selectedObjects.size())
				updateSelectedObjectView(selectedObjects.getLast());
			else if(selectedObjects.movedObject)
				updateSelectedObjectView(selectedObjects.movedObject);
		}


		/////ČIARA

		//ak sa kreslí čiara tak sa nakreslí nové posunutie
		if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation == OPERATION_DRAW_PATH && Components.draw()){
			Paints.addPoint(position);
			draw();
		}

		/////CREATOR

		//ak sa vytvára objekt tak sa nakreslí nové posunutie
		if(Creator.object){
			updateSelectedObjectView(Creator.object);
			Creator.object.updateCreatingPosition(position);
		}

		if(selectedObjects.movedObject || Input.isKeyDown(SHIFT_KEY) || Creator.object)
			draw();
		*/
	}
}