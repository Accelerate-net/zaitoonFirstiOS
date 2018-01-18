angular.module('common.controllers', [])

.controller('AppCtrl', function($scope, $ionicHistory) {
  //Check if not logged in
  if(!_.isUndefined(window.localStorage.user)){
    $scope.isLoggedIn = true;
  }
  else{
      $scope.isLoggedIn = false;
  }
})

.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){

  

  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      /*
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();
      } else {
        return !navigator.onLine;
      }*/
      //var networkState = navigator.network.connection.type;
      //return networkState === Connection.UNKNOWN || networkState === Connection.NONE;
      return false;
    },
    startWatching: function(){
        if(ionic.Platform.isWebView()){

          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            console.log("went online");
          });

          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            console.log("went offline");
          });

        }
        else {

          window.addEventListener("online", function(e) {
            console.log("went online");
          }, false);

          window.addEventListener("offline", function(e) {
            console.log("went offline");
          }, false);
        }
    }
  }
})

;
