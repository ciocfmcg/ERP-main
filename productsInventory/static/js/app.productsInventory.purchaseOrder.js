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

app.controller("businessManagement.productsInventory.purchaseOrder.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = $scope.tab.data;
  console.log('gfghfhgfh', $scope.data);

  if (typeof $scope.data.products == 'string') {
    $scope.data.products = JSON.parse($scope.data.products)
  }

  $scope.addTableRow = function() {
    $scope.data.products.push({
      rate: 0,
      qty: 0,
      product: '',
    });
    console.log($scope.data.products);
  }
  $scope.deleteTable = function(index) {
    $scope.data.products.splice(index, 1);
  };




  $scope.saveOrderForm = function() {

    var purchase = [];


    for (var i = 0; i < $scope.data.products.length; i++) {
      // $scope.data.products[i]
      purchase.push({
        product: $scope.data.products[i].product.pk,
        qty: $scope.data.products[i].qty,
        rate: $scope.data.products[i].rate
      })
    }
    console.log('pbc', purchase);


    var toSend = {
      products: JSON.stringify(purchase),
      status : $scope.data.status,
    }
    console.log(toSend);
    var url = '/api/POS/purchaseOrder/' + $scope.data.pk + '/';

    $http({
      method: 'PATCH',
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');

    })
  }

  $scope.saveStatus = function() {
    var toSend = {
      status : $scope.data.status,
    }
    var url = '/api/POS/purchaseOrder/' + $scope.data.pk + '/';
    $http({
      method: 'PATCH',
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    })
  }




  $scope.productSearch = function(query) {
    console.log("called");
    return $http.get('/api/POS/product/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

  $scope.getTotalRate = function() {

    if ($scope.data.products == undefined) {
      return 0;
    }

    var total = 0;
    for (var i = 0; i < $scope.data.products.length; i++) {

      total += $scope.data.products[i].qty * $scope.data.products[i].rate;
    }

    return total;
  }

  $scope.status = ["created", "sent", "returned","cancelled"];

});

app.controller("productsInventory.purchaseOrder.modelForm", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, data, POs) {


  $scope.POs = POs;
  $scope.data = data;


  for (var i = 0; i < $scope.POs.length; i++) {
    if ($scope.POs[i] == undefined) {
      continue;
    }

    $scope.POs[i].total = 0;


    for (var k = 0; k < $scope.POs[i].products.length; k++) {
      $scope.POs[i].total += $scope.POs[i].products[k].qty * $scope.POs[i].products[k].rate;
    }


    for (var j = 0; j < $scope.data.length; j++) {
      if ($scope.data[j].vendor == undefined) {
        continue;
      }
      // $scope.data[i].vendor.vendor.service.pk = $scope.POs[j].vendor;
      if ($scope.POs[i].vendor == $scope.data[j].vendor.vendor.service.pk) {

        $scope.POs[i].vendor = $scope.data[j].vendor.vendor.service;
        break;
      }
    }
  }

  for (var i = 0; i < $scope.POs.length; i++) {
    if (typeof $scope.POs[i].products == 'object') {
      for (var j = 0; j < $scope.POs[i].products.length; j++) {
        $http({
          method: 'GET',
          url: '/api/POS/product/' + $scope.POs[i].products[j].product + '/',
        }).
        then((function(i, j) {
          return function(response) {
            $scope.POs[i].products[j].product = response.data;
          }
        })(i, j))
      }

    }
  }


  $scope.create = function() {
    for (var i = 0; i < $scope.POs.length; i++) {
      var total = 0
      for (var j = 0; j < $scope.POs[i].products.length; j++) {
        total += ($scope.POs[i].products[j].qty * $scope.POs[i].products[j].rate)
      }
      var toSend = {
        totalamount: total,
        products: JSON.stringify($scope.POs[i].products),
        status: $scope.POs[i].status,
        service: $scope.POs[i].vendor.pk,

      }
      var url = '/api/POS/purchaseOrder/';
      var method = 'POST';

      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i, index) {
        return function(response) {
          for (var k = 0; k < $scope.data.length; k++) {
            if ($scope.data[k].vendor != undefined && $scope.data[k].vendor.vendor.service.pk == $scope.POs[i].vendor.pk) {
              $scope.data[k].vendor = undefined;
            }
          }
          $scope.POs[i].pk = response.data.pk;
          Flash.create('success', 'Saved');
        }
      })(i))
    }
  }

  $scope.deleteVendor = function(index) {

    for (var i = 0; i < $scope.data.length; i++) {
      if ($scope.data[i].vendor != undefined && $scope.data[i].vendor.vendor.service.pk == $scope.POs[index].vendor.pk) {
        $scope.data[i].vendor = undefined;
      }
    }
    $scope.POs.splice(index, 1);

  };



  for (var i = 0; i < $scope.POs.length; i++) {
    $http({
      method: 'GET',
      url: '/api/POS/vendorProfile/?service=' + $scope.POs[i].vendor.pk,
    }).
    then((function(i) {
      return function(response) {
        $scope.POs[i].detail = response.data[0];
      }
    })(i))

  }




});

app.controller("businessManagement.productsInventory.purchaseOrder.items", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $http({
    method: 'GET',
    url: '/api/POS/purchaseOrder/',
  }).
  then(function(response) {
    $scope.orders = response.data;
    if (typeof $scope.data.products == 'string') {
      $scope.data.products = JSON.parse($scope.data.products)
    }
  })




});

app.controller("businessManagement.productsInventory.purchaseOrder", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.productsInventory.purchaseorders.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/POS/purchaseOrder/',
    searchField: 'service',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'ordersEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'ordersInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }


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

    $scope.maxPage = parseInt($scope.productsToOrder.length / 10)

  })

  $scope.$watch('productInView', function(newValue, oldValue) {
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

  $scope.selectVendor = function(vendor) {
    for (var i = 0; i < $scope.productsToOrder.length; i++) {
      if ($scope.productsToOrder[i].pk == $scope.productInView.pk) {
        $scope.productsToOrder[i].vendor = vendor;
        $scope.productInView.vendor = vendor;
      }
    }
  }

  $scope.nextPage = function() {
    if ($scope.pageNo < $scope.maxPage) {
      $scope.pageNo += 1;
    }
  }
  $scope.prevPage = function() {

    if ($scope.pageNo > 0) {
      $scope.pageNo -= 1;
    }
  }

  $scope.$watch('pageNo', function(newValue, oldValue) {
    if ($scope.productInView == undefined) {
      return;
    }
    $scope.productInView = $scope.productsToOrder[10 * newValue];
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
          POs.push({
            vendor: $scope.productsToOrder[i].vendor.vendor.service.pk,
            products: [{
              product: $scope.productsToOrder[i].pk,
              qty: $scope.productsToOrder[i].qty,
              rate: $scope.productsToOrder[i].vendor.rate
            }]
          })
        } else {
          POs[alreadyIndex].products.push({
            product: $scope.productsToOrder[i].pk,
            qty: $scope.productsToOrder[i].qty,
            rate: $scope.productsToOrder[i].vendor.rate
          })
        }




      }
    }

    console.log(POs);
    console.log(POs.length);


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.productsInventory.purchaseorders.modelForm.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        POs: function() {
          return POs;
        },
        data: function() {
          return $scope.productsToOrder;
        }
      },

      controller: "productsInventory.purchaseOrder.modelForm",
    }).result.then(function() {
      console.log('abccccccccccccc', POs);
    }, function() {
      // $rootScope.$broadcast('forceRefetch' , {});
    });




  }









});
