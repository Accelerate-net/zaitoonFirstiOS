angular.module('search.controllers', [])

.controller('SearchCtrl', function($scope, results, ShoppingCartService, $ionicLoading) {

	$scope.search = { query : '' };
	$scope.products = results;


	$scope.cancelSearch = function(){
		$scope.search = { query : '' };
	};


	$scope.addToCart = function(product) {
		$ionicLoading.show({
			template:  '<b style="color: #f1c40f">'+product.name+'</b> is added.',
			duration: 1000
		});

		product.qty = 1;
		product.size = "M";
		product.color = "black";
		product.price = 150;
  	    ShoppingCartService.addProduct(product);
  	};



})


;
