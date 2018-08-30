angular.module('account.controllers', [])


.controller('ProfileCtrl', function($ionicLoading, menuService, ConnectivityMonitor, $scope, $rootScope, $http, user, ProfileService, $ionicPopover, $ionicPopup, $ionicActionSheet, $state, $ionicModal) {


  //Network Status
	if(ConnectivityMonitor.isOffline()){
		$scope.isOfflineFlag = true;
    $scope.customer = JSON.parse(window.localStorage.user); //display offline content
	}
	else{
		$scope.isOfflineFlag = false;
    $scope.customer = user; //Fetch user info if online
	}



  //if not logged in
  if(_.isUndefined(window.localStorage.user) && window.localStorage.user !=""){
    $state.go('intro.auth-login');
  }

  //Settings
  $scope.show_new_address_button = false;   //Don't give a provision to add new address here.

  $scope.data = {};
  $scope.addressCount = 0;

  $scope.user_shipping_addresses = $scope.customer.savedAddresses;
  $scope.addressCount = $scope.customer.savedAddresses.length;


  //Set the default address
    var i = 0;
    while(i < $scope.user_shipping_addresses.length){
      if($scope.user_shipping_addresses[i].isDefault){
        $scope.data.selected_address = $scope.user_shipping_addresses[i];
        break;
      }
      i++;
    }




  //Edit Profile
  $scope.isEditMode = false;

  $scope.editProfile = function(){
    //Take back up of current values
    $scope.temp_name = $scope.customer.name;
    $scope.temp_email = $scope.customer.email;

    document.getElementById("inputProfileName").style.borderBottom="1px solid #1abc9c";
    document.getElementById("inputProfileEmail").style.borderBottom="1px solid #1abc9c";

    $scope.isEditMode = true;
  }

  $scope.cancelEdit = function(){
    //Reset revious values
    $scope.customer.name = $scope.temp_name;
    $scope.customer.email = $scope.temp_email;

    document.getElementById("inputProfileName").style.borderBottom="1px solid rgba(238, 242, 245, 1)";
    document.getElementById("inputProfileEmail").style.borderBottom="1px solid rgba(238, 242, 245, 1)";

    $scope.isEditMode = false;
  }

  $scope.saveEdit = function(){
    $scope.isEditMode = false;
    document.getElementById("inputProfileName").style.borderBottom="1px solid rgba(238, 242, 245, 1)";
    document.getElementById("inputProfileEmail").style.borderBottom="1px solid rgba(238, 242, 245, 1)";

    //Call http request and make the changes in the servers
    ProfileService.updateUserData($scope.customer.name, $scope.customer.email);
  }


  $ionicPopover.fromTemplateUrl('views/common/partials/address-chooser-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.addresses_popover = popover;
  });

  $scope.openAddressesPopover = function($event){
		$scope.addresses_popover.show($event);
	};
  $scope.selectShippingAddress = function(address){
		$scope.addresses_popover.hide();
	};


	$scope.logout = function() {
		$ionicActionSheet.show({
			buttons: [
        { text: '<i class="icon ion-log-out assertive"></i> <i class="assertive">Logout</i>' },
        { text: '<i class="icon"></i> <i class="dark">Cancel</i>' },
      ],
			titleText: 'Are you sure you want to logout?',
			buttonClicked: function(index) {
				if(index == 0){
					window.localStorage.clear();
          menuService.resetAll();
					$state.go('intro.auth-login');
				}
        return true;
      },
		});
	};


  $scope.showEditAddressPopup = function(address) {
		$scope.address = address;

    var editAddressPopup = $ionicPopup.show({
      cssClass: 'popup-outer edit-shipping-address-view',
      templateUrl: 'views/common/partials/edit-shipping-address-popup.html',
      title: address.name,
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Delete',
					type: 'delete-button',
          onTap: function(e) {
            var response = ProfileService.deleteSavedAddress(address.id);
            if(response){
              //Successfully deleted. Hide from current list of addresses.
              var i = 0;
              while(i < $scope.user_shipping_addresses.length){
                if(address.id == $scope.user_shipping_addresses[i].id){
                  $scope.user_shipping_addresses.splice(i, 1);
                  $scope.addresses_popover.hide();

                  $scope.data.selected_address = "";

                  if($scope.user_shipping_addresses.length == 0)
                    $state.reload();

                  //Set the default address
                  var i = 0;
                  while(i < $scope.user_shipping_addresses.length){
                    if($scope.user_shipping_addresses[i].isDefault){
                      $scope.data.selected_address = $scope.user_shipping_addresses[i];
                      break;
                    }
                    i++;
                  }

                  break;
                }
                i++;
              }

            }
          }
        },
        {
          text: 'Save',
          onTap: function(e) {
            // return $scope.data;
          }
        }
      ]
    });
    editAddressPopup.then(function(res) {
      if(res)
      {
      }
      else {}
    });
  };


  //Help Part
  $ionicModal.fromTemplateUrl('views/help/help.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.help_modal = modal;
  });

  $scope.showHelp = function(){
    $scope.help_modal.show();
  };

  $scope.queryType = 'GENERAL';

  $scope.myquery = {};
  $scope.myquery.reference = "";
  $scope.myquery.comment = "";
  $scope.myquery.name = $scope.customer.name;
  $scope.myquery.email = $scope.customer.email;
  $scope.myquery.mobile = $scope.customer.mobile;

  $scope.setType = function (value) {
    $scope.queryType = value;
    if(value == 'REFUND'){
      $scope.myquery.comment = 'The order I tried to place on DD-MM-YYYY, at around HH:MM AM/PM was failed. An amount of Rs. XXX was deducted from my account, but the order was not placed. Please initiate refund for the debited amount. I have mentioned the Razorpay Payment ID for your reference.';
    }
    else{
      $scope.myquery.comment = '';
    }
  }

  $scope.submitError = '';
  $scope.submitQuery = function(){
    $scope.submitError = '';
    //Validations
		if(!(/^[a-zA-Z\s]*$/.test($scope.myquery.name))){
			$scope.submitError = "Names can contain only letters";
		}
		else if(!(/^\d{10}$/).test($scope.myquery.mobile)){
			$scope.submitError = "Mobile Number has to be 10 digit number";
		}
		else if(($scope.myquery.comment).length < 10){
			$scope.submitError = "Please elaborate your query";
		}
		else if(($scope.myquery.comment).length > 500){
			$scope.submitError = "Comments can not contain more than 500 characters";
		}
		else if($scope.myquery.comment == 'The order I tried to place on DD-MM-YYYY, at around HH:MM AM/PM was failed. An amount of Rs. XXX was deducted from my account, but the order was not placed. Please initiate refund for the debited amount. I have mentioned the Razorpay Payment ID for your reference.' && $scope.queryType == 'REFUND'){
			$scope.submitError = "Please edit the date and time of placing the order, order amount etc. in comments";
		}
		else if($scope.queryType == 'REFUND' && ($scope.myquery.reference).length < 1){
			$scope.submitError = "Add 'Payment Reference ID' from Razorpay";
		}
		else{
      $scope.submitError = '';

      $scope.myquery.type = $scope.queryType;
      $scope.myquery.token = JSON.parse(window.localStorage.user).token;

      $scope.myquery.source = 'IOS';

      //LOADING
      $ionicLoading.show({
        template:  '<ion-spinner></ion-spinner>'
      });

      $http({
        method  : 'POST',
        url     : 'https://www.zaitoon.online/services/submitquery.php',
        data    : $scope.myquery,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout : 10000
       })
      .success(function(response) {
        $ionicLoading.hide();
        if(response.status){
          $ionicLoading.show({
            template:  'We have received your message. You will be contacted soon!',
            duration: 3000
          });
          $scope.myquery.comments = "";
          $scope.myquery.reference = "";
          $scope.help_modal.hide();
          $state.go('main.app.account');
        }
        else{
          $ionicLoading.show({
            template:  response.error,
            duration: 3000
          });
        }
      })
      .error(function(data){
        $ionicLoading.hide();
          $ionicLoading.show({
            template:  "Order was not placed due to network error.",
            duration: 3000
          });
      });

    }
  }

})

.controller('OrdersCtrl', function(ConnectivityMonitor, $scope, $http, trackOrderService, $state, $ionicLoading) {



    //Network Status
  	if(ConnectivityMonitor.isOffline()){
  		$scope.isOfflineFlag = true;
  	}
  	else{
  		$scope.isOfflineFlag = false;
  	}


  $scope.trackMe = function(id){
    trackOrderService.setOrderID(id);
    $state.go('main.app.checkout.track');
  }


  var data = {};
  data.token = JSON.parse(window.localStorage.user).token;
  data.id = 0;

  $http({
    method  : 'POST',
    url     : 'https://www.zaitoon.online/services/orderhistory.php',
    data    : data,
    headers : {'Content-Type': 'application/x-www-form-urlencoded'},
    timeout : 10000
   })
  .success(function(data) {

    $scope.orders = data.response;
    $scope.isFail= !data.status;
    $scope.failMsg= data.error;

    if($scope.orders.length == 0)
      $scope.isEmpty = true;
    else
      $scope.isEmpty = false;

    $scope.left = 1;
  })
  .error(function(data){
      $ionicLoading.hide();
      $ionicLoading.show({
        template:  "Not responding. Check your connection.",
        duration: 3000
      });
  });


  $scope.limiter = 5;
  $scope.loadMore = function() {
    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;
    data.id = $scope.limiter;

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/orderhistory.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'},
      timeout : 10000
     })
    .success(function(items) {

      if(items.response.length == 0){
        $scope.left = 0;
      }
      $scope.orders = $scope.orders.concat(items.response)

    //  $scope.feedsList.push(items);
      $scope.limiter+=5;

      //$scope.left = 0;
      $scope.$broadcast('scroll.infiniteScrollComplete');
    })
    .error(function(data){
        $ionicLoading.show({
          template:  "Not responding. Check your connection.",
          duration: 3000
        });
    });

  };




  //
  // $http.get('https://www.zaitoon.online/services/orderhistory.php?id=0&token='+token)
  // .then(function(response){
  //       $scope.orders = response.data.response;
  //       if($scope.orders.length == 0)
  //         $scope.isEmpty = true;
  //       else
  //         $scope.isEmpty = false;
  //
  //       $scope.left = 1;
  //   });
  // $scope.limiter=5;
  // $scope.loadMore = function() {
  //   $http.get('https://www.zaitoon.online/services/orderhistory.php?id='+$scope.limiter+'&token='+token)
  //   .then(function(items) {
  //     if(items.data.response.length == 0){
  //       $scope.left = 0;
  //     }
  //     $scope.orders = $scope.orders.concat(items.data.response)
  //
  //   //  $scope.feedsList.push(items);
  //     $scope.limiter+=5;
  //
  //     //$scope.left = 0;
  //     $scope.$broadcast('scroll.infiniteScrollComplete');
  //   });
  // };

})


;
