app.controller('controller.ecommerce.list', function($scope, $state, $http, $users, Flash, $stateParams, $window) {
  console.log("loaded");

  console.log($scope.$parent);

  $scope.$parent.showFeedback = false;

  var locationID = $.cookie("locationID");

  if (typeof locationID != 'undefined') {
    $http({method : 'GET' , url : '/api/ecommerce/locationDetails/?id=' + locationID}).
    then(function(response){
      $scope.$parent.params.location = response.data.result;
      $scope.fetchListings();
    });
  }else {
    Flash.create('danger', 'No location provided')
    $state.go('ecommerce')
  }

  $scope.addToCart = function(index) {
    $scope.listings[index].inCart = 1;
    $scope.$parent.inCart.push($scope.listings[index]);
  }


  $scope.increaseInCart = function(index) {
    $scope.listings[index].inCart += 1;
  }

  $scope.decreaseInCart = function(index) {
    $scope.listings[index].inCart -= 1;
    if ($scope.listings[index].inCart  == 0) {
      for (var i = 0; i < $scope.$parent.inCart.length; i++) {
        if ($scope.$parent.inCart[i].pk == $scope.listings[index].pk ) {
          $scope.$parent.inCart.splice(i,1);
        }
      }
    }
  }


  $scope.fetchListings = function() {
    url = '/api/ecommerce/listingSearch/?category=' + $stateParams.id
    $scope.listings = [];
    console.log($scope.$parent.params);
    if ($scope.$parent.params.location != null) {
      l = $scope.$parent.params.location.geometry.location
      console.log(l);
      if (typeof l != 'undefined' && l != null && typeof l != 'string') {
        // pin = parent.params.location.formatted_address.match(/[0-9]{6}/);
        lat = l.lat
        lon = l.lng
        url += '&lat=' + lat + '&lon=' + lon;
      }else {
        return;
      }
    }
    $http({
      method: "GET",
      url: url
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        l = response.data[i];
        l.specifications = JSON.parse(l.specifications);
        l.inCart = 0;
        console.log(l.specifications);
        index = 0
        if (l.providerOptions.length == 0) {
          continue;
        }
        min = l.providerOptions[index].rate;
        for (var j = 1; j < l.providerOptions.length; j++) {
          if (l.providerOptions[j].rate < min) {
            min = l.providerOptions[j].rate;
            index = j;
          }
        }
        l.bestOffer = l.providerOptions[index];

        for (var j = 0; j < $scope.$parent.inCart.length; j++) {
          if ($scope.$parent.inCart[j].pk == l.pk) {
            l.inCart = $scope.$parent.inCart[j].inCart;
            $scope.$parent.inCart[j] = l;
          }
        }
        $scope.listings.push(l);

      }
      $scope.$parent.cartDetails = true;
      $window.scrollTo(0,0);
    }, function(response) {
      // Flash.create('danger', 'No location provided')
      // $state.go('ecommerce')
    })
  }

  $scope.listings = [];
  $scope.me = $users.get('mySelf');


  $scope.fetchListings()


});
