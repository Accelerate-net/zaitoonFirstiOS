(function(ionic) {

  // SCREENWIDTH = screen.width;
  // CARDWIDTH = 120;


  angular.module('ionic.contrib.ui.hscrollcards', ['ionic'])

    .directive('hscroller', ['$timeout', function($timeout) {
      return {
        restrict: 'E',
        template: '<div class="hscroller" ng-transclude></div>',
        replace: true,
        transclude: true,

        compile: function(element, attr) {
          return function($scope, $element, $attr) {

            var el = $element[0];
            angular.element($element).bind("scroll", function(){
              var left = $element[0].scrollLeft;
              // console.log($element.childNodes);
            });


          }
        },
      }
    }])

    .directive('hcard', ['$rootScope', function($rootScope) {
      return {
        restrict: 'E',
        template: '<div class="hscroller-card" ng-transclude></div>',
        replace: true,
        transclude: true,
        scope: {
          name: '@',
          image: '@',
          price: '@',
          available: '@',
          index: '@'
        },
        link: function(scope, element, attrs){
          if(attrs.available == 'true'){
            element.append('<div style="position: relative"><pre-img ratio="_1_1"><img class="hscroller-img" src="'+attrs.image+'" spinner-on-load/></pre-img><div style="position: absolute; right: 0px; top: 4px; background: rgba(167, 29, 43, 0.4); font-size: 12px; color: #FFF; padding: 0px 4px"><i class="fa fa-inr" style="font-size: 10px; padding-right: 2px"></i>'+attrs.price+'</div><add style="position: absolute; right: 4px; bottom: -4px; background: #62cf60; font-size: 12px; color: #FFF; padding: 0px 5px; height: 20px; width: 20px; border-radius: 20px;"><i class="fa fa-plus"></i></add></div>');
            element.append('<div class="hscroller-label">'+attrs.name+'</div>');
          }
          else{
            element.append('<div style="position: relative"><pre-img ratio="_1_1"><img class="hscroller-img" style="filter: grayscale(70%);" src="'+attrs.image+'" spinner-on-load/></pre-img><div style="position: absolute; right: 0px; top: 4px; background: rgba(167, 29, 43, 0.4); font-size: 12px; color: #FFF; padding: 0px 4px"><i class="fa fa-inr" style="font-size: 10px; padding-right: 2px"></i>'+attrs.price+'</div><add style="position: absolute; right: 4px; bottom: -4px; background: #b2b2b2; font-size: 12px; color: #FFF; padding: 0px 8px; height: 20px; width: 20px; border-radius: 20px;"><i class="fa fa-exclamation"></i></add></div>');
            element.append('<div class="hscroller-label" style="color: #830d19">'+attrs.name+'</div>');
          }
          var animationClass = 'hscroller-card-animated-' + attrs.index.toString();
          element.addClass(animationClass);

        },

      }
    }]);

})(window.ionic);
