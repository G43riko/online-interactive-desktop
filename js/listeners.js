/*
	compatible:	forEach, getComputedStyle, JSON parsing 14.9.2016
*/


class ListenersManager{
	constructor(){
		//console.log("strict: " + (function() { return !this; })());
		this._movedObject = null;
		this._clickedOnObject = false;
	}
	mouseDown(position, button){
		try{
			if(Project.options.showClicks){
				Project.scene.mouseDown(position.x, position.y);
			}
			this._clickedOnObject = false;

			if($(canvas).hasClass("blur")){
				closeDialog();
				this._clickedOnObject = true;
				return false;
			}
			/*
			 * SKONTROLUJE SA KLIKNUTIE NA ČASOVÚ OS
			 */
			if(isDefined(timeLine) && timeLine.clickIn(position.x, position.y)){
				this._movedObject = timeLine;
				this._clickedOnObject = true;
				return false;
			}

			/*
			 * SKONTROLUJE SA KLIKNUTIE NA AREU, BUĎ SA ZAČNE PRESÚVAŤ ALEBO VYTVÁRAŤ
			 */
			if(!this._clickedOnObject && !actContextMenu && Creator.operation === OPERATION_AREA && area){
				if(area.isReady && area.clickIn(position.x, position.y)){ //ak sa kliklo na už vytvorene tak sa bude posuvať
					selectedObjects.movedObject = area;
					area.moving = true;
					this._movedObject = selectedObjects;
				}
				else {//ináč sa začne vytvárať nová
					area.startCreate(position);
				}
				this._clickedOnObject = true;
			}

			/*
			 * AK JE OZNAČENÝ TEXT TAK SA ULOŽÍ DO NEHO AKTUÁLNA HODNOTA INPUT A TEN SA SCHOVÁ
			 */
			if(SelectedText){
                let textArea = new G("#selectedEditor");
				if(!textArea.isEmpty()){
					console.log("res: " + parseInt(window.getComputedStyle(textArea).fontSize, 10));
					SelectedText.text = textArea.text();
					textArea.delete();
				}
			}


			/*
			if(actContextMenu && actContextMenu.clickIn(position.x, position.y))
				return;
			*/


			/*
			 * SKONTROLUE SA ČI SA MÁ VYTVÁRAŤ NOVÝ OBJEKT 
			 */
			if(!Creator.clickIn(position.x, position.y, false) && (Menu.isToolActive() || Creator.controllPress) && !Creator.object){
				Creator.createObject(position);
				this._movedObject = Creator;
				this._clickedOnObject = true;
				return false;
			}

			/*
			 * SKONTROLUJÚ SA NA KLIKNUTIE VŠETKY OBJEKTY V SCÉNE 
			 */
			if(!this._clickedOnObject && button === LEFT_BUTTON && !actContextMenu){
				Scene.forEach((o) => {
					if(o.visible && !o.layer.userLayer && o.clickIn(position.x, position.y, button)){
						if(Creator.operation === OPERATION_DRAW_LINE && Input.isKeyDown(KEY_L_CTRL) && o.selectedConnector){
							Creator.createObject(position, o);
							this._movedObject = Creator;
						}
						else{
							o.moving = true;
							selectedObjects.movedObject = o;
							this._movedObject = selectedObjects;
						}
						this._clickedOnObject = true;
						return true;
					}
				});
			}
			draw();
		}
		catch(e){
			Logger.exception(getMessage(MSG_ERROR_MOUSE_DOWN), e);
		}
	}

	mouseLeave(position){
		this.mouseUp(position, false);
		draw();
	}

	hashChange(){
		glob.setUpComponents();

		if(MenuManager.dataBackup){
			Menu.init(JSON.parse(MenuManager.dataBackup));
		}

		if(Layers){
			//Entity.setAttr(Layers, "visible", Components.layers());
			Layers.visible = Components.layers();
		}

		Project.gui.showOptionsByComponents();
		draw();
	}

	keyDown(key, isCtrlDown){
		if(KEY_DELETE === key){
			if(area.isReady){
				area.removeSelected(isCtrlDown);//ak je aj ALT dole tak revertne mazanie
			}
		}
		glob.showKey(key);
		draw();
	}

	keyUp(key, isCtrlDown){
		if(isCtrlDown){
			switch(key){
				case KEY_Z:
					Paints.undo();
					break;
				case KEY_Y:
					Paints.redo();
					break;
				case KEY_A:
					//selectedObjects.selectAll();
					//draw();
					break;
			}
		}
		else{
			switch(key){
				case KEY_DELETE:
					selectedObjects.deleteAll();
					draw();
					break;
				case KEY_ESCAPE:
					closeDialog();
					break;
				case KEY_NUM_1:
					Creator.operation = OPERATION_DRAW_PATH;
					draw();
					break;
				case KEY_NUM_2:
					Creator.operation = OPERATION_DRAW_RECT;
					draw();
					break;
				case KEY_NUM_3:
					Creator.operation = OPERATION_DRAW_LINE;
					draw();
					break;
				case KEY_NUM_4:
					Creator.operation = OPERATION_DRAW_ARC;
					draw();
					break;
				case KEY_NUM_5:
					Creator.operation = OPERATION_DRAW_IMAGE;
					draw();
					break;
			}
		}
	}

	mousePress(position){
		/*
		 * SKONTROLUJE SA HORNE MENU
		 */
		if(Menu.pressIn(position.x, position.y)){
			draw();
			return true;
		}

		Paints.breakLine();

		/*
		 * VYTVORI SA KONTEXTOVÉ MENU
		 */
		actContextMenu = new ContextMenuManager(position);

		/*
		 * AK SA PRESUVAL NEJAKÝ OBJEKT TAK SA ZRUŠÍ PRESÚVANIE
		 */
		if(selectedObjects.movedObject){
			selectedObjects.movedObject.moving = false;
			selectedObjects.movedObject = false;
			this._movedObject = null;
		}

		draw();
		return false;
	}

	mouseDoubleClick(position){
        let result	= false,
			vec 	= new GVector2f(100, 40);

		Scene.forEach(e => {
			if(!result && isDefined(e.doubleClickIn) && e.doubleClickIn(position.x, position.y)){
				result = e;
			}
		});

		if(!result){
			getText("", position, vec, val => val.length && Scene.addToScene(new TextField(val, position, vec)));
		}

		draw();
		return true;
	}

	mouseUp(position, shoutCloseDialog = true){
		try{
            let result 					= false;
            let possibleChild 			= null;
            let clickOnParent 			= false;
            let clickOnConnectorObject 	= null;
			
			if(selectedObjects.size() === 1){
				possibleChild = selectedObjects.firstObject;
			}
			if(Project.options.showClicks){
				Project.scene.mouseUp(position.x, position.y);
			}

			this._movedObject = null;


			/*
			 * AK JE VYBRANY NASTROJ RUBBER TAK SA VYMAŽÚ OBJEKTY KTORÉ BOLY VYGUMOVANÉ
			 */
			if(Creator.operation === OPERATION_RUBBER){
				Paints.removeSelectedPaths();
				//return false;
			}

			/*
			 * AK JE VYBRANY NASTROJ AREA TAK SA BUĎ DOKONČÍ VYTVARANIE ALEBO PRESUN
			 */
			if(Creator.operation === OPERATION_AREA && area){
				if(area.isCreating){
					area.endCreate(position);
				}
				else if(area.moving){
					area.moving = false;
				}
				//return false;
			}

			/*
			 * SKONTROLUJE KONTEXTOVE MENU A AK SA KLILKLO NA NEHO TAK HO VYPNE A SKONCI
			 */
			if(actContextMenu){
				if(!actContextMenu.clickIn(position.x, position.y)){
					actContextMenu = false;
				}
				else{
					return false;
				}
			}
			
			/*
			 * AK SA VYTVARAL OBJEKT TAK SA JEHO VYTVARANIE DOKONČÍ
			 */
			 
			if(Creator.object && Creator.object.name !== OBJECT_LINE){
				Creator.finishCreating(position);
				return false;
			}
			

			/*
			 * AK JE VYBRANY NASTROJ KRESBA TAK SA PRERUSI CIARA
			 */
			if(Creator.operation === OPERATION_DRAW_PATH && Components.draw()){
				Paints.addPoint(position);
				Paints.breakLine();
				//return false;
			}

			/*
			 * SKONTROLUJE SA MENU A CREATOR
			 */
			if(Menu.clickIn(position.x, position.y)){
				return;
			}

			if(Creator.clickIn(position.x, position.y)){
				return;
			}

			if(shoutCloseDialog){
				closeDialog();
			}

			Scene.forEach(o => {
				if(!result && o.clickIn(position.x, position.y)) {
					o.click(position.x, position.y);
					if(possibleChild){
						if(possibleChild.parent === o){ //ak klikol na svojho rodiča tak sa nekontroluje priradenie dietata
							clickOnParent = true;
						}
						/*
						else if(possibleChild !== o){//TODO treba asi prerobiť na jedno dieťa;
							//o.addChildren(possibleChild);
							//clickOnParent = true;
						}
						*/
					}
					if(o.selectedConnector){
						clickOnConnectorObject = o;
					}
					if(Creator.object){//toto sa stará o konektory
						if(o.selectedConnector){
							console.log("teraz");
							Creator.object.targetB = o;
						}
						//Scene.addToScene(Creator.object);
						//result = true;
						return;
					}
					else{
						if(Input.isKeyDown(KEY_L_CTRL)){
							selectedObjects.add(o);
                        }
                        else{
							selectedObjects.clearAndAdd(o);
                        }
					}
					result = true;
				}
			});

			/*
			 * AK SA HYBALO S NEJAKYM OBJEKTOM TAK SA DOKONCI POHYB
			 */
			if(selectedObjects.movedObject){
				if(clickOnConnectorObject && selectedObjects.movedObject.name === OBJECT_LINE){
					selectedObjects.movedObject.setTarget(clickOnConnectorObject);
					console.log("teraz");
				}
				selectedObjects.movedObject.moving = false;
				selectedObjects.movedObject = false;
				this._movedObject = null;
				//return false;
			}

			if(possibleChild && !clickOnParent){
				possibleChild.removeParent();
			}
			if(Creator.object){//tu može byť iba line ktorá nebola pripojená na konektor
				Creator.finishCreating();
			}
			//Creator.object = false;
			if(!result){
				selectedObjects.clear();
			}
		}
		catch(e){
			Logger.exception(getMessage(MSG_ERROR_MOUSE_UP), e);
		}
	}

	mouseMove(position, movX, movY){
		try{
			/*
			 * KONTROLA HOVER LISTENEROV
			 */
			if(Project.options.changeCursor && !Project.isMobile){//TODO overiť či naozaj na mobiloch nefunguje
				//TODO timeline, layersViewer, creator, Line & polygon, selectors, connectors
                let isHoverTrue = Menu.hover(position.x, position.y);

				/*
				if(actContextMenu)
					actContextMenu.hover(position.x, position.y);
				*/
				if(!isHoverTrue && Creator.operation === OPERATION_AREA){
					isHoverTrue = area.hover(position.x, position.y);
				}

				if(!isHoverTrue){
					Scene.forEach(e => {
						if(isHoverTrue){
							return;
						}
						isHoverTrue = e.hover(position.x, position.y);
					});
				}
			}

			/*
			 * AK JE VYBRANY NASTROJ AREA A AREA JE VYTVARANA TAK SA PRIDA BOD
			 */
			if(Creator.operation === OPERATION_AREA && area && area.isCreating){
				area.addPoint(position);
				this._clickedOnObject = true;//TODO overiť
				return false;
			}

			/*
			 * AK JE VYBRANY NASTROJ RUBBER A JE STLAČENE TLAČITKO MYŠI TAK SA PRIDA NOVY BOD
			 */
			if(Creator.operation === OPERATION_RUBBER && Input.isButtonDown(LEFT_BUTTON)) {
				//Paints.drawLine(context, position, {x: position.x - movX, y: position.y - movY}, Creator.brushSize, "grey", PAINT_ACTION_LINE);
				Paints.drawLine({
					pointA: position,
					pointB: {x: position.x - movX, y: position.y - movY}, 
					action: PAINT_ACTION_LINE, 
					brushColor: RUBBER_COLOR
				});			
				Paints.findPathsForRemove(position, 1);
				Project.scene.findObjectsForRemove(position.x, position.y, 1);
				this._clickedOnObject = true;//TODO overiť
				return false;
			}

			/*
			 * AK JE OZNACENNY OBJEKT S KTORYM SA HYBE TAK SA POHNE
			 */
			if(this._movedObject && isFunction(this._movedObject.onMouseMove)){
				this._movedObject.onMouseMove(position, movX, movY);
				draw();
				this._clickedOnObject = true;
				return false;
			}

			/*
			 * AK JE VYBRANY NASTROJ DRAW A TLACITKO MYŠI JE STLAČENE TAK SA PRIDA NOVÝ BOD
			 */
			if(Input.isButtonDown(LEFT_BUTTON) && Creator.operation === OPERATION_DRAW_PATH && Components.draw()){
                let radius = 1;
				Paints.addPoint(radius === 1 ? position : position.div(radius).round().mul(radius));
				draw();
				this._clickedOnObject = true;
				return false;
			}
		}
		catch(e){
			Logger.exception(getMessage(MSG_ERROR_MOUSE_MOVE), e);
		}
	}
}