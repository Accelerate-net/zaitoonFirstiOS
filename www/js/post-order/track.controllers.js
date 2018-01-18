angular.module('order.track.controllers', [])

    .controller('trackCtrl', function($scope, $state, $interval, $http, $ionicLoading, trackOrderService) {

        //If not logged in (meaning, does not have a token)?
        if (_.isUndefined(window.localStorage.user) && window.localStorage.user != "") {
            $ionicLoading.show({
                template: 'Please login to view this page',
                duration: 3000
            });
            $state.go('intro.auth-login');
        }

        var data = {};

        data.token = JSON.parse(window.localStorage.user).token;
        data.orderID = trackOrderService.getOrderID();

        $http({
                method: 'POST',
                url: 'https://www.zaitoon.online/services/orderinfo.php',
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            })
            .success(function(response) {
                $scope.track = response;
                $scope.status = $scope.track.response.status;
                $scope.isTakeAway = $scope.track.response.isTakeaway;
            })
            .error(function(data) {
                $ionicLoading.show({
                    template: "Not responding. Check your connection.",
                    duration: 3000
                });
            });

        //Repeated Pooling of Track Page
        $interval(function() {
            $http({
                    method: 'POST',
                    url: 'https://www.zaitoon.online/services/orderinfo.php',
                    data: data,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 90000
                })
                .success(function(response) {
                    $scope.track = response;
                    $scope.status = $scope.track.response.status;
                    $scope.isTakeAway = $scope.track.response.isTakeaway;
                })
                .error(function(data) {
                    $ionicLoading.show({
                        template: "Unable to track. Check your connection.",
                        duration: 3000
                    });
                });
        }, 15000);

        // $scope.$on('$destroy', function () {$interval.cancel($scope.Timer);});


        $scope.displayInfo = false;
        $scope.clearInfo = function() {
            $scope.displayInfo = false;
        }
        $scope.showInfo = function() {
            $scope.displayInfo = true;
        }




    })


;