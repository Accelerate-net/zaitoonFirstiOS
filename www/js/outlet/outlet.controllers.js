angular.module('outlet.controllers', [])



.controller('BranchCtrl', function($ionicLoading, ConnectivityMonitor, $rootScope, $scope, $http, $ionicPopup, $state) {


	//Network Status
	if(ConnectivityMonitor.isOffline()){
		$scope.isOfflineFlag = true;
	}
	else{
		$scope.isOfflineFlag = false;
	}

	$scope.close = function() {
		$state.go('main.app.feed.arabian');
  	};

			//Get all the outlets
			$http.get('https://www.zaitoon.online/services/fetchbranches.php')
			.then(function(response){
						$scope.branches = response.data.response;
						console.log($scope.branches)
			});

})



.controller('outletCtrl', function($scope, $http, $state, $rootScope, $ionicPopup, outlet, $cordovaLaunchNavigator, ShoppingCartService, $ionicLoading) {
	$scope.dateList = [];

	//Pre-populate time and date list:

	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var i = 0;
	var today = new Date();
	var dd, mm, yyyy;
	while(i < 7){

		var date = new Date();
		date.setDate(today.getDate() + i);

		dd = date.getDate();
		mm = date.getMonth()+1;
		yyyy = date.getFullYear();

		//Format Date and Month
		if(dd<10){
    	dd='0'+dd;
		}
		if(mm<10){
		   mm='0'+mm;
		}

		if(i == 0){ //Today
			$scope.dateList.push({value: dd+'-'+mm+'-'+yyyy, name:"Today, "+date.getDate()+' '+months[date.getMonth()]});
		}
		else if(i == 1){ //Tomorrow
			$scope.dateList.push({value: dd+'-'+mm+'-'+yyyy, name:"Tomorrow, "+date.getDate()+' '+months[date.getMonth()]});
		}
		else{ //Day Name
			$scope.dateList.push({value: dd+'-'+mm+'-'+yyyy, name:days[date.getDay()]+", "+date.getDate()+' '+months[date.getMonth()]});
		}
		i++;
	}


	$scope.timeDefaultList = [
		{
			value:"1230",
			name:"12:30 PM"
		},
		{
			value:"1300",
			name:"01:00 PM"
		},
		{
			value:"1330",
			name:"01:30 PM"
		},
		{
			value:"1400",
			name:"02:00 PM"
		},
		{
			value:"1430",
			name:"02:30 PM"
		},
		{
			value:"1500",
			name:"03:00 PM"
		},
		{
			value:"1530",
			name:"03:30 PM"
		},
		{
			value:"1600",
			name:"04:00 PM"
		},
		{
			value:"1630",
			name:"04:30 PM"
		},
		{
			value:"1700",
			name:"05:00 PM"
		},
		{
			value:"1730",
			name:"05:30 PM"
		},
		{
			value:"1800",
			name:"06:00 PM"
		},
		{
			value:"1830",
			name:"06:30 PM"
		},
		{
			value:"1900",
			name:"07:00 PM"
		},
		{
			value:"1930",
			name:"07:30 PM"
		},
		{
			value:"2000",
			name:"08:00 PM"
		},
		{
			value:"2030",
			name:"08:30 PM"
		},
		{
			value:"2100",
			name:"09:00 PM"
		},
		{
			value:"2130",
			name:"09:30 PM"
		},
		{
			value:"2200",
			name:"10:00 PM"
		}

	];

	//Set Time List to display
	$scope.timeList = $scope.timeDefaultList;

	//Remove past time slots
	var currentTime = today.getHours();
	if(currentTime > 12){
		var startIndex = 2*(currentTime - 12);

		//Say, if it's already 9.25 pm do not show 9.30 in the time slot. Skip Index.
		if(today.getMinutes() > 25)
			startIndex++;

		if(startIndex < 20){ //If time is less 10 pm (say upto 9.59 pm)
			$scope.timeList = $scope.timeList.slice(startIndex, 21);
		}
	}


	//Remove TODAY option if it's already 10 PM in the night.
	if(today.getHours() >= 22 && today.getMinutes() > 1){
		$scope.dateList = $scope.dateList.splice(1, 6);
	}

	$scope.fetchTimeslots = function(data){
		$scope.dateSelected = data.dateSelected;

		//If the date is TODAY, and remove time slots already passed.
		var todayDate = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
		if(data.dateSelected.value != todayDate){
			$scope.timeList = $scope.timeDefaultList;
			$scope.timeSelected = $scope.timeList[0];
		}
		else
		{
			//Remove past time slots
			var currentTime = today.getHours();
			if(currentTime > 12){
				var startIndex = 2*(currentTime - 12);

				//Say, if it's already 9.25 pm do not show 9.30 in the time slot. Skip Index.
				if(today.getMinutes() > 25)
					startIndex++;

				if(startIndex < 20){ //If time is less 10 pm (say upto 9.59 pm)
					$scope.timeList = $scope.timeList.slice(startIndex, 21);
				}
			}
			$scope.timeSelected = $scope.timeList[0];
		}
	}

	//To update the time slot
	$scope.updateTimeSlot = function(data){
		$scope.timeSelected = data.timeSelected;
	}


	//Date and Time DEFAULT options
	$scope.dateSelected = $scope.dateList[0];
	$scope.timeSelected = $scope.timeList[0];

	$scope.goBack = function() {
		var previous_view = _.last($rootScope.previousView);
		$state.go(previous_view.fromState, previous_view.fromParams );
	};


	$scope.bookTable = function(outlet){

		//Check if not logged in
		if(_.isUndefined(window.localStorage.user) && window.localStorage.user !=""){
			$ionicLoading.show({
				template:  'Please login to make a table reservation',
				duration: 3000
			});
			$state.go('intro.auth-login');
		}
		else{


		$scope.count = {};
		$scope.count.persons = 2;

		schedulesPopup = $ionicPopup.show({
			cssClass: 'popup-outer edit-shipping-address-view',
			templateUrl: 'views/common/partials/table-reservation-popup.html',
			scope: angular.extend($scope, {}),
			title: 'Book Table',
			buttons: [
				{
					text:'Cancel'
				},
				{
					text:'Confirm',
					onTap: function(e) {

									var reservation = {
										"outlet":outlet,
										"date": $scope.dateSelected.value,
										"time": $scope.timeSelected.value,
										"count":$scope.count.persons
									};

									var data = {};
									data.token = JSON.parse(window.localStorage.user).token;
									data.details = reservation;

									console.log(data.details)

									$http({
										method  : 'POST',
										url     : 'https://www.zaitoon.online/services/newreservation.php',
										data    : data,
										headers : {'Content-Type': 'application/x-www-form-urlencoded'},
										timeout : 10000
									 })
									.success(function(response) {
										if(response.status){
											$ionicLoading.show({
												template:  '<b style="font-size: 150%">It\'s confirmed!</b><br>We will reserve enough tables for you.',
												duration: 3000
											});
										}
										else{
											$ionicLoading.show({
												template:  '<b style="font-size: 150%; color: #f1c40f">Oops!</b><br>'+response.error,
												duration: 3000
											});
										}

									})
									.error(function(data){
					            $ionicLoading.show({
					              template:  "Not responding. Check your connection.",
					              duration: 3000
					            });
					        });
			        }
			    }
			]
		});

	} //else

	}


	$scope.info = outlet;


	$scope.$on('mapInitialized', function(event, map) {
		// If we want to access the map in the future
		$scope.map = map;
	});
	
  $scope.launchNavigator = function(latitude, longitude) {
    var destination = [latitude, longitude];
	var start = "Trento";
    $cordovaLaunchNavigator.navigate(destination, start).then(function() {
      console.log("Navigator launched");
    });
  };
		
})


;
