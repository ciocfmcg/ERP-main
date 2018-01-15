app.controller('controller.ecommerce.checkout' , function($scope , $state, $http , $timeout , $uibModal , $users , Flash){
  $scope.me = $users.get('mySelf');
  $scope.data = {quantity : 1 , shipping :'express', stage : 'review' , address : { street : '' , pincode : '' , city : '' , state : '', mobile :'' , attachment : emptyFile}};

  $scope.retriveProfile = function() {
    $http({method : 'GET' , url : '/api/ecommerce/profile/'}).
    then(function(response){
      $scope.customerProfile = response.data[0];
      $scope.data.address = response.data[0].address;
      if (response.data[0].attachment == null || typeof response.data[0].attachment == 'undefined' || response.data[0].attachment.length == 0) {
        return;
      }
      $http({method : 'GET' , url : '/api/ecommerce/media/' + response.data[0].attachment + '/'}).
      then(function(response) {
        $scope.attachment = response.data;
        url =  $scope.attachment.attachment;
        $scope.attachment.name = url.split('/')[url.split('/').length -1]
      })
    })
  }

  $scope.retriveProfile()

  $scope.inCart = $scope.$parent.inCart;

  $scope.decreaseInCart = function(index) {
    $scope.inCart[index].inCart -= 1;
    if ($scope.inCart[index].inCart == 0) {
      $scope.inCart.splice(index , 1);
    }
  }

  $scope.increaseInCart = function(index) {
    $scope.inCart[index].inCart += 1;
  }

  $scope.next = function(){
    if ($scope.data.stage == 'review') {
      // if ($scope.data.location == null ) {
      //   msg = 'Location not selected'
      //   Flash.create('danger' , msg)
      //   return;
      // }
      $scope.data.stage = 'shippingDetails';
    } else if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'payment';
    }
  }
  $scope.prev = function(){
    if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'review';
    } else if ($scope.data.stage == 'payment') {
      $scope.data.stage = 'shippingDetails';
    }
  }

  $scope.getBookingAmount = function() {
    var toReturn = 0;
    for (var i = 0; i < $scope.inCart.length; i++) {
      toReturn += $scope.inCart[i].bestOffer.rate*$scope.inCart[i].inCart;
    }
    return toReturn;
  }


  $scope.pay = function(){

    $scope.data.stage = 'processing';
    $scope.data.location = $scope.$parent.data.location;

    var items = [];
    for (var i = 0; i < $scope.inCart.length; i++) {
      items.push({offer : $scope.inCart[i].pk , quantity : $scope.inCart[i].inCart})
    }

    dataToSend = {
      user : getPK($scope.me.url),
      items : items,
      paymentType : 'COD',
      mobile : $scope.customerProfile.mobile,
      coupon : $scope.data.coupon,
      shipping : $scope.data.shipping,
    }
    for (key in $scope.data.address) {
      if (key == 'pk') {
        continue;
      }
      dataToSend[key] = $scope.data.address[key];
    }
    $http({method : 'POST' , url : '/api/ecommerce/order/' , data : dataToSend}).
    then(function(response){
      $scope.data.stage = 'confirmation';
      $scope.data.order = response.data;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


})
