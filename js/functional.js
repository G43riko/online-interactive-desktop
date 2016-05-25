function negate(func) {
	return function(x) {
		return !func(x);
	};
}

function equal(el1, el2){
	return el1 == el2;
}

function greaterThen(el1, el2){
	return el1 > el2;
}

function lessThen(el1, el2){
	return el1 < el2;
}
/*
Array.prototype.sum = function(result = 0) {
	this.forEach(function (number){
		result += number;
	});
	return result;
}

Array.prototype.range = function(min, max, result = []){
	this.forEach(function (number) {
		if(greaterThen(number, min - 1) && lessThen(number, max + 1))
			result.push(number);
	});
	return result;
}

Array.prototype.avg = function(result = 0){
	return this.sum() / this.length;
}

Array.prototype.max = function(numbers) {
	var max, j = 0;
	this.forEach(function (number) {
		max = equal(j++, 0) ? number : (greaterThen(max, number) ? max : number);
	});
	return max;
}

Array.prototype.min = function(numbers) {
	var min, j = 0;
	this.forEach(function (number) {
		min = equal(j++, 0) ? number : (lessThen(min, number) ? min : number);
	});
	return min;
}

Array.prototype.head = function(){//existuje shift - ale ten vymazava
	this.length > 0 ? this[0] : false;
}

Array.prototype.last = function(){//existuje pop - ale ten vymazava
	this.length > 0 ? this[this.length - 1] : false;
}

Array.prototype.merge = function(){
	return this.concat().sort();
}

Array.prototype.product = function(func, result = []){
	this.forEach(function(element){
		result.push(func(element));
	});
	return result;
}

*/
//sample
//repeat
//cycle