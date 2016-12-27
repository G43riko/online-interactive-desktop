/**
 * Created by gabriel on 27.12.2016.
 */

const MAIN_CANVAS = "mainCanvas";
const POINTER_CANVAS = "pointerCanvas";
const CANVAS_PREFIX = "canvas";

class CanvasManager{
    constructor(sizeX, sizeY){
        this._sizeX = sizeX;
        this._sizeY = sizeY;
        this._canvases = {};
        this._canvases[MAIN_CANVAS] = new CanvasHandler("myCanvas", sizeX, sizeY);
        this._canvasCounter = 1;
    }

    initPointerCanvas(){
        this._pointerCanvas = new CanvasHandler(this._sizeX, this._sizeY);
        this._canvasCounter++;
    }

    get canvas(){
        return this._canvases[MAIN_CANVAS];
    }

    get pCanvas(){
        return this._canvases[POINTER_CANVAS];
    }

    createCanvas(sizeX, sizeY, title){
        title = title || CANVAS_PREFIX + this._canvasCounter;
        this._canvases[title] = new CanvasHandler(sizeX, sizeY);
        this._canvasCounter++;
        return this._canvases[title];
    }

    getCanvas(title){
       return this._canvases[title];
    }

    removeCanvas(title){
        if(this._canvases[title])
            delete this._canvases[title];
    }
}