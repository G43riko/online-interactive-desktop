/**
 * Created by gabriel on 29.12.2016.
 */
class Path{
    constructor(){
        this._color = null;
        this._action = null;
        this._size = null;
        this._type = null;
        this._points = [];
        this._min = null;
        this._max = null;
        this._forRemove = false;
    }

    init(color, action, type, size, point){
        this._action = action;
        this._color = color;
        this._type = type;
        this._size = size;
        this._min = point.getClone();
        this._max = point.getClone();
    }

    addPoint(point){
        this._min.x = Math.min(this._min.x, point.x);
        this._min.y = Math.min(this._min.y, point.y);
        this._max.x = Math.max(this._max.x, point.x);
        this._max.y = Math.max(this._max.y, point.y);
        this._points.push(point);
    }

    get empty(){
        return this._points.length === 0;
    }

    get forRemove(){
        return this._forRemove;
    }

    remove(){
        this._forRemove = true;
    }
}