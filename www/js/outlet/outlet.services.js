angular.module('outlet.services', [])

.service('OutletFetchService', function ($http, $q){
  this.getOutlet = function(code){
    var dfd = $q.defer();
    $http.get('https://www.zaitoon.online/services/fetchoutlets.php?outletcode='+code).success(function(data) {
      dfd.resolve(data.response);
    });
    return dfd.promise;
  };
})

.service('outletWarningStatusService', function ($http, $q){
  var isWarningPrefered = true;
  var isDelayWarningPrefered = true;

  /* For Closure */ 
  this.getStatus = function(){
    return isWarningPrefered;
  }

  this.clearWarning = function(){
    isWarningPrefered = false;
  }


  /* For Delay */
  this.getDelayStatus = function(){
    return isDelayWarningPrefered;
  }

  this.clearDelayWarning = function(){
    isDelayWarningPrefered = false;
  }

  this.reset = function(){
    isWarningPrefered = true;
    isDelayWarningPrefered = true;
  }

})

.service('outletService', function ($http, $q){

  //Default Parameters
  var outlet = "";
  var paymentKey = "";
  var onlyTakeAway = false;
  var isSpecial = false;
  var city = "";
  var location = "";
  var locationCode = "";

  var isAcceptingOnlinePayment = true;
  var isOpen = true;

  var isDelayed = false;
  var delayMessage = '';
  var closureMessage = '';

  var isTaxCollected = true;
  var taxPercentage = 0.02;

  var isParcelCollected = true;
  var parcelPercentageDelivery = 0.05;
  var parcelPercentagePickup = 0.03;

  var minAmount = 300;
  var minTime = 45;

  this.setOutletInfo = function(info){
    outlet = info.outlet;
    onlyTakeAway = info.onlyTakeAway;
    isSpecial = info.isSpecial;
    city = info.city;
    location = info.location;
    locationCode = info.locationCode;
    isAcceptingOnlinePayment = info.isAcceptingOnlinePayment;
    isOpen = info.isOpen;
    paymentKey = info.paymentKey;
    isTaxCollected = info.isTaxCollected;
    taxPercentage = info.taxPercentage;
    isParcelCollected = info.isParcelCollected;
    parcelPercentageDelivery = info.parcelPercentageDelivery;
    parcelPercentagePickup = info.parcelPercentagePickup;
    minAmount = info.minAmount;
    minTime = info.minTime;

    isDelayed = info.isDelayed;
    delayMessage = info.delayMessage;
    closureMessage = info.closureMessage;
  }

  this.getInfo = function(){
    var data = {
      "outlet":outlet,
      "onlyTakeAway":onlyTakeAway,
      "isSpecial": isSpecial,
      "city":city,
      "location":location,
      "locationCode":locationCode,
      "isTaxCollected": isTaxCollected,
      "taxPercentage": taxPercentage,
      "isParcelCollected":isParcelCollected,
      "parcelPercentageDelivery": parcelPercentageDelivery,
      "parcelPercentagePickup": parcelPercentagePickup,
      "minTime": minTime,
      "minAmount": minAmount,
      "isAcceptingOnlinePayment": isAcceptingOnlinePayment,
      "isOpen": isOpen,
      "paymentKey": paymentKey,
      "isDelayed": isDelayed,
      "delayMessage": delayMessage,
      "closureMessage": closureMessage
    }
    return data;
  }

})

;
