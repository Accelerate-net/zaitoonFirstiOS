angular.module('order.feedback.controllers', [])


    .controller('feedbackCtrl', function(reviewOrderService, $scope, $http, $state, $rootScope, $ionicLoading) {

        //If not logged in (meaning, does not have a token)?
        if (_.isUndefined(window.localStorage.user) && window.localStorage.user != "") {
            $ionicLoading.show({
                template: 'Please login to view this page',
                duration: 3000
            });
            $state.go('intro.auth-login');
        }


        $scope.tag = "";
        $scope.selection = "";

        $scope.lastOrderBrief = reviewOrderService.getContent();

        $scope.fillTill = function(id) {
            $scope.starRating = id;
            //Set a tag which matches the selection

            //Less than 5 means, a negative review.
            if (id < 5)
                $scope.selection = 'N';
            else
                $scope.selection = 'P';

            $scope.tag = "";
            switch (id) {
                case 1:
                    {
                        $scope.tag = "Terrible";
                        break;
                    }
                case 2:
                    {
                        $scope.tag = "Bad";
                        break;
                    }
                case 3:
                    {
                        $scope.tag = "OK";
                        break;
                    }
                case 4:
                    {
                        $scope.tag = "Good";
                        break;
                    }
                case 5:
                    {
                        $scope.tag = "Awesome";
                        break;
                    }
            }

            var i = 1;
            while (i <= id) {
                document.getElementById("star" + i).className = "icon ion-android-star";
                i++;
            }
            //Empty the remaining stars
            while (i <= 5) {
                document.getElementById("star" + i).className = "icon ion-android-star-outline";
                i++;
            }
        }

        $scope.commentsFeed = "";
        //Characters Left in the comments
        document.getElementById('commentsBox').onkeyup = function() {
            document.getElementById('characterCount').innerHTML = (150 - (this.value.length)) + ' characters left.';
        }


        //Negative Feedback
        $rootScope.negative_feedback = {};
        $rootScope.negative_feedback.quality = false;
        $rootScope.negative_feedback.service = false;
        $rootScope.negative_feedback.delivery = false;
        $rootScope.negative_feedback.food = false;
        $rootScope.negative_feedback.app = false;
        $rootScope.negative_feedback.other = false;

        //Positive Feedback
        $rootScope.positive_feedback = {};
        $rootScope.positive_feedback.quality = false;
        $rootScope.positive_feedback.service = false;
        $rootScope.positive_feedback.delivery = false;
        $rootScope.positive_feedback.food = false;
        $rootScope.positive_feedback.app = false;
        $rootScope.positive_feedback.other = false;

        $scope.submitFeedback = function(comments) {
            if (!$scope.starRating) {
                $ionicLoading.show({
                    template: 'Please rate us to continue!',
                    duration: 2000
                });
            } else {
                if ($scope.starRating == 5) {
                    var reviewObject = {
                        "rating": $scope.starRating,
                        "quality": $rootScope.positive_feedback.quality,
                        "service": $rootScope.positive_feedback.service,
                        "delivery": $rootScope.positive_feedback.delivery,
                        "food": $rootScope.positive_feedback.food,
                        "app": $rootScope.positive_feedback.app,
                        "other": $rootScope.positive_feedback.other,
                        "comment": comments
                    }
                } else {
                    var reviewObject = {
                        "rating": $scope.starRating,
                        "quality": $rootScope.negative_feedback.quality,
                        "service": $rootScope.negative_feedback.service,
                        "delivery": $rootScope.negative_feedback.delivery,
                        "food": $rootScope.negative_feedback.food,
                        "app": $rootScope.negative_feedback.app,
                        "other": $rootScope.negative_feedback.other,
                        "comment": comments
                    }
                }

                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });

                //POST review
                var data = {};
                data.token = JSON.parse(window.localStorage.user).token;
                data.orderID = reviewOrderService.getLatest();
                data.review = reviewObject;

                $http({
                        method: 'POST',
                        url: 'https://www.zaitoon.online/services/postreview.php',
                        data: data,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        timeout: 10000
                    })
                    .success(function(response) {
                        $ionicLoading.hide();
                        $state.go('main.app.feed.arabian');
                    })
                    .error(function(data) {
                        $ionicLoading.show({
                            template: "Not responding. Check your connection.",
                            duration: 3000
                        });
                    });

            }
        };

    })


;