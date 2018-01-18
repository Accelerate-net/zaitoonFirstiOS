angular.module('auth.controllers', [])

    .controller('LoginCtrl', function(ConnectivityMonitor, $interval, $scope, $state, $http, $ionicLoading, $timeout, $rootScope) {

        //If already logged in?
        if (!_.isUndefined(window.localStorage.user)) {
            $state.go('main.app.feed.arabian');
        }

        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }


        $scope.user = {};

        $scope.user.email = "";
        $scope.user.otp = "";
        $scope.user.mobile = "";
        $scope.otpFlag = false;

        //Global across login process
        $scope.main = "";
        $scope.main.isOTPSent = false;

        $scope.resetNumber = function() {
            $scope.otpFlag = false;
            $scope.resendOTPFlag = false;
            $interval.cancel($rootScope.loopTimer);
            $scope.error = "";
            $scope.showResendButton = false;
        }

        if (!$scope.main.isOTPSent) {
            $interval.cancel($rootScope.loopTimer);
        }

        $scope.validateNumber = function() {
            console.log('VALIDATING LOGIN...')
            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet',
                    duration: 2000
                });
            } else {

                //LOADING
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });


                var isnum = /^\d+$/.test($scope.user.mobile);
                if (isnum && $scope.user.mobile.length == 10) {

                    $scope.resendOTPFlag = false;
                    $scope.showResendButton = false;

                    var data = {};
                    data.mobile = $scope.user.mobile;

                    $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/userlogin.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(data) {

                            $ionicLoading.hide();
                          
	

                            $scope.resendOTPFlag = true;
                            $scope.showResendButton = false;

                            $scope.main = data.response;
                            if (data.status) {
                                $scope.otpFlag = true;
                                $scope.error = "";

                                //Additional Warnings
                                var warning = data.error;
                                var timeLeft = 60;

                                if (warning != "") {
                                    $scope.error = warning;
                                    timeLeft = data.timeleft;
                                } else {
                                    $scope.error = "";
                                    timeLeft = 60;
                                }

                                $rootScope.loopTimer = $interval(function() {
                                    document.getElementById("resendOTP").innerHTML = '<tag style="color: #bdc3c7;">Resend OTP in ' + timeLeft + ' seconds</tag>';
                                    timeLeft--;
                                    if (timeLeft == 0) {
                                        $scope.error = "";
                                        $scope.showResendButton = true;
                                        $interval.cancel($rootScope.loopTimer);
                                        document.getElementById("resendOTP").innerHTML = '';

                                    }

                                }, 1000);



                            } else {
                                $scope.error = data.error;
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
                    $scope.error = "Invalid Mobile Number";
                    $ionicLoading.hide();
                }

            }

        };

        $scope.doLogIn = function() {

            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet',
                    duration: 2000
                });
            } else {

                //LOADING
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });


                $scope.error = "";

                var isnum = /^\d+$/.test($scope.user.otp);
                if (isnum && $scope.user.otp.length == 4) {

                    var sdata = {};
                    sdata.mobile = $scope.user.mobile;
                    sdata.otp = $scope.user.otp;

                    $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/validatelogin.php',
                            data: sdata,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(data) {

                            $ionicLoading.hide();

                            $scope.validated = data;

                            if ($scope.validated.status) { //Validate OTP and LOG IN
                                $scope.error = "";
                                //Set User Credentials
                                window.localStorage.user = JSON.stringify($scope.validated.response);

                                $state.go('main.app.feed.arabian');
                            } else {
                                console.log('ERROR');
                                $scope.error = $scope.validated.error;
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
                    $scope.error = "OTP must be a 4 digit number.";
                    $ionicLoading.hide();
                }

            }

        };


    })

    .controller('SignupCtrl', function(ConnectivityMonitor, $rootScope, $interval, $scope, $http, $state, $ionicLoading, $timeout, $ionicModal) {


        //Network Status
        if (ConnectivityMonitor.isOffline()) {
            $scope.isOfflineFlag = true;
        } else {
            $scope.isOfflineFlag = false;
        }

        //Default Values
        $scope.showResendButton = false;
        $scope.resendOTPFlag = false;

        $scope.user = {};

        $scope.user.name = "";
        $scope.user.email = "";
        $scope.user.mobile = "";
        $scope.signupFlag = false;

        if (!$scope.signupFlag) { // <!-- to prevent double timer bug
            $interval.cancel($rootScope.loopTimer);
        }

        $scope.validateSignUp = function() {

            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet',
                    duration: 2000
                });
            } else {

                //LOADING
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });


                //Validate, Create an account and login.
                var isnum = /^\d+$/.test($scope.user.mobile);
                var ischar = /^[a-zA-Z ]*$/.test($scope.user.name);
                var isemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($scope.user.email);
                if (ischar && $scope.user.name.length >= 5) {
                    if (isnum && $scope.user.mobile.length == 10) { //Validate OTP and LOG IN
                        if (isemail) { //Validate OTP and SIGN UP
                            $scope.error = "";

                            var data = {};
                            data.mobile = $scope.user.mobile;

                            $http({
                                    method: 'POST',
                                    url: 'https://www.zaitoon.online/services/usersignup.php',
                                    data: data,
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    timeout: 10000
                                })
                                .success(function(data) {

                                    $ionicLoading.hide();
                                    

                                    $scope.showResendButton = false;
                                    $scope.main = data.response;
                                    if (data.status) {
                                        $scope.resendOTPFlag = true;
                                        $scope.signupFlag = true;
                                        $scope.error = "";
                                        $scope.otpapi = $scope.main.otp;

                                        //Additional Warnings
                                        var warning = data.error;
                                        var timeLeft = 60;

                                        if (warning != "") {
                                            $scope.error = warning;
                                            timeLeft = data.timeleft;
                                        } else {
                                            $scope.error = "";
                                            timeLeft = 60;
                                        }

                                        $rootScope.loopTimer = $interval(function() {
                                            document.getElementById("resendOTP").innerHTML = '<tag style="color: #bdc3c7;">Resend OTP in ' + timeLeft + ' seconds</tag>';
                                            timeLeft--;
                                            if (timeLeft == 0) {
                                                $scope.error = "";
                                                $scope.showResendButton = true;
                                                $interval.cancel($rootScope.loopTimer);
                                                document.getElementById("resendOTP").innerHTML = '';

                                            }

                                        }, 1000);


                                    } else {
                                        $scope.error = data.error;
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
                            $scope.error = "Enter a valid email.";
                            $ionicLoading.hide();
                        }
                    } else {
                        $scope.error = "Enter a valid moile number.";
                        $ionicLoading.hide();
                    }

                } else {
                    $scope.error = "Name must be atleast 5 characters.";
                    $ionicLoading.hide();
                }

            }

        };

        $scope.doSignUp = function() {

            if ($scope.isOfflineFlag) {
                $ionicLoading.show({
                    template: 'Please connect to Internet',
                    duration: 2000
                });
            } else {

                //LOADING
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });


                var isnum = /^\d+$/.test($scope.user.otp);
                if (isnum && $scope.user.otp.length == 4) {
                    var data = {};
                    data.mobile = $scope.user.mobile;
                    data.name = $scope.user.name;
                    data.email = $scope.user.email;
                    data.otpapi = $scope.otpapi;
                    data.otpuser = $scope.user.otp;

                    $http({
                            method: 'POST',
                            url: 'https://www.zaitoon.online/services/validatesignup.php',
                            data: data,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            timeout: 10000
                        })
                        .success(function(data) {

                            $ionicLoading.hide();

                            $scope.main = data;
                            if (data.status) {
                                //Set User info
                                window.localStorage.user = JSON.stringify(data.response);
                                $state.go('main.app.feed.arabian');
                            } else {
                                $scope.error = data.error;
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
                    $scope.error = "OTP must be a 4 digit number.";
                    $ionicLoading.hide();
                }

            }

        };

        $ionicModal.fromTemplateUrl('views/legal/privacy-policy.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.privacy_policy_modal = modal;
        });

        $ionicModal.fromTemplateUrl('views/legal/terms-of-service.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.terms_of_service_modal = modal;
        });

        $scope.showTerms = function() {
            $scope.terms_of_service_modal.show();
        };

        $scope.showPrivacyPolicy = function() {
            $scope.privacy_policy_modal.show();
        };


    })


;