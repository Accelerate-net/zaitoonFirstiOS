angular.module('cart.services', [])

.service('ShoppingCartService', function ($http, $q, $rootScope, couponService){

  this.getProducts = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_cart || '[]');
  };

  this.updatedProducts = function(products){
    window.localStorage.zaitoonFirst_cart = JSON.stringify(products);

    $rootScope.$broadcast('cart_updated', products);
  };

  this.addProduct = function(productToAdd){
    //Clear the Coupon, if already applied.
    couponService.setStatus(false);
    couponService.setCoupon('');

    var cart_products = !_.isUndefined(window.localStorage.zaitoonFirst_cart) ?      JSON.parse(window.localStorage.zaitoonFirst_cart) : [];

    //check if this product is already saved
    //Adding a customisable item. Check if it's different variant already added.
    if(productToAdd.isCustom)
    {
      var existing_product = _.find(cart_products, function(product){
        return ((product.itemCode == productToAdd.itemCode) && (product.variant == productToAdd.variant));
      });
    }
    else
    {
      var existing_product = _.find(cart_products, function(product){
        return product.itemCode == productToAdd.itemCode;
      });
    }


    if(!existing_product){
      cart_products.push(productToAdd);
      $rootScope.$broadcast('cart_updated', cart_products);
      $rootScope.$emit('cart_updated', cart_products);
    }
    else{ //Increment the cart count
      if(productToAdd.isCustom){
        var i = 0;
        while(i < cart_products.length){
          if((cart_products[i].itemCode == productToAdd.itemCode) && (cart_products[i].variant == productToAdd.variant)){
            cart_products[i].qty++;
            break;
          }
          i++;
        }
      }
      else{
        var i = 0;
        while(i < cart_products.length){
          if(cart_products[i].itemCode == productToAdd.itemCode){
            cart_products[i].qty++;
            break;
          }
          i++;
        }
      }
    }

    window.localStorage.zaitoonFirst_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
  };

  this.lessProduct = function(productToAdd){

    //Clear the Coupon, if already applied.
    couponService.setStatus(false);
    couponService.setCoupon('');

    var cart_products = JSON.parse(window.localStorage.zaitoonFirst_cart);

    //Decrement the cart count
      var i = 0;
      while(i < cart_products.length){

        if(productToAdd.isCustom){
          if((cart_products[i].itemCode == productToAdd.itemCode) && (cart_products[i].variant == productToAdd.variant)){
            if(cart_products[i].qty > 1)
              cart_products[i].qty--;
            break;
          }
        }
        else{
          if(cart_products[i].itemCode == productToAdd.itemCode){
            if(cart_products[i].qty > 1)
              cart_products[i].qty--;
            break;
          }
        }

        i++;
      }

    window.localStorage.zaitoonFirst_cart = JSON.stringify(cart_products);
    $rootScope.$broadcast('cart_updated', cart_products);
  };

  this.removeProduct = function(productToRemove){

    //Clear the Coupon, if already applied.
    couponService.setStatus(false);
    couponService.setCoupon('');


    var cart_products = JSON.parse(window.localStorage.zaitoonFirst_cart);

    //Check if a customisable item.
    if(productToRemove.isCustom)
    {
      var new_cart_products = _.reject(cart_products, function(product){
        return ((product.itemCode == productToRemove.itemCode) && (product.variant == productToRemove.variant));
      });
    }
    else
    {
      var new_cart_products = _.reject(cart_products, function(product){
        return product.itemCode == productToRemove.itemCode;
      });
    }

    window.localStorage.zaitoonFirst_cart = JSON.stringify(new_cart_products);
    $rootScope.$broadcast('cart_updated', new_cart_products);
  };


})

;
