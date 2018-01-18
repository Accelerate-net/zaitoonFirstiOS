angular.module('filters.controllers', [])

.controller('FiltersCtrl', function($scope, $state, $rootScope, $ionicSlideBoxDelegate) {

	//For Non Veg Content
	$rootScope.nonvegUser = true;

	//For VEG or NON-VEG
	$rootScope.typevalue = '';
	$scope.category_filter = '';
	$scope.clearFlag = false;
	$scope.clearVegFlag	= false;
	$scope.clearNonVegFlag	= false;

	$scope.typeSelected = function(){
		$scope.clearFlag = true;
		if($scope.category_filter == 'VEG'){
			$rootScope.typevalue = 'VEG';
			$scope.clearVegFlag	= true;
			$scope.clearNonVegFlag	= false;

			//reset Non Veg Filters
			this.clearNonFilter();
		}
		else{
			$rootScope.typevalue = 'NONVEG';
			$scope.clearNonVegFlag	= true;
			$scope.clearVegFlag	= false;

			this.setNonFilter();
		}

	}



	$scope.resetVegNonVeg = function(){
		$scope.clearFlag = false;
		$scope.clearVegFlag	= false;
		$scope.clearNonVegFlag	= false;
		$scope.category_filter = '';
		$rootScope.typevalue = '';

		this.setNonFilter();
	}

	$scope.clearNonFilter = function(){
		$rootScope.nonvegUser = false;
		$scope.nonvegcontent_filter.chicken = false;
		$scope.nonvegcontent_filter.mutton = false;
		$scope.nonvegcontent_filter.fish = false;
		$scope.nonvegcontent_filter.prawns = false;
		$scope.nonvegcontent_filter.egg = false;
	}

	$scope.setNonFilter = function(){
		$rootScope.nonvegUser = true;
	}


	//NonVeg Contents.
	$rootScope.nonvegcontent_filter = {};
	$rootScope.nonvegcontent_filter.chicken = false;
	$rootScope.nonvegcontent_filter.mutton = false;
	$rootScope.nonvegcontent_filter.fish = false;
	$rootScope.nonvegcontent_filter.prawns = false;
	$rootScope.nonvegcontent_filter.egg = false;



	//Cooking Type
	$rootScope.type_filter = {};
	$rootScope.type_filter.gravy = false;
	$rootScope.type_filter.semi = false;
	$rootScope.type_filter.dry = false;
	$rootScope.type_filter.deep = false;


	//Spice Level
	$scope.spice_filter = {};
	$scope.spice_filter = 'any';
	$rootScope.spice = 'any';

	//Bone Type
	$scope.bone_filter = {};
	$scope.bone_filter = 'any';
	$rootScope.bone = 'any';

	//Fry Type
	$scope.fry_filter = {};
	$scope.fry_filter = 'any';
	$rootScope.fry = 'any';


	$scope.spiceSelected = function(){
		if($scope.spice_filter=='spicy')
			$rootScope.spice = 'spicy';
		else if($scope.spice_filter=='sweeened')
			$rootScope.spice = 'sweeened';
		else if($scope.spice_filter=='non')
			$rootScope.spice = 'non';
	}

	$scope.boneSelected = function(){
		if($scope.bone_filter=='bone')
			$rootScope.bone = 'bone';
		else if($scope.bone_filter=='boneless')
			$rootScope.bone = 'boneless';
	}

	$scope.frySelected = function(){
		if($scope.fry_filter=='tawa')
			$rootScope.fry = 'tawa';
		else if($scope.fry_filter=='oil')
			$rootScope.fry = 'oil';
	}

	$scope.cancelRefine = function(){
		var previous_view = _.last($rootScope.previousView);
		$state.go(previous_view.fromState, previous_view.fromParams );
	};

	$scope.applyRefine = function(){
		//Create the Filter Object
		if($rootScope.typevalue == ''){
			var vegtype={
				"showVeg" : true,
				"showNonVeg" : true
			}
		}
		else if($rootScope.typevalue == 'VEG'){
			var vegtype={
				"showVeg" : true,
				"showNonVeg" : false
			}
		}
		else if($rootScope.typevalue == 'NONVEG'){
			var vegtype={
				"showVeg" : false,
				"showNonVeg" : true
			}
		}


		//Content Obj.
		if($rootScope.nonvegcontent_filter.chicken || $rootScope.nonvegcontent_filter.mutton || $rootScope.nonvegcontent_filter.fish || $rootScope.nonvegcontent_filter.prawns || $rootScope.nonvegcontent_filter.egg)
		{
			var contains = {
			"skip" : false,
			"chicken" : $rootScope.nonvegcontent_filter.chicken,
			"mutton" : $rootScope.nonvegcontent_filter.mutton,
			"fish" : $rootScope.nonvegcontent_filter.fish,
			"prawns" : $rootScope.nonvegcontent_filter.prawns,
			"egg" : $rootScope.nonvegcontent_filter.egg
			}
		}
		else{
			var contains = {
			"skip" : true
			}
		}


		//Spice Level Obj.
		var spicelevel = {
			"skip" : $rootScope.spice == 'any' ? true : false,
			"spicy" : $rootScope.spice == 'spicy' ? true : false,
			"sweeened" : $rootScope.spice == 'sweeened' ? true : false,
			"non" :  $rootScope.spice == 'non' ? true : false
		}

		//Cooking Type
		if($rootScope.type_filter.gravy || $rootScope.type_filter.semi || $rootScope.type_filter.dry || $rootScope.type_filter.deep)
		{
			var cookingtype = {
			"skip" : false,
			"gravy" : $rootScope.type_filter.gravy,
			"semi" : $rootScope.type_filter.semi,
			"dry" : $rootScope.type_filter.dry,
			"deep" : $rootScope.type_filter.deep
			}
		}
		else{
			var cookingtype = {
			"skip" : true
			}
		}

 		//Bone Type
 		var boneless = {
			"skip" : $rootScope.bone == 'any' ? true : false,
			"bone" : $rootScope.bone == 'bone' ? true : false,
			"boneless" : $rootScope.bone == 'boneless' ? true : false
		}

		//Fry Type
 		var frytype = {
			"skip" : $rootScope.fry == 'any' ? true : false,
			"oilfry" : $rootScope.fry == 'oil' ? true : false,
			"tawafry" : $rootScope.fry == 'tawa' ? true : false
		}

		var sampleFilter = {
			"vegtype" : vegtype,
			"contains" : contains,
			"spicelevel" : spicelevel,
			"frytype" : frytype,
			"cookingtype" : cookingtype,
			"boneless" : boneless
		}

		$rootScope.$broadcast('filter_applied', sampleFilter);

		var previous_view = _.last($rootScope.previousView);
		$state.go(previous_view.fromState, previous_view.fromParams );
	};


	$scope.lockSlide = function () {
    	$ionicSlideBoxDelegate.$getByHandle('filter-tabs-slider').enableSlide(false);
  	};
})

;
