// This is cleaned up. Documentation pending.

angular.module('account.services', [])

.service('ProfileService', function ($http, $q, $state, $ionicLoading){

//  var isTokenRegenerated = false;

  this.getUserData = function(){

    /*
    if(!_.isUndefined(window.localStorage.user) && window.localStorage.user !="" && !this.isTokenRegenerated){
      Console.log('***** Regerenerating Token...')
      //Regenerate Token
      var data = {};
      data.token = JSON.parse(window.localStorage.user).token;
      $http({
        method  : 'POST',
        url     : 'https://www.zaitoon.online/services/regeneratetoken.php',
        data    : data,
        headers : {'Content-Type': 'application/x-www-form-urlencoded'}
       })
      .then(function(response) {
        console.log(response)
        if(response.data.status){
          var temp_user = JSON.parse(window.localStorage.user);
          temp_user.token = response.data.newtoken
          window.localStorage.user = JSON.stringify(temp_user);
          this.isTokenRegenerated = true;
        }
        else{
          this.isTokenRegenerated = false;
          window.localStorage.user = "";
        }
      });
    }
    */

    var dfd = $q.defer();

    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;
    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/fetchusers.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'},
      timeout : 10000
     })
    .success(function(response) {

      if(!response.status){
        //Something Went Wrong
        $ionicLoading.show({
          template:  'Session Expired. Please login again.',
          duration: 2000
        });
        window.localStorage.clear();
        $state.go('intro.auth-login');
      }

        if(response.savedAddresses == null)
          response.savedAddresses=[];

          //Update the Offline Cache
          var temp = {};
          temp = response;
          temp.token = JSON.parse(window.localStorage.user).token;
          window.localStorage.user = JSON.stringify(temp);

        dfd.resolve(response);
    })
    .error(function(data){
        $ionicLoading.show({
          template:  "Failed to load user information. Try again.",
          duration: 3000
        });
    });

    return dfd.promise;
  };


  this.updateUserData = function(newName, newEmail){
        var data = {};
        data.token = JSON.parse(window.localStorage.user).token;
        data.email = newEmail;
        data.name = newName;

        $http({
          method  : 'POST',
          url     : 'https://www.zaitoon.online/services/edituser.php',
          data    : data,
          headers : {'Content-Type': 'application/x-www-form-urlencoded'},
          timeout: 10000
         })
        .success(function(response) {
          //Update the Offline Cache
          var temp = {};
          temp = JSON.parse(window.localStorage.user);
          temp.name = data.name;
          temp.email = data.email;
          window.localStorage.user = JSON.stringify(temp);
        })
        .error(function(data){
            $ionicLoading.show({
              template:  "Not responding. Check your connection.",
              duration: 3000
            });
        });
  };

  //Delete a saved Address.
  this.deleteSavedAddress = function(id){
    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;
    data.id = id;

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/deletesavedaddress.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
     })
    .success(function(response) {

    })
    .error(function(data){
        $ionicLoading.show({
          template:  "Not responding. Check your connection.",
          duration: 3000
        });
    });

    return true;
  };


})


;
