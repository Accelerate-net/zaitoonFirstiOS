angular.module('menu.controllers', ['ionic', 'ionic.contrib.ui.hscrollcards'])


    .controller('FeedCtrl', function(outletService, menuService, locationChangeRouteTrackerService, $ionicLoading, $ionicModal, $scope, $http, $ionicPopup, $rootScope, $state, $ionicScrollDelegate, $ionicSideMenuDelegate, ShoppingCartService) {
    

        $scope.getProductsInCart = function() {
            return ShoppingCartService.getProducts().length;
        };

        if (!_.isUndefined(window.localStorage.user)) {
            $scope.isEnrolledFlag = JSON.parse(window.localStorage.user).isRewardEnabled;
        } else {
            $scope.isEnrolledFlag = false;
        }


        $scope.goToRewards = function() {
            if ($scope.isEnrolledFlag) {
                $state.go('main.app.rewards');
            } else {
                $state.go('main.app.rewardslanding');
            }
        }

        $scope.selectedOutlet = outletService.getInfo();


        $scope.navToggled = false;

        $scope.showOptionsMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
            $scope.navToggled = !$scope.navToggled;
        };

        /* Nav Options */
        //Change location
        $scope.changeLocation = function() {
            window.localStorage.changeLocationFlag = true;
            locationChangeRouteTrackerService.setSource('main.app.feed.arabian');
            $state.go('intro.walkthrough-welcome');
        }


        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        $scope.callSearch = function() {

                //Check if already cached
                var isCached = menuService.getIsLoadedFlag('SEARCH');
                if(isCached){
                            
                            $scope.searchMenuData = JSON.parse(window.localStorage.menuSearchCache);
                    
                            if ($scope.searchMenuData.length == 0) {
                                $scope.isEmpty = true;
                            } else {
                                $scope.isEmpty = false;
                            }

                            $rootScope.$broadcast('search_called', true);
                            $rootScope.$emit('search_called', true);
                }
                else{

                    $ionicLoading.show();

                    //Fetch Data for Search
                    $http({
                            method: 'GET',
                            url: 'https://www.zaitoon.online/services/fetchmenuallmob.php?outlet='+$myOutlet,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(response) {

                            $ionicLoading.hide();

                            $scope.searchMenuData = response;
                            if ($scope.searchMenuData.length == 0) {
                                $scope.isEmpty = true;
                            } else {
                                $scope.isEmpty = false;
                            }

                            $rootScope.$broadcast('search_called', true);
                            $rootScope.$emit('search_called', true);

                            window.localStorage.menuSearchCache = JSON.stringify($scope.searchMenuData);
                            menuService.setLoadFlag('SEARCH', true);

                        })
                        .error(function(data) {
                            $ionicLoading.hide();
                            $ionicLoading.show({
                                template: "Not responding. Check your connection.",
                                duration: 3000
                            });                            
                        });
                }
        }

        //Book a Table
        $scope.showOutlets = function() {

            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet',
                    duration: 2000
                });
            } else {
                //Get all the outlets
                
                //FIRST LOAD
                $scope.renderFailed = false;
                $scope.isRenderLoaded = false;


                    $http({
                        method: 'GET',
                        url: 'https://www.zaitoon.online/services/fetchoutlets.php',
                        timeout: 10000
                    })
                    .success(function(data) {

                        $scope.allList = data.response;

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderFailed = true;
                    });

                outletsPopup = $ionicPopup.show({
                    cssClass: 'popup-outer edit-shipping-address-view',
                    templateUrl: 'views/common/partials/shortcut-to-outlets-popup.html',
                    scope: angular.extend($scope, {}),
                    title: 'Where do you want to reserve a table?',
                    buttons: [{
                        text: 'Cancel'
                    }]
                });


                //Goto Outlet's page
                $scope.gotoOutlet = function() {
                    outletsPopup.close();
                }
            }
        }

        //Customer Support
        $ionicModal.fromTemplateUrl('views/help/help.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.help_modal = modal;
        });

        $scope.showHelp = function() {
            $scope.help_modal.show();
        };

        $scope.queryType = 'GENERAL';

        $scope.myquery = {};
        $scope.myquery.reference = "";
        $scope.myquery.comment = "";

        //if not logged in
        if (_.isUndefined(window.localStorage.user) && window.localStorage.user != "") {
            $scope.myquery.name = "";
            $scope.myquery.email = "";
            $scope.myquery.mobile = "";
        } else {
            $scope.customer = JSON.parse(window.localStorage.user);
            $scope.myquery.name = $scope.customer.name;
            $scope.myquery.email = $scope.customer.email;
            $scope.myquery.mobile = $scope.customer.mobile;
        }

        $scope.setType = function(value) {
            $scope.queryType = value;
            if (value == 'REFUND') {
                $scope.myquery.comment = 'The order I tried to place on DD-MM-YYYY, at around HH:MM AM/PM was failed. An amount of Rs. XXX was deducted from my account, but the order was not placed. Please initiate refund for the debited amount. I have mentioned the Razorpay Payment ID for your reference.';
            } else {
                $scope.myquery.comment = '';
            }
        }

        $scope.submitError = '';
        $scope.submitQuery = function() {
            $scope.submitError = '';
            //Validations
            if (!(/^[a-zA-Z\s]*$/.test($scope.myquery.name))) {
                $scope.submitError = "Names can contain only letters";
            } else if (!(/^\d{10}$/).test($scope.myquery.mobile)) {
                $scope.submitError = "Mobile Number has to be 10 digit number";
            } else if (($scope.myquery.comment).length < 10) {
                $scope.submitError = "Please elaborate your query";
            } else if (($scope.myquery.comment).length > 500) {
                $scope.submitError = "Comments can not contain more than 500 characters";
            } else if ($scope.myquery.comment == 'The order I tried to place on DD-MM-YYYY, at around HH:MM AM/PM was failed. An amount of Rs. XXX was deducted from my account, but the order was not placed. Please initiate refund for the debited amount. I have mentioned the Razorpay Payment ID for your reference.' && $scope.queryType == 'REFUND') {
                $scope.submitError = "Please edit the date and time of placing the order, order amount etc. in comments";
            } else if ($scope.queryType == 'REFUND' && ($scope.myquery.reference).length < 1) {
                $scope.submitError = "Add 'Payment Reference ID' from Razorpay";
            } else {
                $scope.submitError = '';

                $scope.myquery.type = $scope.queryType;
                $scope.myquery.token = JSON.parse(window.localStorage.user).token;
                $scope.myquery.source = 'MOB';

                //LOADING
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });

                $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/submitquery.php',
                        data: $scope.myquery,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {
                        $ionicLoading.hide();
                        if (response.status) {
                            $ionicLoading.show({
                                template: 'We have received your message. You will be contacted soon!',
                                duration: 3000
                            });
                            $scope.myquery.comments = "";
                            $scope.myquery.reference = "";
                            $scope.help_modal.hide();
                        } else {
                            $ionicLoading.show({
                                template: response.error,
                                duration: 3000
                            });
                        }
                    })
                    .error(function(data) {
                        $ionicLoading.hide();
                        $ionicLoading.show({
                            template: "Order was not placed due to network error.",
                            duration: 3000
                        });
                    });

            }
        }



    })


    .controller('featureCtrl', function($scope, outletService, $http, $ionicLoading, ShoppingCartService, $ionicPopup, menuService) {


        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        $scope.addFeature = function(item) {

            if (!item.isAvailable) {
                $ionicLoading.show({
                    template: item.itemName + " is not currently available.",
                    duration: 2000
                });
            } else {
                if (item.isCustom) {

                    //Render Template
                    var i = 0;
                    $scope.choiceName = "";
                    $scope.choicePrice = "";
                    var choiceTemplate = '<div style="margin-top: 10px">';
                    while (i < item.custom.length) {
                        choiceTemplate = choiceTemplate + '<button class="button button-full" style="text-align: left; color: #c52031; margin-bottom: 8px;" ng-click="addCustomItem(\'' + item.custom[i].customName + '\', ' + item.custom[i].customPrice + ')">' + item.custom[i].customName + ' <tag style="font-size: 80%; color: #8c8f93; float: right"><i class="fa fa-inr"></i> ' + item.custom[i].customPrice + '</tag></button>';
                        i++;
                    }
                    choiceTemplate = choiceTemplate + '</div>';

                    var newCustomPopup = $ionicPopup.show({
                        cssClass: 'popup-outer new-shipping-address-view',
                        template: choiceTemplate,
                        title: 'Your choice of ' + item.itemName,
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel'
                        }]
                    });
                    $scope.addCustomItem = function(variant, price) {
                        $scope.choiceName = variant;
                        $scope.choicePrice = price;

                        if ($scope.choiceName != "" && $scope.choicePrice != "") {
                            item.itemPrice = $scope.choicePrice;
                            item.variant = $scope.choiceName;

                            //adding to cart
                            // $ionicLoading.show({
                            //     template: '<tag style="color: #f1c40f">' + item.itemName + '</tag> is added.',
                            //     duration: 1000
                            // });

                            item.qty = 1;
                            ShoppingCartService.addProduct(item);

                            newCustomPopup.close();
                        }

                    }

                } else {
                    var confirmPopup = $ionicPopup.confirm({
                        cssClass: 'popup-outer confirm-alert-view',
                        title: 'Do you want to add ' + item.itemName + ' to cart?'
                    });

                    confirmPopup.then(function(res) {
                        if (res) {
                            // $ionicLoading.show({
                            //     template: '<tag style="color: #f1c40f">' + item.itemName + '</tag> is added.',
                            //     duration: 1000
                            // });

                            item.qty = 1;
                            ShoppingCartService.addProduct(item);
                        }
                    });
                }
            }

        }

        var temp_cusine = menuService.getDisplayMenuType();

        function renderFeatureMenu(){

            var data = {};
            data.cuisine = temp_cusine;
            data.outlet = $myOutlet;
            
            $http({
                    method: 'POST',
                    url: 'https://www.zaitoon.online/services/featuremenu.php',
                    data: data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                })
                .success(function(response) {
                    $scope.items = response;
                })
                .error(function(data) {
                    $ionicLoading.show({
                        template: "Not responding. Check your connection.",
                        duration: 3000
                    });
                });
        }

        renderFeatureMenu();
    })



    .controller('FoodArabianCtrl', function($state, outletWarningStatusService, menuService, outletService, ConnectivityMonitor, reviewOrderService, $scope, $location, $rootScope, $http, ShoppingCartService, $ionicLoading, $ionicPopup, $timeout) {

        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }

        //To keep track which cuisine is rentered
        menuService.setDisplayMenuType("ARABIAN");

        //Swipe left/right
        $scope.goRight = function() {}
        $scope.goLeft = function() {
            $state.go('main.app.feed.chinese');
            $scope.$emit("item-selected", this);
            $scope.$broadcast("item-selected", this);
        }


        //Check if already cached
        var isCached = menuService.getIsLoadedFlag('ARABIAN');

        if(isCached){
            $scope.renderFailed = false;
            $scope.isRenderLoaded = true;
        }

        /* DO NOT REMOVE OR DELETE THIS PART
            //Check if location code is set in localStorage and update it
            if(!_.isUndefined(window.localStorage.locationCode)){
                $http.get('https://www.zaitoon.online/services/fetchoutlets.php?locationCode='+window.localStorage.locationCode)
                .then(function(response){

                    //Set outlet and location
                    window.localStorage.outlet = response.data.response.outlet;
                    window.localStorage.location = response.data.response.location;
                    window.localStorage.locationCode = response.data.response.locationCode;

                    var info = {};
                    info.onlyTakeAway = false;
                    info.outlet = response.data.response.outlet;
                    info.isSpecial = response.data.response.isSpecial;
                    info.city = response.data.response.city;
                    info.location = response.data.response.location;
                    info.locationCode = response.data.response.locationCode;
                    info.isAcceptingOnlinePayment = response.data.response.isAcceptingOnlinePayment;
                    info.paymentKey = response.data.response.razorpayID;
                    info.isTaxCollected = response.data.response.isTaxCollected;
                    info.taxPercentage = response.data.response.taxPercentage;
                    info.isParcelCollected = response.data.response.isParcelCollected;
                    info.parcelPercentageDelivery = response.data.response.parcelPercentageDelivery;
                    info.parcelPercentagePickup = response.data.response.parcelPercentagePickup;
                    info.minAmount = response.data.response.minAmount;
                    info.minTime = response.data.response.minTime;
                    outletService.setOutletInfo(info);
                });
            }

        */


        //Check if feedback is submited for latest completed order
        if (!_.isUndefined(window.localStorage.user)) {
            var mydata = {};
            mydata.token = JSON.parse(window.localStorage.user).token;

            $http({
                    method: 'POST',
                    url: 'https://www.zaitoon.online/services/getlatestorderid.php',
                    data: mydata,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function(response) {
                    if (response.data.status) {

                        var temp_cart = response.data.cart.items;
                        var mylist = "";
                        temp_cart.forEach(function(item) {
                            if (mylist == "") {
                                mylist = item.itemName;
                            } else {
                                mylist = mylist + ", " + item.itemName;
                            }
                        })

                        mylist = "Order #" + response.data.response + " (" + mylist + ") on " + response.data.date;
                       

                        reviewOrderService.setLatest(response.data.response, mylist);
                        $state.go('main.app.checkout.feedback');
                    }
                });
        }


        var custom_filter = !_.isUndefined(window.localStorage.customFilter) ? window.localStorage.customFilter : [];

        //To display things if filter is applied
        if (custom_filter.length > 0)
            $scope.isFilter = true;
        else
            $scope.isFilter = false;


        //Receiving Broadcast - If Filter Applied
        $rootScope.$on('filter_applied', function(event, filter) {
            window.localStorage.customFilter = JSON.stringify(filter);
            $scope.reinitializeMenu();
        });

        $scope.clearFilter = function() {
            $scope.isFilter = false;
            window.localStorage.removeItem("customFilter");
            custom_filter = [];
            $scope.reinitializeMenu();
        }

        $scope.showNotAvailable = function(product) {
            $ionicLoading.show({
                template: '<b style="color: #e74c3c; font-size: 140%">Oops!</b><br>' + product.itemName + ' is not available.',
                duration: 1000
            });
        }

        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        /* Outlet CLOSED Status */
        $scope.isOutletClosedNow = !$scope.outletSelection.isOpen;
        $scope.outletClosureText = $scope.outletSelection.closureMessage;

        //to remember the warning flag
        $scope.outletClosureWarning = outletWarningStatusService.getStatus();
        $scope.clearClosureWarning = function() {
            $scope.outletClosureWarning = false;
            outletWarningStatusService.clearWarning();
        }


        /* Delivery DELAYED Status */
        $scope.isDeliveryDelayedNow = $scope.outletSelection.isDelayed;
        $scope.deliveryDelayedText = $scope.outletSelection.delayMessage;

        //to remember the warning flag
        $scope.outletDelayWarning = outletWarningStatusService.getDelayStatus();
        $scope.clearDelayClosureWarning = function() {
            $scope.outletDelayWarning = false;
            outletWarningStatusService.clearDelayWarning();
        }

        $scope.trimText = function(text) {
            if (text.length > 80) {
                return text.substring(0, 80) + " ...";
            } else {
                return text;
            }

        }

        $scope.showText = function(text) {
            var alertPopup = $ionicPopup.alert({
                cssClass: 'popup-outer confirm-alert-view',
                title: 'Warning',
                template: '<p style="padding: 15px 5px; color: #444">' + text + '</p>'
            });
        }

        // Making request to server to fetch-menu
        var init = $scope.reinitializeMenu = function() {
            var data = {};
            data.cuisine = "ARABIAN";
            data.isFilter = false;
            data.outlet = $myOutlet;

            if (custom_filter.length > 0) {
                data.isFilter = true;
                data.filter = custom_filter;
            }

            if (ConnectivityMonitor.isOffline()) {
                $ionicLoading.hide();
            }

            if (data.isFilter || !isCached) {

                  //FIRST LOAD
                  $scope.renderFailed = false;
                  $scope.isRenderLoaded = false;

                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/fetchmenu.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {

                        $scope.menu = response;
                        if ($scope.menu.length == 0) {
                            $scope.isEmpty = true;
                        } else {
                            $scope.isEmpty = false;
                        }

                        //Caching Part
                        if (!data.isFilter) {
                            //add to Cache if it's not filter applied Search
                            window.localStorage.arabianCache = JSON.stringify($scope.menu);
                            menuService.setLoadFlag('ARABIAN', true);

                            renderAllOtherMenu();
                        }

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderFailed = true;
                    });
            } else {
                //Don't call http. Load from cache only.
                $scope.menu = JSON.parse(window.localStorage.arabianCache);
            }
        }


        //Render other Menu once
        function renderAllOtherMenu(){
            
            var data = {};
            data.outlet = $myOutlet;

                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/fetchmenuallcuisines.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {
                        $ionicLoading.hide();

                        var allmenu = response;

                        var n = 0;
                        while(allmenu[n]){

                                if(allmenu[n].mainType == "CHINESE"){
                                    var temp_menu = [allmenu[n]];
                                    window.localStorage.chineseCache = JSON.stringify(temp_menu);
                                    menuService.setLoadFlag('CHINESE', true);
                                }
                                else if(allmenu[n].mainType == "INDIAN"){
                                    var temp_menu_two = [allmenu[n]]
                                    window.localStorage.indianCache = JSON.stringify(temp_menu_two);
                                    menuService.setLoadFlag('INDIAN', true);
                                }
                                else if(allmenu[n].mainType == "DESSERTS"){
                                    var temp_menu_three = [allmenu[n]]
                                    window.localStorage.dessertCache = JSON.stringify(temp_menu_three);
                                    menuService.setLoadFlag('DESSERT', true);
                                }

                            n++;
                        }
                    })
                    .error(function(data) {
                    });            
        }



        if(isCached) {
            init();
        } else {
            $timeout(function() {
                init();
            }, 799);
        }


        //For Search field
        $scope.search = {
            query: ''
        };
        $scope.showSearch = false;


        $scope.resetSearch = function() {
            $scope.search = {
                query: ''
            };
            $scope.showSearch = !$scope.showSearch;
        }

        $scope.$on('search_called', function(event, search_called) {
            $scope.showSearch = !$scope.showSearch;
        });


        $scope.customOptions = function(product) {

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

                    $scope.addToCart(product, 'DO_NOT_ANIMATE');
                    newCustomPopup.close();
                }

            }

        }



        $scope.addToCart = function(product, optionalFlag) {
            // $ionicLoading.show({
            //     template: '<tag style="color: #f1c40f">' + product.itemName + '</tag> is added.',
            //     duration: 1000
            // });

            product.qty = 1;
            ShoppingCartService.addProduct(product);
        
            console.log(optionalFlag)
            //Animate
            if(optionalFlag && optionalFlag == 'DO_NOT_ANIMATE'){

            }
            else if(optionalFlag && optionalFlag == 'SEARCH'){
                var id = "search_dish_"+product.itemCode;
                console.log(id)
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);   
            }
            else{
                var id = "dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);    
            }  

        };


    })

    .controller('FoodChineseCtrl', function(outletWarningStatusService, $state, menuService, outletService, ConnectivityMonitor, $scope, $rootScope, $http, ShoppingCartService, $ionicLoading, $ionicPopup, $timeout) {


        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }

        //To keep track which cuisine is rentered
        menuService.setDisplayMenuType("CHINESE");

        //Swipe left/right
        $scope.goRight = function() {
            $state.go('main.app.feed.arabian');
        }
        $scope.goLeft = function() {
            $state.go('main.app.feed.indian');
        }

        //Check if already cached
        var isCached = menuService.getIsLoadedFlag('CHINESE');
        
        if(isCached){
            $scope.renderFailed = false;
            $scope.isRenderLoaded = true;
        }

        var custom_filter = !_.isUndefined(window.localStorage.customFilter) ? window.localStorage.customFilter : [];

        //To display things if filter is applied
        if (custom_filter.length > 0)
            $scope.isFilter = true;
        else
            $scope.isFilter = false;


        //Receiving Broadcast - If Filter Applied
        $rootScope.$on('filter_applied', function(event, filter) {
            window.localStorage.customFilter = JSON.stringify(filter);
            $scope.reinitializeMenu();
        });

        $scope.clearFilter = function() {
            $scope.isFilter = false;
            window.localStorage.customFilter = "";
            custom_filter = [];
            $scope.reinitializeMenu();
        }


        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        /* Outlet CLOSED Status */
        $scope.isOutletClosedNow = !$scope.outletSelection.isOpen;
        $scope.outletClosureText = $scope.outletSelection.closureMessage;

        //to remember the warning flag
        $scope.outletClosureWarning = outletWarningStatusService.getStatus();
        $scope.clearClosureWarning = function() {
            $scope.outletClosureWarning = false;
            outletWarningStatusService.clearWarning();
        }


        /* Delivery DELAYED Status */
        $scope.isDeliveryDelayedNow = $scope.outletSelection.isDelayed;
        $scope.deliveryDelayedText = $scope.outletSelection.delayMessage;

        //to remember the warning flag
        $scope.outletDelayWarning = outletWarningStatusService.getDelayStatus();
        $scope.clearDelayClosureWarning = function() {
            $scope.outletDelayWarning = false;
            outletWarningStatusService.clearDelayWarning();
        }

        $scope.trimText = function(text) {
            if (text.length > 80) {
                return text.substring(0, 80) + " ...";
            } else {
                return text;
            }

        }

        $scope.showText = function(text) {
            var alertPopup = $ionicPopup.alert({
                cssClass: 'popup-outer confirm-alert-view',
                title: 'Warning',
                template: '<p style="padding: 15px 5px; color: #444">' + text + '</p>'
            });
        }

        // Making request to server to fetch-menu
        var init = $scope.reinitializeMenu = function() {
            var data = {};
            data.cuisine = "CHINESE";
            data.isFilter = false;
            data.outlet = $myOutlet;

            if (custom_filter.length > 0) {
                data.isFilter = true;
                data.filter = custom_filter;
            }

            if (ConnectivityMonitor.isOffline()) {
                $ionicLoading.hide();
            }

            if (data.isFilter || !isCached) {

                  //FIRST LOAD
                  $scope.renderFailed = false;
                  $scope.isRenderLoaded = false;

                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/fetchmenu.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {

                        $scope.menu = response;
                        if ($scope.menu.length == 0) {
                            $scope.isEmpty = true;
                        } else {
                            $scope.isEmpty = false;
                        }
                        //Caching Part
                        if (!data.isFilter) {
                            //add to Cache if it's not filter applied Search
                            window.localStorage.chineseCache = JSON.stringify($scope.menu);
                            menuService.setLoadFlag('CHINESE', true);
                        }

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {
                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderFailed = true;
                    });
            } else {
                //Don't call http. Load from cache only.
                $scope.menu = JSON.parse(window.localStorage.chineseCache);
            }
        }

        if (isCached) {
            init();
        } else {
            $timeout(function() {
                init();
            }, 799);
        }


        //For Search field
        $scope.search = {
            query: ''
        };
        $scope.showSearch = false;


        $scope.resetSearch = function() {
            $scope.search = {
                query: ''
            };
            $scope.showSearch = !$scope.showSearch;
        }

        $scope.$on('search_called', function(event, search_called) {
            $scope.showSearch = !$scope.showSearch;
        });



        $scope.customOptions = function(product) {

            //Render Template
            var i = 0;
            $scope.choiceName = "";
            $scope.choicePrice = "";
            var choiceTemplate = '<div class="padding">';
            while (i < product.custom.length) {
                choiceTemplate = choiceTemplate + '<ion-radio ng-click="addCustomItem(\'' + product.custom[i].customName + '\', ' + product.custom[i].customPrice + ')">' + product.custom[i].customName + ' <tag style="font-size: 80%; color: #d35400">Rs. ' + product.custom[i].customPrice + '</tag></ion-radio>';
                i++;
            }
            choiceTemplate = choiceTemplate + '</div>';

            var newCustomPopup = $ionicPopup.show({
                cssClass: 'popup-outer new-shipping-address-view',
                template: choiceTemplate,
                title: 'Choose Options',
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

                    $scope.addToCart(product, 'DO_NOT_ANIMATE');
                    newCustomPopup.close();
                }

            }

        }



        $scope.addToCart = function(product, optionalFlag) {
            // $ionicLoading.show({
            //     template: '<tag style="color: #f1c40f">' + product.itemName + '</tag> is added.',
            //     duration: 1000
            // });

            product.qty = 1;
            ShoppingCartService.addProduct(product);

            //Animate
            if(optionalFlag && optionalFlag == 'DO_NOT_ANIMATE'){

            }
            else if(optionalFlag && optionalFlag == 'SEARCH'){
                var id = "search_dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);   
            }
            else{
                var id = "dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);    
            }  

        };


    })


    .controller('FoodIndianCtrl', function(outletWarningStatusService, $state, menuService, outletService, ConnectivityMonitor, $scope, $rootScope, $http, ShoppingCartService, $ionicLoading, $ionicPopup, $timeout) {

        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }

        //To keep track which cuisine is rentered
        menuService.setDisplayMenuType("INDIAN");


        //Swipe left/right
        $scope.goRight = function() {
            $state.go('main.app.feed.chinese');
        }
        $scope.goLeft = function() {
            $state.go('main.app.feed.dessert');
        }



        //Check if already cached
        var isCached = menuService.getIsLoadedFlag('INDIAN');

        if(isCached){
            $scope.renderFailed = false;
            $scope.isRenderLoaded = true;
        }


        var custom_filter = !_.isUndefined(window.localStorage.customFilter) ? window.localStorage.customFilter : [];

        //To display things if filter is applied
        if (custom_filter.length > 0)
            $scope.isFilter = true;
        else
            $scope.isFilter = false;


        //Receiving Broadcast - If Filter Applied
        $rootScope.$on('filter_applied', function(event, filter) {
            window.localStorage.customFilter = JSON.stringify(filter);
            $scope.reinitializeMenu();
        });

        $scope.clearFilter = function() {
            $scope.isFilter = false;
            window.localStorage.removeItem("customFilter");
            custom_filter = [];
            $scope.reinitializeMenu();
        }


        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }

        /* Outlet CLOSED Status */
        $scope.isOutletClosedNow = !$scope.outletSelection.isOpen;
        $scope.outletClosureText = $scope.outletSelection.closureMessage;

        //to remember the warning flag
        $scope.outletClosureWarning = outletWarningStatusService.getStatus();
        $scope.clearClosureWarning = function() {
            $scope.outletClosureWarning = false;
            outletWarningStatusService.clearWarning();
        }


        /* Delivery DELAYED Status */
        $scope.isDeliveryDelayedNow = $scope.outletSelection.isDelayed;
        $scope.deliveryDelayedText = $scope.outletSelection.delayMessage;

        //to remember the warning flag
        $scope.outletDelayWarning = outletWarningStatusService.getDelayStatus();
        $scope.clearDelayClosureWarning = function() {
            $scope.outletDelayWarning = false;
            outletWarningStatusService.clearDelayWarning();
        }

        $scope.trimText = function(text) {
            if (text.length > 80) {
                return text.substring(0, 80) + " ...";
            } else {
                return text;
            }

        }


        $scope.showText = function(text) {
            var alertPopup = $ionicPopup.alert({
                cssClass: 'popup-outer confirm-alert-view',
                title: 'Warning',
                template: '<p style="padding: 15px 5px; color: #444">' + text + '</p>'
            });
        }


        // Making request to server to fetch-menu
        var init = $scope.reinitializeMenu = function() {
            var data = {};
            data.cuisine = "INDIAN";
            data.isFilter = false;
            data.outlet = $myOutlet;

            if (custom_filter.length > 0) {
                data.isFilter = true;
                data.filter = custom_filter;
            }

            if (ConnectivityMonitor.isOffline()) {
                $ionicLoading.hide();
            }

            if (data.isFilter || !isCached) {

                  //FIRST LOAD
                  $scope.renderFailed = false;
                  $scope.isRenderLoaded = false;

                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/fetchmenu.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {

                        $scope.menu = response;
                        if ($scope.menu.length == 0) {
                            $scope.isEmpty = true;
                        } else {
                            $scope.isEmpty = false;
                        }
                        //Caching Part
                        if (!data.isFilter) {
                            //add to Cache if it's not filter applied Search
                            window.localStorage.indianCache = JSON.stringify($scope.menu);
                            menuService.setLoadFlag('INDIAN', true);
                        }

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderFailed = true;
                    });
            } else {
                //Don't call http. Load from cache only.
                $scope.menu = JSON.parse(window.localStorage.indianCache);
                $ionicLoading.hide();
            }
        }

        if (isCached) {
            init();
        } else {
            $timeout(function() {
                init();
            }, 799);
        }




        //For Search field
        $scope.search = {
            query: ''
        };
        $scope.showSearch = false;


        $scope.resetSearch = function() {
            $scope.search = {
                query: ''
            };
            $scope.showSearch = !$scope.showSearch;
        }

        $scope.$on('search_called', function(event, search_called) {
            $scope.showSearch = !$scope.showSearch;
        });



        $scope.customOptions = function(product) {

            //Render Template
            var i = 0;
            $scope.choiceName = "";
            $scope.choicePrice = "";
            var choiceTemplate = '<div class="padding">';
            while (i < product.custom.length) {
                choiceTemplate = choiceTemplate + '<ion-radio ng-click="addCustomItem(\'' + product.custom[i].customName + '\', ' + product.custom[i].customPrice + ')">' + product.custom[i].customName + ' <tag style="font-size: 80%; color: #d35400">Rs. ' + product.custom[i].customPrice + '</tag></ion-radio>';
                i++;
            }
            choiceTemplate = choiceTemplate + '</div>';

            var newCustomPopup = $ionicPopup.show({
                cssClass: 'popup-outer new-shipping-address-view',
                template: choiceTemplate,
                title: 'Choose Options',
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

                    $scope.addToCart(product, 'DO_NOT_ANIMATE');
                    newCustomPopup.close();
                }

            }

        }



        $scope.addToCart = function(product, optionalFlag) {
            // $ionicLoading.show({
            //     template: '<tag style="color: #f1c40f">' + product.itemName + '</tag> is added.',
            //     duration: 1000
            // });

            product.qty = 1;
            ShoppingCartService.addProduct(product);


            //Animate
            if(optionalFlag && optionalFlag == 'DO_NOT_ANIMATE'){

            }
            else if(optionalFlag && optionalFlag == 'SEARCH'){
                var id = "search_dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);   
            }
            else{
                var id = "dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);    
            }  
        };


    })

    .controller('FoodDessertCtrl', function($state, outletWarningStatusService, menuService, outletService, ConnectivityMonitor, $scope, $rootScope, $http, ShoppingCartService, $ionicLoading, $ionicPopup, $timeout) {


        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }

        //To keep track which cuisine is rentered
        menuService.setDisplayMenuType("DESSERT");

        //Swipe left/right
        $scope.goRight = function() {
            $state.go('main.app.feed.indian');
        }
        $scope.goLeft = function() {}


        //Check if already cached
        var isCached = menuService.getIsLoadedFlag('DESSERT');

        if(isCached){
            $scope.renderFailed = false;
            $scope.isRenderLoaded = true;
        }


        var custom_filter = !_.isUndefined(window.localStorage.customFilter) ? window.localStorage.customFilter : [];

        //To display things if filter is applied
        if (custom_filter.length > 0)
            $scope.isFilter = true;
        else
            $scope.isFilter = false;


        //Receiving Broadcast - If Filter Applied
        $rootScope.$on('filter_applied', function(event, filter) {
            window.localStorage.customFilter = JSON.stringify(filter);
            $scope.reinitializeMenu();
        });

        $scope.clearFilter = function() {
            $scope.isFilter = false;
            window.localStorage.customFilter = "";
            custom_filter = [];
            $scope.reinitializeMenu();
        }

        $scope.outletSelection = outletService.getInfo();
        if ($scope.outletSelection.outlet == "") {
            $myOutlet = "VELACHERY";
        } else {
            $myOutlet = $scope.outletSelection.outlet;
        }
        /* Outlet CLOSED Status */
        $scope.isOutletClosedNow = !$scope.outletSelection.isOpen;
        $scope.outletClosureText = $scope.outletSelection.closureMessage;

        //to remember the warning flag
        $scope.outletClosureWarning = outletWarningStatusService.getStatus();
        $scope.clearClosureWarning = function() {
            $scope.outletClosureWarning = false;
            outletWarningStatusService.clearWarning();
        }


        /* Delivery DELAYED Status */
        $scope.isDeliveryDelayedNow = $scope.outletSelection.isDelayed;
        $scope.deliveryDelayedText = $scope.outletSelection.delayMessage;

        //to remember the warning flag
        $scope.outletDelayWarning = outletWarningStatusService.getDelayStatus();
        $scope.clearDelayClosureWarning = function() {
            $scope.outletDelayWarning = false;
            outletWarningStatusService.clearDelayWarning();
        }

        $scope.trimText = function(text) {
            if (text.length > 80) {
                return text.substring(0, 80) + " ...";
            } else {
                return text;
            }

        }

        $scope.showText = function(text) {
            var alertPopup = $ionicPopup.alert({
                cssClass: 'popup-outer confirm-alert-view',
                title: 'Warning',
                template: '<p style="padding: 15px 5px; color: #444">' + text + '</p>'
            });
        }


        // Making request to server to fetch-menu
        var init = $scope.reinitializeMenu = function() {
            var data = {};
            data.cuisine = "DESSERTS";
            data.isFilter = false;
            data.outlet = $myOutlet;

            if (custom_filter.length > 0) {
                data.isFilter = true;
                data.filter = custom_filter;
            }

            if (ConnectivityMonitor.isOffline()) {
                $ionicLoading.hide();
            }

            if (data.isFilter || !isCached) {
                  
                  //FIRST LOAD
                  $scope.renderFailed = false;
                  $scope.isRenderLoaded = false;

                    $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/fetchmenu.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {

                        $scope.menu = response;
                        if ($scope.menu.length == 0) {
                            $scope.isEmpty = true;
                        } else {
                            $scope.isEmpty = false;
                        }
                        //Caching Part
                        if (!data.isFilter) {
                            //add to Cache if it's not filter applied Search
                            window.localStorage.dessertCache = JSON.stringify($scope.menu);
                            menuService.setLoadFlag('DESSERT', true);
                        }

                        $scope.renderFailed = false;
                        $scope.isRenderLoaded = true;
                    })
                    .error(function(data) {

                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });

                        $scope.renderFailed = true;
                    });
            } else {
                //Don't call http. Load from cache only.
                $scope.menu = JSON.parse(window.localStorage.dessertCache);
                $ionicLoading.hide();
            }
        }

        if (isCached) {
            init();
        } else {
            $timeout(function() {
                init();
            }, 799);
        }

        //For Search field
        $scope.search = {
            query: ''
        };
        $scope.showSearch = false;


        $scope.resetSearch = function() {
            $scope.search = {
                query: ''
            };
            $scope.showSearch = !$scope.showSearch;
        }

        $scope.$on('search_called', function(event, search_called) {
            $scope.showSearch = !$scope.showSearch;
        });


        $scope.customOptions = function(product) {

            //Render Template
            var i = 0;
            $scope.choiceName = "";
            $scope.choicePrice = "";
            var choiceTemplate = '<div class="padding">';
            while (i < product.custom.length) {
                choiceTemplate = choiceTemplate + '<ion-radio ng-click="addCustomItem(\'' + product.custom[i].customName + '\', ' + product.custom[i].customPrice + ')">' + product.custom[i].customName + ' <tag style="font-size: 80%; color: #d35400">Rs. ' + product.custom[i].customPrice + '</tag></ion-radio>';
                i++;
            }
            choiceTemplate = choiceTemplate + '</div>';

            var newCustomPopup = $ionicPopup.show({
                cssClass: 'popup-outer new-shipping-address-view',
                template: choiceTemplate,
                title: 'Choose Options',
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

                    $scope.addToCart(product, 'DO_NOT_ANIMATE');
                    newCustomPopup.close();
                }

            }

        }



        $scope.addToCart = function(product, optionalFlag) {
            // $ionicLoading.show({
            //     template: '<tag style="color: #f1c40f">' + product.itemName + '</tag> is added.',
            //     duration: 1000
            // });

            product.qty = 1;
            ShoppingCartService.addProduct(product);

            //Animate
            if(optionalFlag && optionalFlag == 'DO_NOT_ANIMATE'){

            }
            else if(optionalFlag && optionalFlag == 'SEARCH'){
                var id = "search_dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);   
            }
            else{
                var id = "dish_"+product.itemCode;
                document.getElementById(id).innerHTML = '<span class="icon ion-checkmark fadeIn"></span>';
                setTimeout(function(){                  
                    document.getElementById(id).innerHTML = '<span class="icon ion-plus fadeIn"></span>';
                }, 1000);    
            }          

        };
        
    })
;