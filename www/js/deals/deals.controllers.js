angular.module('deals.controllers', [])

    .controller('DealsCtrl', function(outletWarningStatusService, DealsCartService, outletService, $ionicLoading, ShoppingCartService, ConnectivityMonitor, $scope, $http, $rootScope, $ionicPopup, $state) {


        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }



        //Show Deals Cart button if any item found in the deals cart
        $scope.getProductsInCart = function() {
            return DealsCartService.getProducts().length;
        };

        $scope.cartLength = $scope.getProductsInCart();

        $scope.goDealsCart = function() {
            $state.go('main.app.deals-cart');
        }


        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        $scope.isOutletClosedNow = !$scope.outletSelection.isOpen;
        $scope.outletClosureWarning = outletWarningStatusService.getStatus();
        $scope.clearClosureWarning = function() {
            $scope.outletClosureWarning = false;
            outletWarningStatusService.clearWarning();
        }


        //Fetch COMBO OFFERS
        $http.get('https://www.zaitoon.online/services/fetchcombos.php?outlet=' + $myOutlet)
            .then(function(response) {
                $scope.combos = response.data.response;
                $scope.isCombosEmpty = !response.data.status;
            });

        $scope.addComboToCart = function(combo) {
            $ionicLoading.show({
                template: '<tag style="color: #f1c40f">' + combo.itemName + '</tag> is added to cart.',
                duration: 2000
            });

            combo.qty = 1;
            ShoppingCartService.addProduct(combo);
        };




        $scope.customDealsOptions = function(product) {

            //Render Template
            var i = 0;
            $scope.choiceName = "";
            $scope.choicePrice = "";
            var choiceTemplate = '<div style="margin-top: 10px">';
            while (i < product.custom.length) {
                choiceTemplate = choiceTemplate + '<button class="button button-full" style="text-align: left; color: #c52031; margin-bottom: 8px;" ng-click="addCustomItem(\'' + product.custom[i].customName + '\', ' + product.custom[i].customPrice + ')">' + product.custom[i].customName + ' <tag style="font-size: 80%; color: #8c8f93; float: right"><i class="fa fa-inr"></i> ' + product.custom[i].customPrice + '</tag></button>';
                i++;
            }
            choiceTemplate = choiceTemplate + '</div>';

            var newCustomPopup = $ionicPopup.show({
                cssClass: 'popup-outer new-shipping-address-view',
                template: choiceTemplate,
                title: 'Your choice of ' + product.itemName,
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }]
            });
            $scope.addCustomItem = function(variant, price) {
                $scope.choiceName = variant;
                $scope.choicePrice = price;

                if ($scope.choiceName != "" && $scope.choicePrice != "") {
                    product.itemPrice = $scope.choicePrice;
                    product.variant = $scope.choiceName;

                    $scope.addToDealsCart(product);
                    newCustomPopup.close();
                }

            }

        }



        $scope.addToDealsCart = function(product) {

            $ionicLoading.show({
                template: '<tag style="color: #f1c40f">' + product.itemName + '</tag> is added.',
                duration: 1000
            });

            product.qty = 1;

            DealsCartService.addProduct(product);
            $scope.cartLength = $scope.getProductsInCart();
        }


        $scope.showHistory = function() {
            $state.go('main.app.passes');
        }




        $http.get('https://www.zaitoon.online/services/fetchdeals.php?id=0')
            .then(function(response) {
                $scope.deals = response.data.response;
                $scope.isEmpty = !response.data.status;

                $scope.left = 1;

                console.log(response)
            });


        $scope.limiter = 5;
        $scope.loadMore = function() {
            $http.get('https://www.zaitoon.online/services/fetchdeals.php?id=' + $scope.limiter)
                .then(function(items) {
                    if (items.data.response.length == 0) {
                        $scope.left = 0;
                    }
                    $scope.deals = $scope.deals.concat(items.data.response)
                    $scope.limiter += 5;
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
        };


    })

    .controller('DealsCartCtrl', function($scope, $ionicPlatform, $ionicLoading, $state, $http, ProfileService, $rootScope, $ionicActionSheet, products, DealsCartService, outletService) {


  
        $scope.products = products;

        $rootScope.user = "";



        $scope.$on('deals_cart_updated', function(event, cart_products) {
            $scope.products = cart_products;
        });


        $scope.close = function() {
            var previous_view = _.last($rootScope.previousView);
            $state.go(previous_view.fromState, previous_view.fromParams);
        };

        $scope.removeFromCart = function(product) {
            $ionicActionSheet.show({
                buttons: [{
                        text: '<i class="icon ion-trash-a assertive"></i> <i class="assertive">Remove from the Cart</i>'
                    },
                    {
                        text: '<i class="icon"></i> <i class="dark">Cancel</i>'
                    },
                ],
                titleText: 'Remove ' + product.itemName + ' from the Cart?',
                buttonClicked: function(index) {
                    if (index == 0) {
                        DealsCartService.removeProduct(product);
                    }
                    return true;
                },
            });
        };

        $scope.addCount = function(product) {
            DealsCartService.addProduct(product);
        };

        $scope.lessCount = function(product) {
            DealsCartService.lessProduct(product);
        };

        //update product quantities
        $scope.$watch('subtotal', function() {
            var updatedProducts = $scope.products;
            DealsCartService.updatedProducts(updatedProducts);
        });


        $scope.getSubtotal = function() {
            $scope.subtotal = _.reduce($scope.products, function(memo, product) {
                return memo + (product.itemPrice * product.qty);
            }, 0);

            return $scope.subtotal;
        };

        $scope.tax = 0;
        $scope.getTax = function() {
            $scope.tax = $scope.subtotal * $scope.outletSelection['taxPercentage'];
            return Math.ceil($scope.tax);
        };

        $scope.getOther = function() {
            $scope.other = 0;
            return $scope.other;
            //return Math.ceil($scope.other);
        };

        $scope.getTotal = function() {
            return $scope.subtotal + Math.ceil($scope.other);
        };




        $scope.getItemStyle = function(deal) {

            var style = {
                "margin-bottom": "15px",
                "padding": "4px 2px",
                "background": "#303335",
                "color": "#fff",
                "border": "2px dashed #4b4f52",
                "border-radius": " 10px",
                "box-shadow": "0 0 0 4px #303335, 2px 1px 4px 3px rgba(10, 10, 0, 0.3)"
            }


            if (deal.isImageAvailable == 1) {
                style = {
                    "margin-bottom": "15px",
                    "background": "#303335",
                    "color": "#fff",
                    "border": "none",
                    "padding": "0",
                    "border-radius": " 10px",
                    "box-shadow": "0 0 0 4px #303335, 2px 1px 4px 3px rgba(10, 10, 0, 0.3)"
                }
            }
            return style;
        }




        //RAZORPAY INTEGRATION
        var called = false

        $scope.orderID = '';

        var successCallback = function(payment_id) {
            var data = {};
            data.token = JSON.parse(window.localStorage.user).token;
            data.orderID = $scope.orderID;
            data.transactionID = payment_id;


                //LOADING
                $ionicLoading.show({
                    template:  '<ion-spinner></ion-spinner>'
                });

            //alert('Details: '+data.token+'______'+data.orderID+'____'+data.transactionID)

            $http({
                    method: 'POST',
                    url: 'https://www.zaitoon.online/services/processpasspayment.php',
                    data: data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                })
                .success(function(response) {
                    $ionicLoading.hide();
                    if (response.status) {
                        window.localStorage.removeItem("zaitoonFirst_dealsCart");
                        $state.go('main.app.passes');
                    } else {
                        $ionicLoading.show({
                            template: 'Something went wrong. The order was not placed.',
                            duration: 3000
                        });
                    }
                })
                .error(function(data) {
                    $ionicLoading.show({
                        template: "Order was not placed due to network error.",
                        duration: 3000
                    });
                });

            called = false
        };

        var cancelCallback = function(error) {

            $ionicLoading.show({
                template: '<b style="color: #e74c3c; font-size: 150%">Error' + '</b><br>' + error.description,
                duration: 3000
            });

            called = false
        };

        


        //$ionicPlatform.ready(function(){
         document.addEventListener('deviceready', function () {

        $scope.placeOrder = function() {


          if(_.isUndefined(window.localStorage.user) && window.localStorage.user !=""){
              $ionicLoading.show({
                template:  'Please login to purchase offers',
                duration: 3000
              });
            $state.go('intro.auth-login');
          }
          else{
            //User Info
            ProfileService.getUserData()
            .then(function(response) {
                $rootScope.user = response;
            })

          }

      



            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet',
                    duration: 2000
                });
            }

            if (!called) {

                //Step 1 - Create ORDER
                //Create Order
                var data = {};
                data.token = JSON.parse(window.localStorage.user).token;
                data.outlet = window.localStorage.outlet;

                var formattedcart = {};
                formattedcart.cartTotal = this.getSubtotal();
                formattedcart.cartExtra = this.getOther();



                var temp_cart = JSON.parse(window.localStorage.zaitoonFirst_dealsCart);
                for (var key in temp_cart) {
                    delete temp_cart[key].type;
                    delete temp_cart[key].code;
                    delete temp_cart[key].description;
                    delete temp_cart[key].isImageAvailable;
                    delete temp_cart[key].isAppOnly;
                    delete temp_cart[key].isPurchasable;
                    delete temp_cart[key].url;
                    delete temp_cart[key].validTill;
                    delete temp_cart[key].custom;
                }

                formattedcart.items = temp_cart;


                data.cart = formattedcart;
                data.platform = "IOS";

                $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/createpassorder.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000,
                    })
                    .success(function(response) {

                        if (!response.status) {
                            $ionicLoading.show({
                                template: '<b style="color: #e74c3c; font-size: 150%">Error!</b><br>' + response.error,
                                duration: 3000
                            });
                        } else {

                            var accKey = response.accountKey;
                            
                            if (response.isPrepaidAllowed) {
                                $scope.orderID = response.orderid;
                                //Payment options
                                var options = {
                                    description: 'Payment for Order #' + response.orderid,
                                    image: 'https://zaitoon.online/services/images/razor_icon.png',
                                    currency: 'INR',
                                    key: accKey,
                                    amount: response.amount * 100,
                                    name: 'Zaitoon Online',
                                    prefill: {
                                        email: $rootScope.user.email,
                                        contact: $rootScope.user.mobile,
                                        name: $rootScope.user.name
                                    },
                                    theme: {
                                        color: '#e74c3c'
                                    }
                                };

                                //Step 2 - Make Payment
                                RazorpayCheckout.open(options, successCallback, cancelCallback);
                                called = true;
                            
                            } else {
                                $ionicLoading.show({
                                    template: '<b style="color: #e74c3c; font-size: 150%">Sorry!</b><br>Online payment is not available currently. Please try after sometime.',
                                    duration: 3000
                                });
                            }
                            
                        }
                    })
                    .error(function(data) {
                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });
                    });


            }
        }
        }, false);
        //$rootScope.apply();
        //});




    })




.controller('PassesCtrl', function(ConnectivityMonitor, $scope, $http, $state, $ionicLoading, PassViewService) {



    //Network Status
    if(ConnectivityMonitor.isOffline()){
        $scope.isOfflineFlag = true;
    }
    else{
        $scope.isOfflineFlag = false;
    }


  var data = {};
  data.token = JSON.parse(window.localStorage.user).token;
  data.id = 0;

  $http({
    method  : 'POST',
    url     : 'https://www.zaitoon.online/services/passhistory.php',
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
  
  
  $scope.openPasses = function(orderid){
      PassViewService.setOrderID(orderid);
      $state.go('main.app.view-passes');
  }


  $scope.limiter = 5;
  $scope.loadMore = function() {
    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;
    data.id = $scope.limiter;

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/passhistory.php',
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
})



    .controller('ViewPassesCtrl', function($scope, $ionicLoading, $ionicPopup, $state, $http, ProfileService, $rootScope, $ionicActionSheet, DealsCartService, outletService, PassViewService) {

        $scope.viewOrder = PassViewService.getOrderID();

        //Fetch all the related passes against this order
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner>'
        });

        var data = {};
        data.token = JSON.parse(window.localStorage.user).token;
        data.uid = $scope.viewOrder;
        $http({
                method: 'POST',
                url: 'https://www.zaitoon.online/services/fetchpasses.php',
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            })
            .success(function(data) {
                $ionicLoading.hide();
                if (data.status) {
                    $scope.products = data.response;

                } else {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "Error: " + data.error,
                        duration: 3000
                    });
                    $state.go('main.app.passes');
                }

            })
            .error(function(data) {
                $ionicLoading.hide();
                $ionicLoading.show({
                    template: "Not responding. Check your connection.",
                    duration: 3000
                });
            });


        $scope.viewthis = function(cont) {
            var alertPopup = $ionicPopup.alert({
                cssClass: 'popup-outer new-shipping-address-view',
                title: 'Unique Pass ID',
                template: "<div style='padding: 15px 5px; text-align: center; letter-spacing: 4px;'><strong style='color: #2ecc71; font-size: 21px'>" + cont + "</strong></div>"
            });
        }

        $scope.close = function() {
            var previous_view = _.last($rootScope.previousView);
            $state.go(previous_view.fromState, previous_view.fromParams);
        };


        $scope.getItemStyle = function(deal) {

            var style = {
                "margin-bottom": "15px",
                "padding": "4px 2px",
                "background": "#303335",
                "color": "#fff",
                "border": "2px dashed #4b4f52",
                "border-radius": " 10px",
                "box-shadow": "0 0 0 4px #303335, 2px 1px 4px 3px rgba(10, 10, 0, 0.3)"
            }


            if (deal.isImageAvailable == 1) {
                style = {
                    "margin-bottom": "15px",
                    "background": "#303335",
                    "color": "#fff",
                    "border": "none",
                    "padding": "0",
                    "border-radius": " 10px",
                    "box-shadow": "0 0 0 4px #303335, 2px 1px 4px 3px rgba(10, 10, 0, 0.3)"
                }
            }
            return style;
        }

    })

;