app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory.purchaseOrder', {
      url: "/purchaseOrder",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.purchaseOrder.html',
          controller: 'businessManagement.productsInventory.purchaseOrder',
        }
      }
    })
});
app.controller("businessManagement.productsInventory.purchaseOrder", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {


  $http({
    method: 'GET',
    url: '/api/POS/reorderingReport/?onlyData='
  }).
  then(function(response) {
    $scope.productsToOrder = response.data;

    for (var i = 0; i < $scope.productsToOrder.length; i++) {
      $scope.productsToOrder[i].qty = 1;
    }

    $scope.productInView = $scope.productsToOrder[0];
    $scope.pageNo = 0;

    $scope.maxPage = parseInt($scope.productsToOrder.length /10)

  })

  $scope.$watch('productInView' , function(newValue , oldValue) {
    if (newValue == undefined || newValue == null) {
      return;
    }

    // i will fetch services-> vendor profiles which are selling this product
    console.log("fetch for this : ");
    console.log(newValue);

    $http({
      method: 'GET',
      url: '/api/POS/VendorServicesLite/?product=' + newValue.pk,
    }).
    then(function(response) {
      $scope.vendors = response.data;
    })


  })

  $scope.showVendorOptions = function(item) {
    $scope.productInView = item;
  }

  $scope.selectVendor= function(vendor) {
    for (var i = 0; i < $scope.productsToOrder.length; i++) {
      if($scope.productsToOrder[i].pk == $scope.productInView.pk){
        $scope.productsToOrder[i].vendor = vendor;
        $scope.productInView.vendor = vendor;
      }
    }
  }

  $scope.nextPage = function() {
    if ( $scope.pageNo < $scope.maxPage) {
      $scope.pageNo +=1;
    }
  }
  $scope.prevPage = function() {

    if ($scope.pageNo > 0) {
      $scope.pageNo -=1;
    }
  }

  $scope.$watch('pageNo' , function(newValue , oldValue) {
    if ($scope.productInView == undefined) {
      return;
    }
    $scope.productInView = $scope.productsToOrder[10*newValue];
  })


  $scope.getTotal = function() {

    if ($scope.productsToOrder == undefined) {
      return 0;
    }

    var total = 0;
    for (var i = 0; i < $scope.productsToOrder.length; i++) {

      if ($scope.productsToOrder[i].vendor == undefined) {
        continue;
      }

      total += $scope.productsToOrder[i].qty * $scope.productsToOrder[i].vendor.rate;
    }

    return total;
  }

  $scope.save = function() {

    var POs = [];

    for (var i = 0; i < $scope.productsToOrder.length; i++) {
      if ($scope.productsToOrder[i].vendor != undefined && $scope.productsToOrder[i].qty > 0) {
        var alreadyIndex = -1;
        for (var j = 0; j < POs.length; j++) {
          if (POs[j].vendor == $scope.productsToOrder[i].vendor.vendor.service.pk) {
            alreadyIndex = j;
            break;
          }
        }

        if (alreadyIndex == -1) {
          POs.push({vendor : $scope.productsToOrder[i].vendor.vendor.service.pk , products : [{product : $scope.productsToOrder[i].pk , qty : $scope.productsToOrder[i].qty , rate : $scope.productsToOrder[i].vendor.rate }]})
        }else{
          POs[alreadyIndex].products.push({product : $scope.productsToOrder[i].pk , qty : $scope.productsToOrder[i].qty , rate : $scope.productsToOrder[i].vendor.rate })
        }




      }
    }

    console.log(POs);



  }







});
