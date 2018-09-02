angular.module('menu.services', [])


.service('menuService', function ($http, $q){

  //Default Parameters
  var displayMenuType = "ARABIAN";

  var isArabianLoaded = false;
  var isChineseLoaded = false;
  var isIndianLoaded = false;
  var isDessertLoaded = false;

  var isSearchLoadedOnce = false;

  this.setDisplayMenuType = function(menutype){
    displayMenuType = menutype;
  }

  this.resetAll = function(){
     isArabianLoaded = false;
     isChineseLoaded = false;
     isIndianLoaded = false;
     isDessertLoaded = false;
  }

  this.setLoadFlag = function(type, flag){
    if(type == 'ARABIAN'){
      isArabianLoaded = flag;
    }
    else if(type == 'CHINESE'){
      isChineseLoaded = flag;
    }
    else if(type == 'INDIAN'){
      isIndianLoaded = flag;
    }
    else if(type == 'DESSERT'){
      isDessertLoaded = flag;
    }
    else if(type == 'SEARCH'){
      isSearchLoadedOnce = flag;
    }
  }

  this.getDisplayMenuType = function(){
    return displayMenuType;
  }

  this.getIsLoadedFlag = function(menutype){
    if(menutype == 'ARABIAN'){
      return isArabianLoaded;
    }
    else if(menutype == 'CHINESE'){
      return isChineseLoaded;
    }
    else if(menutype == 'INDIAN'){
      return isIndianLoaded;
    }
    else if(menutype == 'DESSERT'){
      return isDessertLoaded;
    }
    else if(menutype == 'SEARCH'){
      return isSearchLoadedOnce;
    }
  }

})

;
