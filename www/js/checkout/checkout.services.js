angular.module('checkout.services', [])


.service('couponService', function () {
        var couponLock = false;
        var couponApplied = '';
        var discount = 0;

        return {
          getDiscount: function () {
            return discount;
          },
          setDiscount: function (value) {
            discount = value;
          },
          getStatus: function () {
              return couponLock;
          },
          setStatus: function(value) {
              couponLock = value;
          },
          getCoupon: function () {
                return couponApplied;
          },
          setCoupon: function(value) {
              couponApplied = value;
          }
        };
})

.service('CheckoutService', function ($http, $q){

  //Type of Order : Delivery OR Take away
  var checkoutMode = 'delivery';
  this.getCheckoutMode = function(){
    return checkoutMode;
  }
  this.setCheckoutMode = function(value){
    console.log('Setting Value..'+value)
    checkoutMode = value;
  }

  this.getUserShippingAddresses = function(){
    var dfd = $q.defer();

    var data = {};
    data.token = JSON.parse(window.localStorage.user).token;

    $http({
      method  : 'POST',
      url     : 'https://www.zaitoon.online/services/fetchusers.php',
      data    : data,
      headers : {'Content-Type': 'application/x-www-form-urlencoded'}
     })
    .then(function(response) {
      dfd.resolve(response.data.savedAddresses);
    });

    return dfd.promise;
  };

  this.saveUserSelectedCard = function(card){
    window.localStorage.zaitoonFirst_selected_card = JSON.stringify(card);
  }
  this.saveUserSelectedAddress = function(address){
    window.localStorage.zaitoonFirst_selected_address = JSON.stringify(address);
  }
  this.getUserSelectedCard = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_selected_card || '[]');
  };
  this.getUserSelectedAddress = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_selected_address || '[]');
  };
})

;
