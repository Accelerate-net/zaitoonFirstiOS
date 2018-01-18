angular.module('rewards.controllers', [])

.controller('RewardsCtrl', function(ConnectivityMonitor, $ionicPopup, $scope, $http, $state, $ionicLoading) {

  //Network Status
  if(ConnectivityMonitor.isOffline()){
    $scope.isOfflineFlag = true;
  }
  else{
    $scope.isOfflineFlag = false;
  }

  //If not logged in
  if(_.isUndefined(window.localStorage.user) && window.localStorage.user !=""){
    $state.go('main.app.rewardslanding');
  }


//Terms
$scope.showTerms = function(){
  var alertPopup = $ionicPopup.alert({
  cssClass: 'popup-outer new-shipping-address-view',
  title: 'Terms',
  template: "<div style='padding: 10px; color: #7f8c8d; font-weight: 300'><ul style='list-style-type: circle;'>"+
            "<li>Member's Club is decided based on monthly average of coins earned by the member.</li>"+
            "<li>Validity of coins is 30 days from the date it is earned. It expires automatically after the validity period.</li>"+
            "<li>Once the Voucher is generated, it can not be reversed.</li>"+
            "<li>Validity of generated voucher will be 1 month.</li>"+
            "<li>Keep the SMS safe. Vouchers will NOT be resent.</li>"+
            "</ul></div>"
  });
}



$scope.loadStatus = function(){
  $ionicLoading.show({
    template:  '<ion-spinner></ion-spinner>'
  });

  var data = {};
  data.token = JSON.parse(window.localStorage.user).token;
  $http({
    method  : 'POST',
    url     : 'https://www.zaitoon.online/services/getloyaltystatus.php',
    data    : data,
    headers : {'Content-Type': 'application/x-www-form-urlencoded'},
    timeout : 10000
   })
  .success(function(data) {
    $ionicLoading.hide();
    if(data.error == "NOTENROLLED"){
      $state.go('main.app.rewardslanding');
    }
    if(data.status){
      $scope.rewardsInfo = data.response;
    }
    else{
      $scope.errorMsg = data.error;
    }

  })
  .error(function(data){
      $ionicLoading.hide();
      $ionicLoading.show({
        template:  "Not responding. Check your connection.",
        duration: 3000
      });
  });
}
$scope.loadStatus();



//Loyalty History
  $scope.loadHistory = function(){
    console.log('Loading Histroy')
  $ionicLoading.show({
    template:  '<ion-spinner></ion-spinner>'
  });

  $scope.isEmpty = false;

  var data = {};
  data.token = JSON.parse(window.localStorage.user).token;
  data.id = 0;
  $http({
    method  : 'POST',
    url     : 'https://www.zaitoon.online/services/loyaltyhistory.php',
    data    : data,
    headers : {'Content-Type': 'application/x-www-form-urlencoded'},
    timeout : 10000
   })
  .success(function(data) {

    $ionicLoading.hide();

    if(data.status){
      $scope.historyList = data.response;
      if($scope.historyList.length == 0)
        $scope.isEmpty = true;
      else
        $scope.isEmpty = false;
      $scope.left = 1;
    }
    else{
    }


  })
  .error(function(data){
      $ionicLoading.hide();
      $ionicLoading.show({
        template:  "Not responding. Check your connection.",
        duration: 3000
      });
  });
}
$scope.loadHistory();


$scope.limiter = 5;
$scope.loadMore = function() {
  var data = {};
  data.token = JSON.parse(window.localStorage.user).token;
  data.id = $scope.limiter;

  $http({
    method  : 'POST',
    url     : 'https://www.zaitoon.online/services/loyaltyhistory.php',
    data    : data,
    headers : {'Content-Type': 'application/x-www-form-urlencoded'},
    timeout : 10000
   })
  .success(function(data) {

    if(data.response.length == 0){
      $scope.left = 0;
    }
    $scope.historyList = $scope.historyList.concat(data.response)

    $scope.limiter+=5;
    $scope.$broadcast('scroll.infiniteScrollComplete');
  })
  .error(function(data){
      $ionicLoading.hide();
      $ionicLoading.show({
        template:  "Not responding. Check your connection.",
        duration: 3000
      });
  });

};

$scope.generateVoucher = function(){
  var confirmPopup = $ionicPopup.confirm({
    cssClass: 'popup-outer new-shipping-address-view',
    title: 'Generate Voucher',
    template: '<div style="color: #34495e; padding: 15px 5px">Are you sure you want to redeem coins and generate a voucher?</div>'
  });

  confirmPopup.then(function(res) {
    if(res) {
      $ionicLoading.show({
        template:  '<ion-spinner></ion-spinner>'
      });
      var data = {};
      data.token = JSON.parse(window.localStorage.user).token;
      $http({
        method  : 'POST',
        url     : 'https://www.zaitoon.online/services/generatevoucher.php',
        data    : data,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout : 10000
       })
      .success(function(data) {
        $ionicLoading.hide();
        if(data.status){
          var alertPopup = $ionicPopup.alert({
          cssClass: 'popup-outer new-shipping-address-view',
          title: 'Voucher',
          template: "<div style='padding: 10px; color: #7f8c8d; font-weight: 300'>"+data.brief+"<br><br><strong style='color: #2ecc71; font-size: 16px'>"+data.voucher+"</strong><br><br>Expires on "+data.expiry+"</div>"
          });
          $scope.loadHistory();
          $scope.loadStatus();
        }
        else{
          $ionicLoading.show({
            template:  "Error: "+data.error,
            duration: 3000
          });
        }
      })
      .error(function(data){
          $ionicLoading.hide();
          $ionicLoading.show({
            template:  "Not responding. Check your connection.",
            duration: 3000
          });
      });

    } else{
    }
  });

}


})

.controller('RewardsLandingCtrl', function(ConnectivityMonitor, $scope, $http, $state, $ionicLoading) {

  console.log('LANDING................')

  //Network Status
  if(ConnectivityMonitor.isOffline()){
    $scope.isOfflineFlag = true;
  }
  else{
    $scope.isOfflineFlag = false;
  }

  //Logged in or not
  $scope.isEnrolledFlag = false;
  if(!_.isUndefined(window.localStorage.user)){
    $scope.isEnrolledFlag = JSON.parse(window.localStorage.user).isRewardEnabled;
  }
  else{
    $scope.isEnrolledFlag = false;
  }


  //Enroll for Rewards
  $scope.enrollNow = function(){
    //if not logged in
    if(_.isUndefined(window.localStorage.user) && window.localStorage.user !=""){
      $ionicLoading.show({
        template:  'Please login to enroll the rewards program.',
        duration: 3000
      });
      $state.go('intro.auth-login');
    }
    else{

      $ionicLoading.show({
        template:  '<ion-spinner></ion-spinner>'
      });

      var data = {};
      data.token = JSON.parse(window.localStorage.user).token;
      $http({
        method  : 'POST',
        url     : 'https://www.zaitoon.online/services/enrollloyaltyprogram.php',
        data    : data,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
        timeout : 10000
       })
      .success(function(data) {
        console.log(data)
        $ionicLoading.hide();
        if(data.status){
          var temp_user = JSON.parse(window.localStorage.user);
          temp_user.isRewardEnabled = true;
          window.localStorage.user = JSON.stringify(temp_user);
          $state.go('main.app.rewards');
        }
        else{
          $ionicLoading.show({
            template:  data.error,
            duration: 3000
          });
        }
      })
      .error(function(data){
          $ionicLoading.hide();
          $ionicLoading.show({
            template:  "Not responding. Check your connection.",
            duration: 3000
          });
      });
    }
  }


  $http.get('https://www.zaitoon.online/services/getloyaltyscheme.php')
  .then(function(response){
    $scope.schemesList = response.data;
  });


})
;
