angular.module('landing.controllers', [])

    .controller('welcomeCtrl', function($timeout, $cordovaGeolocation, locationChangeRouteTrackerService, userLocationService, menuService, outletService, outletWarningStatusService, $scope, $http, $rootScope, $state, $ionicPopover, $ionicPopup, $ionicLoading) {

        //If already logged in?
        if (!_.isUndefined(window.localStorage.user) && window.localStorage.user != "") {
            
            //Regenerate Token
            var data = {};
            data.token = JSON.parse(window.localStorage.user).token;
            $http({
                    method: 'POST',
                    url: 'https://www.zaitoon.online/services/regeneratetoken.php',
                    data: data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .success(function(response) {
                    if (response.status) {
                        $scope.isLoggedIn = true;
                        var temp_user = JSON.parse(window.localStorage.user);
                        $scope.loggedUser = temp_user.name;
                        temp_user.token = response.newtoken;
                        window.localStorage.user = JSON.stringify(temp_user);
                    } else {
                        window.localStorage.removeItem("user");
                        $scope.isLoggedIn = false;
                    }
                })
                .error(function(data) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: "Not responding. Check your connection.",
                        duration: 3000
                    });
                });
        } else {
            $scope.isLoggedIn = false;
        }

        //Network Status
        // if(ConnectivityMonitor.isOffline()){
        // 	$scope.isOfflineFlag = true;
        // }
        // else{
        // 	$scope.isOfflineFlag = false;
        // }


        $scope.logout = function() {
            menuService.resetAll();
            window.localStorage.clear();
            $state.go('intro.auth-login');
        };

        var outlet = !_.isUndefined(window.localStorage.outlet) ? window.localStorage.outlet : "";
        var locationCode = !_.isUndefined(window.localStorage.locationCode) ? window.localStorage.locationCode : "";

        $scope.changeLocationFlag = !_.isUndefined(window.localStorage.changeLocationFlag) ? window.localStorage.changeLocationFlag : "";

        if (outlet == "")
            $scope.isLocationSet = false;
        else
            $scope.isLocationSet = true;

        if (locationCode == "")
            $scope.isLocationSet = false;
        else
            $scope.isLocationSet = true;


        /* To tweak already set location */
        $scope.currentLocation = window.localStorage.location;
        $scope.location = {};
        //$scope.location.formatted_address = $scope.currentLocation;
        $scope.location.name = $scope.currentLocation;

        /* NEW GOOGLE PLACE BASED OUTLET SELECTION */
        $scope.setGoogleLocation = function() {
            var coords = userLocationService.getCoords();
            $rootScope.getGoogleOutletSuggestion(coords.lat, coords.lng);
        }

        /* Try to fetch geo location from device */
        $scope.getGooglePlaceName = function(lat, lng){

            //LOADING
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });


            var geocoder = new google.maps.Geocoder;
            var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};

            geocoder.geocode({'location': latlng}, function(results, status) {
            
              $ionicLoading.hide();

              if (status === 'OK') {
                if (results[0]) {
                    userLocationService.setCoords(lat, lng);
                    $scope.location.name = results[0].formatted_address;
                    $scope.location.place_id = results[0].place_id;                 
                    $scope.location.place_id = results[0].place_id;   
                    userLocationService.setText($scope.location.name);    

                } else {
                    $ionicLoading.show({
                        template: 'Error occured while fetching your location. Enter location manually.',
                        duration: 3000
                    });    
                }
              } else {
                    $ionicLoading.show({
                        template: 'Error occured while fetching your location. Enter location manually.',
                        duration: 3000
                    });    
              }
            });
        }


        $scope.presetIITMLocation = function(){
            userLocationService.setCoords('12.98534830000001', '80.23629019999998');
            userLocationService.setText('IIT Madras Campus');
            $scope.location.name = 'IIT Madras Campus';
            $scope.location.place_id = "ChIJ_THSv35dUjoR3fFu3LGVZ3I";
        }



        $scope.fetchGeoCoordinates = function(){
            
            //LOADING
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

              var posOptions = {timeout: 10000, enableHighAccuracy: false};
              $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                  $ionicLoading.hide();
                  $scope.getGooglePlaceName(position.coords.latitude, position.coords.longitude);
                }, function(err) {
                    $ionicLoading.hide();
                    $ionicLoading.show({
                        template: 'Error occured while fetching your location. Enter location manually.',
                        cssClass: 'popup-pin',                        
                        duration: 3000
                    });                    
                });
        }

        $scope.askToConfirm = function(response, tempUserLocation){
                            
                            //Warn Only Takeaway Possible.
                            var confirmPopup = $ionicPopup.confirm({
                                title: "Delivery Not Available",
                                template: '<p style="font-size: 14px">Selected area is beyond our delivery limits. You can place <tag style="color: #c52031; font-weight: bold;">only Take Away</tag> orders.</p>'
                            });

                            confirmPopup.then(function(res) {
                                 if(res) {
                                            //LOADING
                                            $ionicLoading.show({
                                                template: '<ion-spinner></ion-spinner>'
                                            }); 

                                            //Set outlet and location
                                            window.localStorage.outlet = response.data.response.outlet;
                                            window.localStorage.location = tempUserLocation;
                                            window.localStorage.locationCode = response.data.response.locationCode;

                                            var info = {};
                                            info.onlyTakeAway = !response.data.isServed;
                                            info.outlet = response.data.response.outlet;
                                            info.isSpecial = response.data.response.isSpecial;
                                            info.city = response.data.response.city;
                                            info.location = tempUserLocation;
                                            info.locationCode = response.data.response.locationCode;
                                            info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                                            info.isOpen = response.data.response.isOpen;
                                            info.paymentKey = response.data.response.razorpayID;
                                            info.isTaxCollected = response.data.response.isTaxCollected;
                                            info.taxPercentage = response.data.response.taxPercentage;
                                            info.isParcelCollected = response.data.response.isParcelCollected;
                                            info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                                            info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                                            info.minAmount = response.data.response.minAmount;
                                            info.minTime = response.data.response.minTime;

                                            info.isDelayed = response.data.response.isDelayed;
                                            info.delayMessage = response.data.response.delayMessage;
                                            info.closureMessage = response.data.response.closureMessage;

                                            outletService.setOutletInfo(info);
                                            outletWarningStatusService.reset();


                                            //Clear the changeLocationFlag if at all set.
                                            window.localStorage.changeLocationFlag = "";

                                            $ionicLoading.hide();

                                            //Go back to the home route page (if it was redirected to set location)
                                            var homeRoute = locationChangeRouteTrackerService.getSource();

                                            if(homeRoute != ''){
                                                locationChangeRouteTrackerService.reset();
                                                $state.go(homeRoute);
                                            }
                                            else{
                                                $scope.isLocationSet = true;
                                            }
                                 }
                              });       
        }




        $rootScope.getGoogleOutletSuggestion = function(lat, lng) {

            //LOADING
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

                $http({
                    method: "GET",
                    url: 'https://www.zaitoon.online/services/googleoutletassigner.php?lat='+lat+'&lng='+lng+'&version=15'
                }).then(function(response) {

                	$ionicLoading.hide();

                    if (response.data.status) {
                        //Serviced Areas
                        if (response.data.isServed) { 

                            //Set outlet and location
                            window.localStorage.outlet = response.data.response.outlet;
                            window.localStorage.location = userLocationService.getText();
                            window.localStorage.locationCode = response.data.response.locationCode;

                            var info = {};
                            info.onlyTakeAway = !response.data.isServed;
                            info.outlet = response.data.response.outlet;
                            info.isSpecial = response.data.response.isSpecial;
                            info.city = response.data.response.city;
                            info.location = userLocationService.getText();
                            info.locationCode = response.data.response.locationCode;
                            info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                            info.isOpen = response.data.response.isOpen;
                            info.paymentKey = response.data.response.razorpayID;
                            info.isTaxCollected = response.data.response.isTaxCollected;
                            info.taxPercentage = response.data.response.taxPercentage;
                            info.isParcelCollected = response.data.response.isParcelCollected;
                            info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                            info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                            info.minAmount = response.data.response.minAmount;
                            info.minTime = response.data.response.minTime;

                            info.isDelayed = response.data.response.isDelayed;
                            info.delayMessage = response.data.response.delayMessage;
                            info.closureMessage = response.data.response.closureMessage;


                            outletService.setOutletInfo(info);
                            outletWarningStatusService.reset();

                            menuService.resetAll();


                            //Clear the changeLocationFlag if at all set.
                            window.localStorage.changeLocationFlag = "";

                            //Go back to the home route page (if it was redirected to set location)
                            var homeRoute = locationChangeRouteTrackerService.getSource();

                            if(homeRoute != ''){
                            	locationChangeRouteTrackerService.reset();
                            	$state.go(homeRoute);
                            }
                            else{
                            	$scope.isLocationSet = true;
                            }

                       
                        }
                        //NOT SERVICED AREAS
                        else {
                            //Warn Only Takeaway Possible.
                            $scope.askToConfirm(response, userLocationService.getText());
                        }
                    } else {
                        $ionicLoading.show({
                            template: response.data.error,
                            duration: 1000
                        });
                    }
                });

        };

        //Reset Location on next iteration - to get latest outlet info based on locationCode (which is latitude_longitude)
        if (!_.isUndefined(window.localStorage.locationCode) && window.localStorage.locationCode != "") {
            
            var ex_coords = window.localStorage.locationCode;
            var saved_coords = ex_coords.split('_');

            //LOADING
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            $http.get('https://www.zaitoon.online/services/googleoutletassigner.php?lat='+saved_coords[0]+'&lng='+saved_coords[1]+'&version=15')
                .then(function(response) {
                    $ionicLoading.hide();

                    if (response.data.status) {

                        //Set outlet and location
                        window.localStorage.outlet = response.data.response.outlet;
                        window.localStorage.locationCode = response.data.response.locationCode;

                        var info = {};
                        info.onlyTakeAway = !response.data.isServed;
                        info.outlet = response.data.response.outlet;
                        info.isSpecial = response.data.response.isSpecial;
                        info.city = response.data.response.city;
                        info.location = window.localStorage.location;
                        info.locationCode = response.data.response.locationCode;
                        info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                        info.isOpen = response.data.response.isOpen;
                        info.paymentKey = response.data.response.razorpayID;
                        info.isTaxCollected = response.data.response.isTaxCollected;
                        info.taxPercentage = response.data.response.taxPercentage;
                        info.isParcelCollected = response.data.response.isParcelCollected;
                        info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                        info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                        info.minAmount = response.data.response.minAmount;
                        info.minTime = response.data.response.minTime;

                        info.isDelayed = response.data.response.isDelayed;
                        info.delayMessage = response.data.response.delayMessage;
                        info.closureMessage = response.data.response.closureMessage;

                        outletService.setOutletInfo(info);
                        outletWarningStatusService.reset();

                    } else {
                        $ionicLoading.show({
                            template: response.data.error,
                            duration: 2000
                        });
                    }
                });
        }


        $scope.cancelSettingLocation = function(){
             //Clear the changeLocationFlag if at all set.
            window.localStorage.changeLocationFlag = "";  
             //Go back to the home route page (if it was redirected to set location)
            var homeRoute = locationChangeRouteTrackerService.getSource();
             if(homeRoute != ''){
                locationChangeRouteTrackerService.reset();
                $state.go(homeRoute);
            }
            else{
                $scope.isLocationSet = true;
            }
        }


    /* OLD API BASED OUTLET SELECTION */

    /*

        //Avaialble Cities
        $scope.data = {};

        $scope.cities = [];

        $http({
            method: 'GET',
            url: 'https://www.zaitoon.online/services/fetchcities.php',
            timeout: 5000
        }).then(function successCallback(response) {
            $scope.cities = response.data.response;
        }, function errorCallback(response) {
            $ionicLoading.show({
                template: "Please check your connection.",
                duration: 3000
            });
        });


        $scope.reloadCityList = function() {
            $http({
                method: 'GET',
                url: 'https://www.zaitoon.online/services/fetchcities.php',
                timeout: 5000
            }).then(function successCallback(response) {
                $scope.cities = response.data.response;
            }, function errorCallback(response) {
                $ionicLoading.show({
                    template: "Please check your connection.",
                    duration: 3000
                });
            });

        }


        //Choose City
        $timeout(function() { //Time delay is added to give time gap for popup to load!!
            $ionicPopover.fromTemplateUrl('views/common/partials/outlet-chooser-popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.city_popover = popover;
            });
        }, 1000);

        $scope.openCityPopover = function($event) {
            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet.',
                    duration: 3000
                });
            } else {
                $scope.city_popover.show($event);
            }

        };

        $scope.isCitySet = false;
        $scope.setCity = function(city) {
            $scope.isCitySet = true;
            var temp = {
                name: city
            };
            $scope.data.selected_city = temp;

            //Set CITY in Outlet service
            var info = {};
            info.city = city;
            outletService.setOutletInfo(info);
            outletWarningStatusService.reset();

            this.updateLocations();

            $scope.city_popover.hide();
        };


        // Choose Location Search
        $scope.updateLocations = function() {
            $scope.search = {
                query: ''
            };

            var temp_outlet = outletService.getInfo();
            $http.get('https://www.zaitoon.online/services/popularareas.php?city=' + temp_outlet.city)
                .then(function(response) {
                    $scope.localities = response.data.response;
                });
        }

        //Suggestion function
        $scope.suggest = function() {
            var temp_outlet = outletService.getInfo();
            if ($scope.search.query.length > 1) {
                $http.get('https://www.zaitoon.online/services/searchareasmobile.php?city=' + temp_outlet.city + '&key=' + $scope.search.query)
                    .then(function(response) {
                        $scope.localities = response.data;
                    });
            }
        }




        //Choose Locality
        $timeout(function() { //Time delay is added to give time gap for popup to load
            $ionicPopover.fromTemplateUrl('views/common/partials/location-chooser-popover.html', {
                scope: $scope
            }).then(function(popover) {
                $scope.locality_popover = popover;
            });
        }, 1000);

        $scope.openLocalityPopover = function($event) {
            var temp_outlet = outletService.getInfo();
            if (temp_outlet.city != "") {
                $scope.locality_popover.show($event);
            } else { //City not set.
                $ionicLoading.show({
                    template: 'Please choose a City first',
                    duration: 3000
                });
            }

        };

        $rootScope.setLocality = function(popover, locationCode) {

            $scope.locality_popover.hide();
            popover.hide();

            //LOADING
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            $timeout(function() {

                $http({
                    method: "GET",
                    url: 'https://www.zaitoon.online/services/fetchoutlets.php?locationCode=' + locationCode
                }).then(function(response) {
                    if (response.data.status) {
                        console.log(response.data)
                        //Serviced Areas
                        if (response.data.isServed) {

                            //Set outlet and location
                            window.localStorage.outlet = response.data.response.outlet;
                            window.localStorage.location = response.data.response.location;
                            window.localStorage.locationCode = response.data.response.locationCode;

                            var info = {};
                            info.onlyTakeAway = !response.data.isServed;
                            info.outlet = response.data.response.outlet;
                            info.isSpecial = response.data.response.isSpecial;
                            info.city = response.data.response.city;
                            info.location = response.data.response.location;
                            info.locationCode = response.data.response.locationCode;
                            info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                            info.isOpen = response.data.response.isOpen;
                            info.paymentKey = response.data.response.razorpayID;
                            info.isTaxCollected = response.data.response.isTaxCollected;
                            info.taxPercentage = response.data.response.taxPercentage;
                            info.isParcelCollected = response.data.response.isParcelCollected;
                            info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                            info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                            info.minAmount = response.data.response.minAmount;
                            info.minTime = response.data.response.minTime;

                            info.isDelayed = response.data.response.isDelayed;
                            info.delayMessage = response.data.response.delayMessage;
                            info.closureMessage = response.data.response.closureMessage;



                            outletService.setOutletInfo(info);
                            outletWarningStatusService.reset();

                            menuService.resetAll();

                            var temp = {
                                name: response.data.response.location
                            };
                            $scope.data.selected_locality = temp;

                            //Clear the changeLocationFlag if at all set.
                            window.localStorage.changeLocationFlag = "";

                            //Go back to the checkout page (if it was redirected to set location)
                            $timeout(function() {
                                if (window.localStorage.backFlag) {
                                    if (window.localStorage.backFlagValue == 'MENU') {
                                        window.localStorage.removeItem("backFlagValue");
                                        window.localStorage.removeItem("backFlag");
                                        $state.go('main.app.feed.arabian');
                                    } else {
                                        window.localStorage.removeItem("backFlag");
                                        $state.go('main.app.checkout');
                                    }

                                } else if (window.localStorage.backFlagCart) {
                                    window.localStorage.removeItem("backFlagCart");
                                    $state.go('main.app.shopping-cart');
                                } else {
                                    $scope.isLocationSet = true;
                                }
                                $ionicLoading.hide();
                            }, 1000);
                        }
                        //NOT SERVICED AREAS
                        else {
                            //Warn Only Takeaway Possible.
                            $ionicPopup.show({
                                title: "Can not be delivered to selected area",
                                subTitle: 'You can place only Take Away orders',
                                cssClass: 'delivery-unavailable-popup',
                                scope: $scope,
                                buttons: [{
                                        text: 'Cancel',
                                        onTap: function(e) {
                                            return true;
                                        }
                                    },
                                    {
                                        text: '<b>OK</b>',
                                        type: 'button-balanced',
                                        onTap: function(e) {
                                            //Set outlet and location
                                            window.localStorage.outlet = response.data.response.outlet;
                                            window.localStorage.location = response.data.response.location;
                                            window.localStorage.locationCode = response.data.response.locationCode;

                                            var info = {};
                                            info.onlyTakeAway = !response.data.isServed;
                                            info.outlet = response.data.response.outlet;
                                            info.isSpecial = response.data.response.isSpecial;
                                            info.city = response.data.response.city;
                                            info.location = response.data.response.location;
                                            info.locationCode = response.data.response.locationCode;
                                            info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                                            info.isOpen = response.data.response.isOpen;
                                            info.paymentKey = response.data.response.razorpayID;
                                            info.isTaxCollected = response.data.response.isTaxCollected;
                                            info.taxPercentage = response.data.response.taxPercentage;
                                            info.isParcelCollected = response.data.response.isParcelCollected;
                                            info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                                            info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                                            info.minAmount = response.data.response.minAmount;
                                            info.minTime = response.data.response.minTime;

                                            info.isDelayed = response.data.response.isDelayed;
                                            info.delayMessage = response.data.response.delayMessage;
                                            info.closureMessage = response.data.response.closureMessage;

                                            outletService.setOutletInfo(info);
                                            outletWarningStatusService.reset();

                                            var temp = {
                                                name: response.data.response.location
                                            };
                                            $scope.data.selected_locality = temp;

                                            //Clear the changeLocationFlag if at all set.
                                            window.localStorage.changeLocationFlag = "";

                                            //LOADING
                                            $ionicLoading.show({
                                                template: '<ion-spinner></ion-spinner>'
                                            });


                                            //Go back to the checkout page (if it was redirected to set location)
                                            $timeout(function() {
                                                if (window.localStorage.backFlag) {
                                                    window.localStorage.removeItem("backFlag");
                                                    $state.go('main.app.checkout');
                                                } else if (window.localStorage.backFlagCart) {
                                                    window.localStorage.removeItem("backFlagCart");
                                                    $state.go('main.app.shopping-cart');
                                                } else {
                                                    $scope.isLocationSet = true;
                                                }
                                                $ionicLoading.hide();
                                            }, 1000);
                                        }
                                    },
                                ]
                            });
                        }
                    } else {
                        $ionicLoading.show({
                            template: response.data.error,
                            duration: 1000
                        });
                    }
                });

            }, 500);

        };



        //Reset Location on next iteration - to get latest outlet info.
        if (!_.isUndefined(window.localStorage.locationCode) && window.localStorage.locationCode != "") {
            //LOADING
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });

            $http.get('https://www.zaitoon.online/services/fetchoutlets.php?locationCode=' + window.localStorage.locationCode)
                .then(function(response) {
                    $ionicLoading.hide();

                    if (response.data.status) {
                        //Set outlet and location
                        window.localStorage.outlet = response.data.response.outlet;
                        window.localStorage.location = response.data.response.location;
                        window.localStorage.locationCode = response.data.response.locationCode;

                        var info = {};
                        info.onlyTakeAway = !response.data.isServed;
                        info.outlet = response.data.response.outlet;
                        info.isSpecial = response.data.response.isSpecial;
                        info.city = response.data.response.city;
                        info.location = response.data.response.location;
                        info.locationCode = response.data.response.locationCode;
                        info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                        info.isOpen = response.data.response.isOpen;
                        info.paymentKey = response.data.response.razorpayID;
                        info.isTaxCollected = response.data.response.isTaxCollected;
                        info.taxPercentage = response.data.response.taxPercentage;
                        info.isParcelCollected = response.data.response.isParcelCollected;
                        info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                        info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                        info.minAmount = response.data.response.minAmount;
                        info.minTime = response.data.response.minTime;

                        info.isDelayed = response.data.response.isDelayed;
                        info.delayMessage = response.data.response.delayMessage;
                        info.closureMessage = response.data.response.closureMessage;

                        outletService.setOutletInfo(info);
                        outletWarningStatusService.reset();
                    } else {
                        $ionicLoading.show({
                            template: response.data.error,
                            duration: 2000
                        });
                    }
                });
        }


    */

    })

;