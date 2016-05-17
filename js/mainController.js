var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
	$scope.name = "dfgdf";
	$scope.meno = "dfgdf";
	$scope.pole=[1, 2, 3, 4, 5, 6];

	$scope.pole2=function(num){
		var res = [];
		for(var i=0; i<num ; i++)
			res[i] = $scope.pole[i];
		return res;
	}
});

app.directive("test", function($compile) {
    return {
    	scope: { 
			title: '=' 
		}, 
        //template : "<input type='text' value='{{title}}' ng-blur='changeToSpan()'>",
        template : "<span ng-dblclick='switch()'>{{ ' ' + title}}</span>",
        link: function($scope, element, attrs) {
            $scope.switch = function() {
            	var html;
            	if(element[0].childNodes[0].tagName == "SPAN")
                	html ="<input type='text' value='{{title}}' ng-blur='switch()'>";
                else
                	html ="<span ng-dblclick='switch()'>{{ ' ' + title}}</span>";
	            var e = $compile(html)($scope);
	            console.log(html)
	            element[0].removeChild(element[0].childNodes[0]);
	            element[0].innerHTML = html;
	            element.replaceWith(e);
            }
        }
    };
});


