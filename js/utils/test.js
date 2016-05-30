class Test{
	static allTests(){
		var T = new Test();
		//T.testInput();
	}

	testContextMenu(){

	}

	testInput(){
		var input = new InputManager();

		if(input.isButtonDown(0) || input.isButtonDown("gabo") || input.isButtonDown(false) || input.isButtonDown(0))
			Logger.error("button je dole aj ked by tam nemal byť");

		if(input.isKeyDown(0) || input.isKeyDown("gabo") || input.isKeyDown(false) || input.isKeyDown(0))
			Logger.error("key je dole aj ked by tam nemal byť");


		input.keyDown(0);

		if(!input.isKeyDown(0))
			Logger.error("key nieje dole ked by mal byť dole");

		input.keyUp(0);

		if(input.isKeyDown(0))
			Logger.error("key je dole aj ked by tam už nemal byť");

		input.buttonDown({button: 0});

		if(!input.isButtonDown(0))
			Logger.error("button nieje dole ked by mal byť dole");

		input.buttonUp({button: 0});

		if(input.isButtonDown(0))
			Logger.error("button je dole aj ked by tam už nemal byť");
	}

	testTable(){

	}
}