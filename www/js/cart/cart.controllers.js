angular.module('cart.controllers', [])

.controller('ShoppingCartCtrl', function($scope, locationChangeRouteTrackerService, $ionicLoading, $state, $rootScope, $ionicActionSheet, products, ShoppingCartService, CheckoutService, outletService) {

	//OUTLET INFO
	$scope.outletSelection = outletService.getInfo();
	$scope.deliveryCharge = Math.round($scope.outletSelection['parcelPercentageDelivery']*100);
	$scope.pickupCharge = Math.round($scope.outletSelection['parcelPercentagePickup']*100);
	$scope.taxPercentage = Math.round($scope.outletSelection['taxPercentage']*100);

	$scope.isOutletOpenNow = $scope.outletSelection['isOpen'];

	//Check if location, outlet are set: if not ask user to set it.
	if($scope.outletSelection.outlet == "" || _.isUndefined(window.localStorage.locationCode)){
		$scope.isLocationSet = false;
	}
	else{
		$scope.isLocationSet = true;
	}

	//Change location
	$scope.changeLocation = function(){
		window.localStorage.removeItem("outlet");
		window.localStorage.removeItem("location");
		window.localStorage.removeItem("locationCode");

		locationChangeRouteTrackerService.setSource('main.app.shopping-cart');
		$state.go('intro.walkthrough-welcome');
	}

	//Take away OR delivery
	$scope.orderType = CheckoutService.getCheckoutMode();

	$scope.setCheckoutMode = function(mode){
		CheckoutService.setCheckoutMode(mode);
		$scope.orderType = mode;
	}

	//Restric ONLY Takeaway based on the uer location
	if($scope.outletSelection['onlyTakeAway']){
		$scope.isDeliveryAvailable = false;
		$scope.orderType = 'takeaway';
		CheckoutService.setCheckoutMode('takeaway');
	}
	else{
		$scope.isDeliveryAvailable = true;
	}


	$scope.products = products;

	$scope.$on('cart_updated', function(event, cart_products) {
    	$scope.products = cart_products;
  	});


	$scope.close = function() {
		var previous_view = _.last($rootScope.previousView);
		$state.go(previous_view.fromState, previous_view.fromParams );
  	};

	$scope.removeFromCart = function(product) {
		$ionicActionSheet.show({
			buttons: [
        { text: '<i class="icon ion-trash-a assertive"></i> <i class="assertive">Remove from the Cart</i>' },
        { text: '<i class="icon"></i> <i class="dark">Cancel</i>' },
      ],
			titleText: 'Remove '+product.itemName+' from the Cart?',
			buttonClicked: function(index) {
				if(index == 0){
					ShoppingCartService.removeProduct(product);
				}
        return true;
      },
		});
	};

	$scope.addCount = function(product) {
		console.log(product);
		ShoppingCartService.addProduct(product);
	};

	$scope.lessCount = function(product) {
		ShoppingCartService.lessProduct(product);
	};

	//update product quantities
	$scope.$watch('subtotal', function() {
		var updatedProducts = $scope.products;
		ShoppingCartService.updatedProducts(updatedProducts);
	});


	$scope.getSubtotal = function() {
		$scope.subtotal = _.reduce($scope.products, function(memo, product){
			return memo + (product.itemPrice * product.qty);
		}, 0);

		return $scope.subtotal;
	};

	$scope.tax = 0;
	$scope.getTax = function() {
		$scope.tax = $scope.subtotal * $scope.outletSelection['taxPercentage'];
		return parseFloat($scope.tax).toFixed(2);
	};

	$scope.getParcel = function() {
		if($scope.orderType == 'delivery'){
			$scope.parcel = $scope.subtotal * $scope.outletSelection['parcelPercentageDelivery'];
		}
		else{
			$scope.parcel = $scope.subtotal * $scope.outletSelection['parcelPercentagePickup'];
		}
		return parseFloat($scope.parcel).toFixed(2);
	};

	$scope.getTotal = function() {
		var total_sum = $scope.subtotal + (Math.round($scope.parcel * 100) / 100) + (Math.round($scope.tax * 100) / 100);
		return parseFloat(total_sum).toFixed(2);
	};

	//Go to checkout - validate cart total
	$scope.goCheckout = function(){
		console.log('GO TO CHECKOUT');
		if(_.isUndefined(window.localStorage.locationCode)){
			$ionicLoading.show({
				template:  'Please set your location to Proceed',
				duration: 2000
			});
		}
		else{
			if(!$scope.isOutletOpenNow){
				if($scope.orderType == 'delivery'){
					$ionicLoading.show({
						template:  'Sorry! The nearest outlet is closed.',
						duration: 2000
					});
				}
				else{
					$ionicLoading.show({
						template:  'Warning: The nearest outlet is closed.',
						duration: 3000
					});
					$state.go('main.app.checkout');
				}

			}
			else{
				if($scope.orderType == 'delivery'){ //Check for minimum order criteria
					console.log('DELIVERY...')
					var total = this.getSubtotal() + parseFloat(this.getParcel()) + parseFloat(this.getTax());
					var min = $scope.outletSelection['minAmount'];
					if(total >= min){
						$state.go('main.app.checkout');
					}
					else{
						$ionicLoading.show({
							template:  '<b style="color: #FFE800; font-size: 160%">Oops!</b><br>The minimum order amount is <i class="fa fa-inr"></i> '+min,
							duration: 3000
						});
					}
				}
				else{
					$state.go('main.app.checkout');
				}
			}
		}
	}
})


;
