angular.module('underscore', [])
    .factory('_', function() {
        return window._; // assumes underscore has already been loaded on the page
    });

angular.module('zaitoonFirst', [
        'ngCordova',

        'ionic',
        'zaitoonFirst.views',

        'common.controllers',
        'common.directives',

        'account.controllers',
        'account.services',

        'auth.controllers',


        'checkout.controllers',
        'checkout.services',

        'outlet.controllers',
        'outlet.services',

        'menu.controllers',
        'menu.directives',
        'menu.filters',
        'menu.services',

        'filters.controllers',
        'filters.directives',


        'slideshow.controllers',

        'search.controllers',
        'search.filters',

        'cart.controllers',
        'cart.directives',
        'cart.services',


        'deals.controllers',
        'deals.services',

        'order.track.controllers',
        'order.track.services',

        'order.feedback.controllers',
        'order.feedback.services',

        'rewards.controllers',


        'landing.controllers',
        'landing.services',

        'underscore',
        'angularMoment',
        'ngRangeSlider',
        'ionic-native-transitions'
    ])

    .run(function($ionicPlatform, amMoment, $rootScope) {



        $rootScope.previousView = [];

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            var last_state = _.last($rootScope.previousView);

            if (last_state && (last_state.fromState === toState.name)) {
                $rootScope.previousView.pop();
            } else {
                $rootScope.previousView.push({
                    "fromState": fromState.name,
                    "fromParams": fromParams
                });
            }
        });

    
        $ionicPlatform.ready(function() {

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            amMoment.changeLocale('en-gb');

            $rootScope.$apply();
        });



    })

    .config(function($ionicConfigProvider) {
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $ionicConfigProvider.form.checkbox('circle');

        if (!ionic.Platform.isWebView()) {
            $ionicConfigProvider.scrolling.jsScrolling(false);
        }
    })

    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('intro', {
                url: '/intro',
                abstract: true,
                templateUrl: 'views/common/intro.html'
            })

            .state('intro.walkthrough-welcome', {
                url: '/walkthrough-welcome',
                nativeTransitions: { type: "fade" },
                views: {
                    'intro-view@intro': {
                        templateUrl: 'views/landing/landing.html',
                        controller: 'welcomeCtrl'
                    }
                }
            })

            .state('intro.walkthrough-learn', {
                url: '/walkthrough-learn',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'intro-view@intro': {
                        templateUrl: 'views/landing/slideshow.html',
                        controller: 'welcomeSlideshowCtrl'
                    }
                }
            })

            .state('intro.auth-login', {
                url: '/auth-login',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'intro-view@intro': {
                        templateUrl: 'views/auth/login.html',
                        controller: 'LoginCtrl'
                    }
                }
            })

            .state('intro.auth-signup', {
                url: '/auth-signup',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'intro-view@intro': {
                        templateUrl: 'views/auth/signup.html',
                        controller: 'SignupCtrl'
                    }
                }
            })



            .state('main', {
                url: '/main',
                abstract: true,
                templateUrl: 'views/common/main.html'
            })

            .state('main.app', {
                url: '/app',
                abstract: true,
                views: {
                    'main-view@main': {
                        templateUrl: 'views/common/app.html',
                        controller: 'AppCtrl'
                    }
                }
            })




            .state('main.app.filters', {
                url: '/filters',
                nativeTransitions: { type : "slide", direction : "up", duration : 400},
                nativeTransitionsBack: { type : "slide", direction : "down", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/filters/filters.html',
                        controller: 'FiltersCtrl'
                    }
                }
            })



            .state('main.app.feed', {
                url: '/feed',
                nativeTransitions: { type: "fade" },
                views: {
                    'app-feed@main.app': {
                        templateUrl: 'views/menu/main-feed.html',
                        controller: 'FeedCtrl'
                    }
                }
            })


            .state('main.app.feed.arabian', {
                url: '/arabian',
                nativeTransitions: { type: "fade" },
                views: {
                    'category-feed@main.app.feed': {
                        templateUrl: 'views/menu/menu.html',
                        controller: 'FoodArabianCtrl'
                    }
                }
            })

            .state('main.app.feed.chinese', {
                url: '/chinese',
                nativeTransitions: null,
                views: {
                    'category-feed@main.app.feed': {
                        templateUrl: 'views/menu/menu.html',
                        controller: 'FoodChineseCtrl'
                    }
                }
            })

            .state('main.app.feed.indian', {
                url: '/indian',
                nativeTransitions: null,
                views: {
                    'category-feed@main.app.feed': {
                        templateUrl: 'views/menu/menu.html',
                        controller: 'FoodIndianCtrl'
                    }
                }
            })

            .state('main.app.feed.dessert', {
                url: '/dessert',
                nativeTransitions: null,
                views: {
                    'category-feed@main.app.feed': {
                        templateUrl: 'views/menu/menu.html',
                        controller: 'FoodDessertCtrl'
                    }
                }
            })

            .state('main.app.outlets', {
                url: '/content/:outletCode',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/branches/outlet-details.html',
                        controller: 'outletCtrl'
                    }
                },
                resolve: {
                    outlet: function(OutletFetchService, $stateParams) {
                        return OutletFetchService.getOutlet($stateParams.outletCode);
                    }
                }
            })




            .state('main.app.deals', {
                url: '/deals',
                nativeTransitions: { type: "fade" },
                views: {
                    'app-deals@main.app': {
                        templateUrl: 'views/deals/deals.html',
                        controller: 'DealsCtrl'
                    }
                }
            })



            .state('main.app.branches', {
                url: '/branches',
                nativeTransitions: { type: "fade" },
                views: {
                    'main-view@main': {
                        templateUrl: 'views/branches/branches.html',
                        controller: 'BranchCtrl'
                    }
                }
            })




            .state('main.app.account', {
                url: '/account',
                nativeTransitions: null,
                views: {
                    'app-account@main.app': {
                        templateUrl: 'views/account/account.html'
                    }
                }
            })

            .state('main.app.account.profile', {
                url: '/profile',
                nativeTransitions: { type: "fade" },
                views: {
                    'my-profile@main.app.account': {
                        templateUrl: 'views/account/profile.html',
                        controller: 'ProfileCtrl'
                    }
                },
                resolve: {
                    user: function(ProfileService) {
                        return ProfileService.getUserData();
                    }
                }
            })


            .state('main.app.rewards', {
                url: '/rewards',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/rewards/rewards.html',
                        controller: 'RewardsCtrl'
                    }
                }
            })

            .state('main.app.rewardslanding', {
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                url: '/rewardslanding',
                views: {
                    'main-view@main': {
                        templateUrl: 'views/rewards/rewardslanding.html',
                        controller: 'RewardsLandingCtrl'
                    }
                }
            })




            .state('main.app.account.orders', {
                url: '/orders',
                nativeTransitions: { type: "fade" },
                views: {
                    'my-orders@main.app.account': {
                        templateUrl: 'views/account/orders.html',
                        controller: 'OrdersCtrl'
                    }
                }
            })


            .state('main.app.passes', {
                url: '/passes',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'app-deals@main.app': {
                        templateUrl: 'views/deals/passes.html',
                        controller: 'PassesCtrl'
                    }
                }
            })



            .state('main.app.shopping-cart', {
                url: '/shopping-cart',
                nativeTransitions: { type : "slide", direction : "down", duration : 400},
                nativeTransitionsBack: { type: "slide", "direction": "up", duration : 400 },
                views: {
                    'main-view@main': {
                        templateUrl: 'views/shopping-cart/cart.html',
                        controller: 'ShoppingCartCtrl'
                    }
                },
                resolve: {
                    products: function(ShoppingCartService) {
                        return ShoppingCartService.getProducts();
                    }
                }
            })


            .state('main.app.deals-cart', {
                url: '/deals-cart',
                nativeTransitions: { type : "slide", direction : "up", duration : 400},
                nativeTransitionsBack: { type : "slide", direction : "down", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/deals/deals-cart.html',
                        controller: 'DealsCartCtrl'
                    }
                },
                resolve: {
                    products: function(DealsCartService) {
                        return DealsCartService.getProducts();
                    }
                }
            })


            .state('main.app.view-passes', {
                nativeTransitions: { type : "slide", direction : "down", duration : 400},
                url: '/view-passes',
                views: {
                    'main-view@main': {
                        templateUrl: 'views/deals/view-passes.html',
                        controller: 'ViewPassesCtrl'
                    }
                }
            })


            .state('main.app.checkout', {
                url: '/checkout',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/checkout/checkout.html',
                        controller: 'CheckoutCtrl'
                    }
                },
                resolve: {
                    products: function(ShoppingCartService) {
                        return ShoppingCartService.getProducts();
                    }
                }
            })

            .state('main.app.checkout.address', {
                url: '/address',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/checkout/address.html',
                        controller: 'CheckoutAddressCtrl'
                    }
                },
                resolve: {
                    user_shipping_addresses: function(CheckoutService) {
                        return CheckoutService.getUserShippingAddresses();
                    }
                }
            })

            .state('main.app.checkout.track', {
                url: '/track',
                nativeTransitions: { type : "slide", direction : "left", duration : 400},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/post-order/track.html',
                        controller: 'trackCtrl'
                    }
                }
            })


            .state('main.app.checkout.feedback', {
                url: '/feedback',
                nativeTransitions: { type : "flip", direction : "up", duration : 500},
                views: {
                    'main-view@main': {
                        templateUrl: 'views/post-order/feedback.html',
                        controller: 'feedbackCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/intro/walkthrough-welcome');
        // $urlRouterProvider.otherwise('/main/app/feed/fashion');
    });