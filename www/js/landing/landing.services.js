angular.module('landing.services', [])


.service('userLocationService', function ($http, $q){
  
  //Default Parameters
  var latitude = "";
  var longitude = "";

  var locationText = "";

  this.setCoords = function(lat, lng){
    latitude = lat;
    longitude = lng;
  }

  this.getCoords = function(){
    var data = {
      "lat":latitude,
      "lng":longitude
    }
    return data;
  }  

  this.setText = function(loc){
    locationText = loc;
  }

  this.getText = function(){
    return locationText;
  }

})

.service('locationChangeRouteTrackerService', function ($http, $q){
  
  //Default Parameters
  var source = "";

  this.setSource = function(src){
    source = src;
  }

  this.getSource = function(){
    return source;
  }  

  this.reset = function(){
    source = "";
  }

})

.service('LocationService', function($q){
  var autocompleteService = new google.maps.places.AutocompleteService();
  var detailsService = new google.maps.places.PlacesService(document.createElement("input"));

  return {
    searchAddress: function(input) {

      var deferred = $q.defer();

      autocompleteService.getPlacePredictions({
        input: input,
        componentRestrictions: {country: 'in'}
      }, function(result, status) {
        if(status == google.maps.places.PlacesServiceStatus.OK){
          deferred.resolve(result);
        }else{
          deferred.reject(status)
        }
      });

      return deferred.promise;
    },
    getDetails: function(placeId) {
      var deferred = $q.defer();
      detailsService.getDetails({placeId: placeId}, function(result) {
        deferred.resolve(result);
      });
      return deferred.promise;
    }
  };
})

.directive('locationSuggestion', function($ionicModal, LocationService, userLocationService){
  return {
    restrict: 'A',
    scope: {
      location: '='
    },
    link: function($scope, element){
      $scope.search = {};
      $scope.search.suggestions = [];
      $scope.search.query = "";
      $ionicModal.fromTemplateUrl('views/common/partials/google-place-suggestions-modal.html', {
        scope: $scope,
        focusFirstInput: true
      }).then(function(modal) {
        $scope.modal = modal;
      });
      element[0].addEventListener('focus', function(event) {
        $scope.open();
      });
      $scope.$watch('search.query', function(newValue) {
        if (newValue) {
          LocationService.searchAddress(newValue).then(function(result) {
            $scope.search.error = null;
            $scope.search.suggestions = result;
          }, function(status){
            if(status == 'ZERO_RESULTS'){
              $scope.search.error = "No matching places found";
            }
            else{
              $scope.search.error = "Something went wrong";
            }
            
          });
        };
        $scope.open = function() {
          $scope.modal.show();
        };
        $scope.close = function() {
          $scope.modal.hide();
        };
        $scope.choosePlace = function(place) {
          LocationService.getDetails(place.place_id).then(function(location) {
            userLocationService.setCoords(location.geometry.location.lat(), location.geometry.location.lng());

            userLocationService.setText(location.name);
            $scope.location = location;
            $scope.close();
          });
        };
      });
    }
  }
})

;
