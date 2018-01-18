angular.module('deals.services', [])



.service('PassViewService', function ($q){
	
	var id = '';
	
	this.setOrderID = function(myid){
		id = myid;
	}
	
	this.getOrderID = function(){
		return id;
	}
	
})



.service('DealsCartService', function ($http, $q, $rootScope){

  this.getProducts = function(){
    return JSON.parse(window.localStorage.zaitoonFirst_dealsCart || '[]');
  };

  this.updatedProducts = function(products){
    window.localStorage.zaitoonFirst_dealsCart = JSON.stringify(products);

    $rootScope.$broadcast('deals_cart_updated', products);
  };

  this.addProduct = function(productToAdd){

    var deals_cart_products = !_.isUndefined(window.localStorage.zaitoonFirst_dealsCart) ?      JSON.parse(window.localStorage.zaitoonFirst_dealsCart) : [];

    //check if this product is already saved
    //Adding a customisable item. Check if it's different variant already added.
    if(productToAdd.isCustom)
    {
      var existing_product = _.find(deals_cart_products, function(product){
        return ((product.itemCode == productToAdd.itemCode) && (product.variant == productToAdd.variant));
      });
    }
    else
    {
      var existing_product = _.find(deals_cart_products, function(product){
        return product.itemCode == productToAdd.itemCode;
      });
    }


    if(!existing_product){
      deals_cart_products.push(productToAdd);
      $rootScope.$broadcast('deals_cart_updated', deals_cart_products);
      $rootScope.$emit('deals_cart_updated', deals_cart_products);
    }
    else{ //Increment the cart count
      if(productToAdd.isCustom){
        var i = 0;
        while(i < deals_cart_products.length){
          if((deals_cart_products[i].itemCode == productToAdd.itemCode) && (deals_cart_products[i].variant == productToAdd.variant)){
            deals_cart_products[i].qty++;
            break;
          }
          i++;
        }
      }
      else{
        var i = 0;
        while(i < deals_cart_products.length){
          if(deals_cart_products[i].itemCode == productToAdd.itemCode){
            deals_cart_products[i].qty++;
            break;
          }
          i++;
        }
      }
    }

    window.localStorage.zaitoonFirst_dealsCart = JSON.stringify(deals_cart_products);
    $rootScope.$broadcast('deals_cart_updated', deals_cart_products);
  };

  this.lessProduct = function(productToAdd){

    var deals_cart_products = JSON.parse(window.localStorage.zaitoonFirst_dealsCart);

    //Decrement the cart count
      var i = 0;
      while(i < deals_cart_products.length){

        if(productToAdd.isCustom){
          if((deals_cart_products[i].itemCode == productToAdd.itemCode) && (deals_cart_products[i].variant == productToAdd.variant)){
            if(deals_cart_products[i].qty > 1)
              deals_cart_products[i].qty--;
            break;
          }
        }
        else{
          if(deals_cart_products[i].itemCode == productToAdd.itemCode){
            if(deals_cart_products[i].qty > 1)
              deals_cart_products[i].qty--;
            break;
          }
        }

        i++;
      }

    window.localStorage.zaitoonFirst_dealsCart = JSON.stringify(deals_cart_products);
    $rootScope.$broadcast('deals_cart_updated', deals_cart_products);
  };

  this.removeProduct = function(productToRemove){

    
    var deals_cart_products = JSON.parse(window.localStorage.zaitoonFirst_dealsCart);

    //Check if a customisable item.
    if(productToRemove.isCustom)
    {
      var new_deals_cart_products = _.reject(deals_cart_products, function(product){
        return ((product.itemCode == productToRemove.itemCode) && (product.variant == productToRemove.variant));
      });
    }
    else
    {
      var new_deals_cart_products = _.reject(deals_cart_products, function(product){
        return product.itemCode == productToRemove.itemCode;
      });
    }

    window.localStorage.zaitoonFirst_dealsCart = JSON.stringify(new_deals_cart_products);
    $rootScope.$broadcast('deals_cart_updated', new_deals_cart_products);
  };


})

;
