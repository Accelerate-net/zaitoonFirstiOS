angular.module('checkout.controllers', [])

    .controller('CheckoutCtrl', function($timeout, $ionicPopup, locationChangeRouteTrackerService, ConnectivityMonitor, trackOrderService, $scope, $state, $http, ProfileService, $rootScope, products, CheckoutService, couponService, outletService, $ionicPopover, $ionicPlatform, $ionicLoading) {

        //If not logged in (meaning, does not have a token)?
        if (_.isUndefined(window.localStorage.user) && window.localStorage.user != "") {
            $ionicLoading.show({
                template: 'Please login to place an order',
                duration: 3000
            });
            $state.go('intro.auth-login');
        }

        //User Info
        $rootScope.user = "";
        ProfileService.getUserData()
            .then(function(response) {
                $rootScope.user = response;
            })


        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
            $ionicLoading.show({
                template: 'Please connect to Internet',
                duration: 3000
            });
        } else {
            $scope.isOfflineFlag = false;
        }



        //OUTLET INFO
        $scope.outletSelection = outletService.getInfo();
        $scope.deliveryCharge = Math.round($scope.outletSelection['parcelPercentageDelivery'] * 100);
        $scope.pickupCharge = Math.round($scope.outletSelection['parcelPercentagePickup'] * 100);
        $scope.taxPercentage = Math.round($scope.outletSelection['taxPercentage'] * 100);

        $scope.razorpayKey = $scope.outletSelection['paymentKey'];

        if (!$scope.outletSelection['outlet']) {
            $state.go('intro.walkthrough-welcome');
        }

        //Pickup Defaulting for IIT Madras and Special Outlets
        $scope.isPickupChangeable = true;
        if ($scope.outletSelection['isSpecial']) {
            $scope.isPickupChangeable = false;
            $http.get('https://www.zaitoon.online/services/fetchoutletinfosimple.php?outlet=' + $scope.outletSelection['outlet'])
                .then(function(response) {
                    $scope.myOutletFixed = response.data.response;
                    $scope.pickupAddressDefault = $scope.myOutletFixed[0].name;
                });
        }


        //Change location
        $scope.changeLocation = function() {
            window.localStorage.changeLocationFlag = true;
            locationChangeRouteTrackerService.setSource('main.app.checkout');
            $state.go('intro.walkthrough-welcome');
        }


        //Get the checkout mode TAKEAWAY/DELIVERY
        $scope.checkoutMode = CheckoutService.getCheckoutMode();

        $scope.comments = {};
        $scope.comments.value = "";

        //Redeem Points - default value
        //$scope.rewardCoins = 0;


        //Set of Outlets Available

        $http.get('https://www.zaitoon.online/services/fetchoutletssimple.php?city=' + $scope.outletSelection.city)
            .then(function(response) {
                $scope.outletList = response.data.response;



                //For UI enhancement in popup
                $scope.outletListSize = Object.keys($scope.outletList).length;

                //Set what to display for the default pickup outlet
                var default_outlet = $scope.outletSelection.outlet;
                var i = 0;
                while (i < Object.keys($scope.outletList).length) {
                    if ($scope.outletList[i].value == default_outlet) {
                        window.localStorage.outletInfo = $scope.outletList[i].name;
                        break;
                    }
                    i++;
                }
            });


        var temp_nearest = {};
        $timeout(function() { //Time delay is added to give time gap for loading location
            //Nearest Oulet
            temp_nearest.value = $scope.outletSelection.outlet;
            temp_nearest.name = window.localStorage.outletInfo;
        }, 500);

        //To choose the pick up center
        $scope.data = {};
        $scope.data.selected_outlet = temp_nearest;



        //Choose Outlet
        $timeout(function() { //Time delay is added to give time gap for popup to load!!
            $ionicPopover.fromTemplateUrl('views/common/partials/pickup-outlet-chooser-popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.outlet_popover = popover;
            });
        }, 1000);

        $scope.openOutletPopover = function($event) {
            $scope.outlet_popover.show($event);
        };

        $scope.setOutlet = function(outletObj) {

            window.localStorage.outlet = outletObj.value;
            $scope.data.selected_outlet = outletObj;
            $scope.outlet_popover.hide();

            //Update Payment Info.
            $scope.onlinePayFlag = outletObj.isAcceptingOnlinePayment;
            $scope.razorpayKey = outletObj.razorpayID
        };

        $scope.products = products;

        $scope.getSubtotal = function() {
            $scope.subtotal = _.reduce($scope.products, function(memo, product) {
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
            if ($scope.checkoutMode == 'delivery') {
                $scope.parcel = $scope.subtotal * $scope.outletSelection['parcelPercentageDelivery'];
            } else {
                $scope.parcel = $scope.subtotal * $scope.outletSelection['parcelPercentagePickup'];
            }
            return parseFloat($scope.parcel).toFixed(2);
        };

        $scope.getTotal = function() {
            var total_sum = $scope.subtotal + (Math.round($scope.parcel * 100) / 100) + (Math.round($scope.tax * 100) / 100);
            return parseFloat(total_sum).toFixed(2);
        };

        $scope.cancel = function() {
            var previous_view = _.last($rootScope.previousView);
            $state.go(previous_view.fromState, previous_view.fromParams);
        };

        $scope.getSelectedAddress = function() {
            return CheckoutService.getUserSelectedAddress().flatName;
        };

        $scope.getSelectedCard = function() {
            return CheckoutService.getUserSelectedCard().number;
        };

        //Validation of Coupon Code
        /*Check if coupon is already applied and locked*/
        $scope.isCouponEntered = false;
        $scope.couponDiscount = 0;

        if (couponService.getStatus()) {
            $scope.isCouponApplied = true;
            $scope.couponDiscount = couponService.getDiscount();
            $scope.promoMessage = "Coupon was applied successfully.";
            $scope.promoCode = couponService.getCoupon();
        } else {
            $scope.isCouponApplied = false;
            $scope.promoCode = "";
            $scope.promoMessage = "";
        }

        $scope.isSuccess = true;

        $scope.enteringCoupon = function() {
            $scope.isCouponEntered = true;
        }

        $scope.validateCoupon = function(promo) {
            if (!$scope.availRewards) {

                $scope.isCouponEntered = true;
                $scope.isCouponApplied = false;

                if (promo == "" || promo.length < 1) {
                    $scope.isSuccess = false;
                    $scope.promoMessage = "Coupon Code can not be null.";
                } else {
                    //Validate Coupon
                    var data = {};
                    data.coupon = promo;
                    data.token = JSON.parse(window.localStorage.user).token;

                    //Formatting Cart Object in the service required way
                    var formattedcart = {};
                    formattedcart.cartTotal = this.getSubtotal();
                    formattedcart.cartCoupon = promo;
                    formattedcart.items = JSON.parse(window.localStorage.zaitoonFirst_cart);
                    data.cart = formattedcart;
                    $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/validatecoupon.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {
                            $scope.isSuccess = response.status;
                            if (response.status) {
                                $scope.couponDiscount = response.discount;

                                $scope.showBannerFlag = false; // <-- for redeem points

                                $scope.isCouponApplied = true;
                                $scope.promoMessage = "Coupon applied successfully. You are eligible for a discount of Rs. " + $scope.couponDiscount;

                                //Add a lock to Cart Object.
                                couponService.setStatus(true);
                                couponService.setCoupon(promo);
                                couponService.setDiscount($scope.couponDiscount);
                            } else {
                                $scope.promoMessage = "Failed. " + response.error;
                            }
                        })
                        .error(function(data) {
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });
                        });
                }
            } else {
                $ionicLoading.show({
                    template: "Coupon can not be used when you redeem Zaitoon Coins.",
                    duration: 3000
                });
            }
        };




        $scope.availRewards = false;
        /*
          //Rewards Redemmption part
          $scope.isRewardEnabled = false;
          $scope.showBannerFlag = true;

          if(!_.isUndefined(window.localStorage.user)){
            $scope.isRewardEnabled = JSON.parse(window.localStorage.user).isRewardEnabled;
          }

          if($scope.isCouponApplied){
            $scope.showBannerFlag = false;
          }

          //Calculate redeemable points on this order
          var initRedeem = $scope.getRedeemablePoints = function() {

              var data = {};
              data.token = JSON.parse(window.localStorage.user).token;
              data.outlet = window.localStorage.outlet;
              //Formatting Cart Object in the service required way
              var formattedcart = {};
              formattedcart.items = JSON.parse(window.localStorage.zaitoonFirst_cart);
              data.cart = formattedcart;

              //LOADING
              $ionicLoading.show({
                template:  '<ion-spinner></ion-spinner>'
              });

              $http({
                method  : 'POST',
                url     : 'https://www.zaitoon.online/services/geteligiblerewardpoints.php',
                data    : data,
                headers : {'Content-Type': 'application/x-www-form-urlencoded'},
                timeout : 10000
               })
              .success(function(response) {
                if(response.status)
                {
                  $ionicLoading.hide();
                  $scope.availRewards = true;
                  $scope.rewardCoins = response.coins;
                }
                else{
                  $ionicLoading.hide();
                  $ionicLoading.show({
                    template:  response.error,
                    duration: 3000
                  });
                }
              })
              .error(function(data){
                $ionicLoading.hide();
                $ionicLoading.show({
                  template:  "Could not redeem. Try again.",
                  duration: 3000
                });
              });
          };

          $scope.hideBanner = function(){
            $scope.showBannerFlag = false;
          }

          $scope.triggerCoins = function(){
            if($scope.isCouponApplied){
              $ionicLoading.show({
                template:  "Sorry. Coins can not be redeemed as you have alread availed coupon discount.",
                duration: 3000
              });
            }
            else{
              initRedeem();
            }
            $scope.showBannerFlag = false;
          }

          */


        //Payment Options
        $scope.onlinePayFlag = false;
        $scope.onlinePayFlag = $scope.outletSelection['isAcceptingOnlinePayment'];
        if ($scope.onlinePayFlag)
            $scope.paychoice = 'PRE';
        else
            $scope.paychoice = 'COD';

        $scope.setPay = function(value) {
            $scope.paychoice = value;
        }



        //RAZORPAY INTEGRATION
        var called = false

        var successCallback = function(success) {

            var mydata = {};
            mydata.token = JSON.parse(window.localStorage.user).token;
            mydata.orderID = $scope.orderID;
            mydata.transactionID = success.razorpay_payment_id;
            mydata.razorpay_order_id = success.razorpay_order_id; 
            mydata.razorpay_signature = success.razorpay_signature;

                var attemptsCount = 1;          
                processPayment();
                
                function processPayment(){
                
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "<ion-spinner></ion-spinner><br>Placing Order<br><div id='paymentTimer'></div>"
                    });

                    var timeLeft = 20;
                    var mytimer = setInterval(function() {
                        timeLeft--;
                        document.getElementById("paymentTimer").innerHTML = timeLeft+" Seconds";
                        if(timeLeft == 0)
                        {
                            clearInterval(mytimer);
                            document.getElementById("paymentTimer").innerHTML = "Failed. Retrying...";
                            setTimeout(function(){
                                attemptsCount++;
                                if(attemptsCount == 5){
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: "<b style='color: #ef473a'>Failed.</b><br>Order was not Placed.",
                                        duration: 3000
                                    });
                                }
                                else{
                                    processPayment();
                                }
                            }, 2000);
                        }
                    }, 1000);
                
                
                    //Process Payment
                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/processpaymentmob.php',
                        data: mydata,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {
                        $ionicLoading.hide();
                        clearInterval(mytimer);
                        if (response.status) {
                            //Go to track page
                            trackOrderService.setOrderID(response.orderid);
                            window.localStorage.removeItem("zaitoonFirst_cart");
                            $state.go('main.app.checkout.track');
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                cssClass: 'popup-outer confirm-alert-view',
                                title: 'Order Failed',
                                template: '<p style="padding: 15px 5px; color: red">' + response.error + '</p>'
                            });
                        }
                    })
                    .error(function(data) {
                        $ionicLoading.show({
                            template: data.error,
                            duration: 3000
                        });
                    });
              }


            called = false
        };

        var cancelCallback = function(error) {

            $ionicLoading.show({
                template: '<b style="color: #e74c3c; font-size: 150%">Error' + '</b><br>' + error.description,
                duration: 3000
            });

            called = false
        };

        //$ionicPlatform.ready(function() {
            $scope.placeOrder = function() {

                if ($scope.isOfflineFlag) {
                    $ionicLoading.show({
                        template: 'Please connect to Internet',
                        duration: 2000
                    });
                }
                //If PREPAID
                if ($scope.paychoice == 'PRE') {
                    if (!called) {

                        //Step 1 - Create ORDER
                        //Create Order
                        var data = {};
                        data.token = JSON.parse(window.localStorage.user).token;
                        data.comments = $scope.comments.value;
                        data.address = !_.isUndefined(window.localStorage.zaitoonFirst_selected_address) ? JSON.parse(window.localStorage.zaitoonFirst_selected_address) : [];
                        data.modeOfPayment = $scope.paychoice;
                        data.outlet = window.localStorage.outlet;
                        data.isTakeAway = $scope.checkoutMode == 'takeaway' ? true : false;

                        var all_extras_temp = parseFloat(this.getTax()) + parseFloat(this.getParcel());

                        var formattedcart = {};
                        formattedcart.cartTotal = Math.round(this.getSubtotal() * 100 / 100);
                        formattedcart.cartExtra = Math.round(all_extras_temp * 100 / 100);
                        formattedcart.cartDiscount = $scope.couponDiscount;
                        //formattedcart.rewardsDiscount = $scope.rewardCoins;
                        formattedcart.cartCoupon = couponService.getCoupon();
                        formattedcart.items = JSON.parse(window.localStorage.zaitoonFirst_cart);
                        data.cart = formattedcart;
                        data.platform = "IOS";
                        data.location = $scope.outletSelection['locationCode'];

                        $http({
                                method: 'POST',
                                url: 'https://www.zaitoon.online/services/createordermob.php',
                                data: data,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                },
                                timeout: 10000,
                            })
                            .success(function(response) {
                                if (!response.status) {
                                    var alertPopup = $ionicPopup.alert({
                                        cssClass: 'popup-outer confirm-alert-view',
                                        title: 'Error',
                                        template: '<p style="padding: 15px 5px; color: red">' + response.error + '</p>'
                                    });                               
                                } else {
                                    if (response.isPrepaidAllowed) {
    
                                        $scope.orderID = response.orderid;
                                        //Payment options
                                        var options = {
                                            description: 'Payment for Online Order',
                                            order_id: response.reference,
                                            image: 'https://zaitoon.online/services/images/razor_icon.png',
                                            currency: 'INR',
                                            key: $scope.razorpayKey,
                                            amount: response.amount * 100,
                                            name: 'Zaitoon',
                                            prefill: {
                                                email: $rootScope.user.email,
                                                contact: $rootScope.user.mobile,
                                                name: $rootScope.user.name
                                            },
                                            notes: {
                                                "Zaitoon Order ID": response.orderid
                                            },
                                            theme: {
                                                color: '#e74c3c'
                                            }
                                        };

                                        //Step 2 - Make Payment
                                        RazorpayCheckout.on('payment.success', successCallback)
                                        RazorpayCheckout.on('payment.cancel', cancelCallback)
                                        RazorpayCheckout.open(options)
                                        
                                        called = true

                                    } else {
                                        $ionicLoading.show({
                                            template: '<b style="color: #e74c3c; font-size: 150%">Sorry!</b><br>Online payment is not available. Please opt for Cash on Delivery (COD)',
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
                } else { //Cash on Delivery
                    //Create Order
                    var data = {};
                    data.token = JSON.parse(window.localStorage.user).token;
                    data.address = !_.isUndefined(window.localStorage.zaitoonFirst_selected_address) ? JSON.parse(window.localStorage.zaitoonFirst_selected_address) : [];
                    data.comments = $scope.comments.value;
                    data.modeOfPayment = $scope.paychoice;
                    data.outlet = window.localStorage.outlet;
                    data.isTakeAway = $scope.checkoutMode == 'takeaway' ? true : false;

                    var all_extras_temp = parseFloat(this.getTax()) + parseFloat(this.getParcel());

                    var formattedcart = {};
                    formattedcart.cartTotal = Math.round(this.getSubtotal() * 100 / 100);
                    formattedcart.cartExtra = Math.round(all_extras_temp * 100 / 100);
                    formattedcart.cartDiscount = $scope.couponDiscount;
                    //formattedcart.rewardsDiscount = $scope.rewardCoins;
                    formattedcart.cartCoupon = couponService.getCoupon();
                    formattedcart.items = JSON.parse(window.localStorage.zaitoonFirst_cart);
                    data.cart = formattedcart;
                    data.platform = "IOS";
                    data.location = $scope.outletSelection['locationCode'];

                    $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/createordermob.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {
                            if (!response.status) {
                                var alertPopup = $ionicPopup.alert({
                                        cssClass: 'popup-outer confirm-alert-view',
                                        title: 'Error',
                                        template: '<p style="padding: 15px 5px; color: red">' + response.error + '</p>'
                                });
                            } else {
                                //Go to track page
                                trackOrderService.setOrderID(response.orderid);
                                window.localStorage.removeItem("zaitoonFirst_cart");
                                $state.go('main.app.checkout.track');
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

           // $rootScope.apply();

        //});


    })

    .controller('CheckoutAddressCtrl', function($scope, $state, $http, $rootScope, $ionicPopover, ProfileService, user_shipping_addresses, $ionicLoading, $ionicPopup, CheckoutService) {
        $ionicPopover.fromTemplateUrl('views/common/partials/address-chooser-popover.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.addresses_popover = popover;
        });

        $scope.cancel = function() {
            var previous_view = _.last($rootScope.previousView);
            $state.go(previous_view.fromState, previous_view.fromParams);
        };

        $scope.billing_same_as_shipping_address = true;
        $scope.user_shipping_addresses = user_shipping_addresses;
        $scope.data = {};
        $scope.data.selected_address = {};
        $scope.show_new_address_button = true;

        $scope.selectShippingAddress = function(address) {
            $scope.addresses_popover.hide();
        };

        $scope.saveSelectedAddress = function(address) {
            CheckoutService.saveUserSelectedAddress(address);
            $scope.cancel();
        };

        $scope.openAddressesPopover = function($event) {
            $scope.addresses_popover.show($event);
        };

        $scope.deleteShippingAddress = function(address) {
            //do something and then close popup
        };

        $scope.addShippingAddress = function(address) {
            //do something and then close popup
        };

        $scope.editShippingAddress = function(address) {
            //do something and then close popup
        };

        $scope.showNewAddressPopup = function() {
            $scope.address = {};
            $scope.address.name = "";
            $scope.address.flatNo = "";
            $scope.address.flatName = "";
            $scope.address.landmark = "";
            $scope.address.area = "";
            $scope.address.contact = "";

            $scope.addresses_popover.hide();

            var newAddressPopup = $ionicPopup.show({
                cssClass: 'popup-outer new-shipping-address-view',
                templateUrl: 'views/common/partials/new-shipping-address-popup.html',
                title: 'New Address',
                scope: $scope,
                buttons: [{
                        text: 'Close'
                    },
                    {
                        text: 'Add',
                        onTap: function(e) {

                            var data = {};
                            data.token = JSON.parse(window.localStorage.user).token;
                            data.address = $scope.address;

                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/newaddress.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout: 10000
                                })
                                .success(function(response) {
                                    if (response.status) {
                                        $scope.saveSelectedAddress($scope.address);
                                        $state.go('main.app.checkout');
                                    } else {
                                        $ionicLoading.show({
                                            template: '<b style="color: #e74c3c">Error!</b><br>Failed to add address. ' + response.error,
                                            duration: 2000
                                        });
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
                ]
            });
            newAddressPopup.then(function(res) {

            });
        };

        $scope.showEditAddressPopup = function(address) {
            $scope.address = address;

            $scope.addresses_popover.hide();
            var editAddressPopup = $ionicPopup.show({
                cssClass: 'popup-outer edit-shipping-address-view',
                templateUrl: 'views/common/partials/edit-shipping-address-popup.html',
                title: address.name,
                scope: $scope,
                buttons: [{
                        text: 'Close'
                    },
                    {
                        text: 'Delete',
                        // type: 'icon-left ion-trash-a delete-button',
                        type: 'delete-button',
                        onTap: function(e) {
                            var response = ProfileService.deleteSavedAddress(address.id);
                            if (response) {
                                //Successfully deleted. Hide from current list of addresses.
                                var i = 0;
                                while (i < $scope.user_shipping_addresses.length) {
                                    if (address.id == $scope.user_shipping_addresses[i].id) {
                                        $scope.user_shipping_addresses.splice(i, 1);
                                        $scope.addresses_popover.hide();

                                        $scope.data.selected_address = "";

                                        if ($scope.user_shipping_addresses.length == 0)
                                            $state.reload();

                                        //Set the default address
                                        var i = 0;
                                        while (i < $scope.user_shipping_addresses.length) {
                                            if ($scope.user_shipping_addresses[i].isDefault) {
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
                            var data = {};
                            data.token = JSON.parse(window.localStorage.user).token;
                            data.address = $scope.address;
                            data.id = $scope.address.id;

                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/editaddress.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout: 10000
                                })
                                .success(function(response) {
                                    if (response.status) {
                                        $scope.saveSelectedAddress($scope.address);
                                        $state.go('main.app.checkout');
                                    } else {
                                        $ionicLoading.show({
                                            template: '<b style="color: #e74c3c">Error!</b><br>Failed to add address. ' + response.data.error,
                                            duration: 2000
                                        });
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
                ]
            });
            editAddressPopup.then(function(res) {
                if (res) {} else {}
            });
        };
    })

;