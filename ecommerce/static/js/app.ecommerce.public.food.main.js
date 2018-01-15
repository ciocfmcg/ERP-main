app.controller('ecommerce.main' , function($scope , $state , $http , $timeout , $uibModal , $users , $interval , Flash){
  $scope.me = $users.get('mySelf')

  $scope.inCart = [];
  $scope.data = {location : null}
  $scope.showFeedback = false;

  var locationID = $.cookie("locationID");
  $scope.params = {location : null} // to be used to store different parameter by the users on which the search result will be filtered out

  if (typeof $.cookie("cart") != 'undefined') {
    var inCart = $.cookie("cart").split('||');
    var inCartQuant = $.cookie("quant").split('||');

    for (var i = 0; i < inCart.length; i++) {
      if (inCart[i].length >0) {
        $http({method : 'GET' , url : '/api/ecommerce/listingLite/' + inCart[i] + '/'}).
        then((function(i) {
          return function(response) {
            l = response.data;
            l.inCart = parseInt(inCartQuant[i]);
            var index = 0
            if (l.providerOptions.length == 0) {
              return;
            }
            var min = l.providerOptions[index].rate;
            for (var j = 1; j < l.providerOptions.length; j++) {
              if (l.providerOptions[j].rate < min) {
                min = l.providerOptions[j].rate;
                index = j;
              }
            }
            l.bestOffer = l.providerOptions[index];
            $scope.inCart.push(l)
          }
        })(i))
      }
    }
  }

  if (typeof locationID != 'undefined') {
    $http({method : 'GET' , url : '/api/ecommerce/locationDetails/?id=' + locationID}).
    then(function(response){
      console.log("Setting the location from cookie");
      $scope.params.location = response.data.result;
      $scope.data.location = {description : response.data.result.name , place_id : locationID}
    });
  }

  $scope.decreaseInCart = function(index) {
    $scope.inCart[index].inCart -= 1;
    if ($scope.inCart[index].inCart == 0) {
      $scope.inCart.splice(index , 1);
    }
  }

  $scope.increaseInCart = function(index) {
    $scope.inCart[index].inCart += 1;
  }

  $scope.fetchGenericProducts = function(){
    url = '/api/ecommerce/genericProductLite'
    $http({method : "GET" , url : url}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        $scope.genericProducts = response.data;
      }

    });
  }

  $scope.$watch('inCart', function (newVal, oldVal) {
    var toStore = '';
    var quanToStore = '';
    for (var i = 0; i < $scope.inCart.length; i++) {
      toStore += $scope.inCart[i].pk + '||';
      quanToStore += $scope.inCart[i].inCart + '||';
    }
    if (toStore.length !=0) {
      $.cookie("cart" , toStore );
      $.cookie("quant" , quanToStore );
    }

  }, true);

  $scope.genericProducts = [];

  $scope.fetchGenericProducts()

  $scope.checkout = function() {
    if ($scope.me == null) {
      window.location.href = '/login?next=/ecommerce/#/checkout/';
    }

    if ($scope.inCart.length ==0) {
      return;
    }else {
      $state.go('checkout')
    }
  }


  $scope.getCartAmmount = function() {
    var toReturn = 0;
    for (var i = 0; i < $scope.inCart.length; i++) {
      toReturn += $scope.inCart[i].bestOffer.rate*$scope.inCart[i].inCart;
    }
    return toReturn;
  }

  $scope.slide = {banners : [] , active : 0};

  $http({method : 'GET' , url : '/api/ecommerce/offerBanner/'}).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      s = response.data[i].params;
      s = s.split(':')[1];
      s = s.split('}')[0];
      response.data[i].params = {id : parseInt(s)}
    }
    $scope.slide.banners = response.data;
  })
  $scope.changeSlide = function(index){
    $scope.slide.active = index;
  }

  $interval(function () {
    $scope.slide.active += 1;
    if ($scope.slide.active == 5) {
      $scope.slide.active = 0;
    }
  }, 5000);

  $scope.feedback = {email : '' , mobile : null , message : ''};

  $scope.sendFeedback = function() {
    dataToSend = {
      email : $scope.feedback.email,
      mobile : $scope.feedback.mobile,
      message : $scope.feedback.message,
    }

    $http({method : 'POST' , url : '/api/ecommerce/feedback/' , data : dataToSend }).
    then(function(response) {
      Flash.create('success', 'Thank you!');
      $scope.feedback = {email : '' , mobile : null , message : ''};
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.settings = {};
  $http({method : 'GET' , url : '/api/ERP/appSettings/?app=25'}).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      $scope.settings[response.data[i].name] = response.data[i].value;
    }
  })

  $scope.data.pickUpTime = null;
  $scope.data.dropInTime = null;

  $http({method : 'GET' , url : '/api/ecommerce/saved/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].category=='cart'){
        $scope.inCart.push(response.data[i])
      }
    }
  })

  $scope.headerUrl = '/static/ngTemplates/app.ecommerce.food.header.html';
  $scope.footerUrl = '/static/ngTemplates/app.ecommerce.footer.html';

  $scope.$watch('data.location' , function(newValue, oldValue){
    if (newValue != null && typeof newValue =='object') {
      console.log("Adding location to cookie");
      $.cookie("locationID" , newValue.place_id);
      $http({method : 'GET' , url : '/api/ecommerce/locationDetails/?id=' + newValue.place_id}).
      then(function(response){
        $scope.params.location = response.data.result;
      })
    }else {
      $scope.params.location = null;
    }
  }, true);

  $scope.getLocationSuggeations = function(query){
    return $http.get('/api/ecommerce/suggestLocations/?query=' + query).
    then(function(response){
      return response.data.predictions;
    })
  }


  $scope.refreshResults = function(){
    if ($state.is('ecommerce') && $scope.params.location == null) {
      Flash.create('danger', " No location selected");
      return;
    }
    $state.go('list' , {} , {reload : true})
    // if (angular.isDefined($scope.$$childHead.fetchListings)) {
    //   $scope.$$childHead.fetchListings()
    // }else {
    //   $scope.$$childTail.fetchListings()
    // }
  }




});

app.controller('controller.ecommerce.pages' , function($scope , $state , $http , $timeout , $uibModal , $users , $interval , Flash , $window , $log){
  $scope.templateUrl = '/static/ngTemplates/app.ecommerce.pages.'+ $state.params.title + '.html' ;
  $window.scrollTo(0,0);
  $scope.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 6 };
  $scope.marker = {
    id: 0,
    coords: {
      latitude: 40.1451,
      longitude: -99.6680
    },
  };
  $scope.windowOptions = {
    visible: false,
  };

})
