app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory.vendors', {
      url: "/vendors",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.vendors.html',
          controller: 'businessManagement.productsInventory.vendors',
        }
      }
    })
});

app.controller("businessManagement.productsInventory.vendors.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.serviceSearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };


  console.log($scope.tab);





  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data;
    console.log('aaaaaaaaaaaa', $scope.tab.data);
    $scope.form.contactDoc = emptyFile;
  } else {
    $scope.mode = 'new';
    $scope.form = {
      'contactPersonName': '',
      'contactPersonNumber': '',
      'contactDoc': emptyFile,
      'paymentTerm': '',
      'service': ''
    }
  }



  $scope.save = function() {
    console.log('entered');
    var f = $scope.form;
    var url = '/api/POS/vendorProfile/';
    var fd = new FormData();
    if (f.contactDoc != emptyFile && typeof f.contactDoc != 'string') {
      fd.append('contactDoc', f.contactDoc)
    }

    fd.append('contactPersonName', f.contactPersonName);
    fd.append('contactPersonNumber', f.contactPersonNumber);
    // fd.append('contactDoc', f.contactDoc);
    fd.append('paymentTerm', f.paymentTerm);
    fd.append('service', f.service.pk)

    console.log(fd);
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += f.pk + '/'
    }


    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved')
    })
  }


});

app.controller("businessManagement.productsInventory.vendors.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {


  $scope.data = $scope.tab.data;
  console.log('gfghfhgfh', $scope.data);

  $scope.products = [];
  $http({
    method: 'GET',
    url: '/api/POS/vendorServices/?vendor=' + $scope.data.pk,
  }).
  then(function(response) {
    $scope.products = response.data;
    for (var i = 0; i < $scope.products.length; i++) {
      $scope.products[i].data = $scope.products[i].product;
    }



    console.log('reeeeeeeeeeeee', response.data);
  })



  //  if (typeof $scope.products == 'string') {
  //   $scope.products = JSON.parse($scope.products)
  //   console.log('aaaaaaaaaaa',$scope.products);
  // }

  $scope.addTableRow = function() {
    $scope.products.push({
      rate: 0,
      fulfilmentTime: 0,
      logistics: 0,
      data: ''

    });
    console.log($scope.products);
  }
  $scope.deleteTable = function(index) {
    $scope.products.splice(index, 1);
  };

  $scope.productSearch = function(query) {
    console.log("called");
    return $http.get('/api/POS/product/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }


  $scope.saveVenderServiceForm = function() {

    for (var i = 0; i < $scope.products.length; i++) {

      var toSend = {
        product: $scope.products[i].data.pk,
        rate: $scope.products[i].rate,
        fulfilmentTime: $scope.products[i].fulfilmentTime,
        logistics: $scope.products[i].logistics,
        vendor: $scope.data.pk
      }

      var url = '/api/POS/vendorServices/';
      var method = 'POST';
      if ($scope.products[i].pk != undefined) {
        url += $scope.products[i].pk + '/';
        method = 'PATCH';
      }

      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i) {
        return function(response) {
          $scope.products[i].pk = response.data.pk;
          Flash.create('success', 'Saved');
        }
      })(i))
    }
  }



});


app.controller("businessManagement.productsInventory.vendors", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.productsInventory.vendors.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/POS/vendorProfile/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'vendorsEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'vendorsInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })
        // if (appType == 'vendorsInfo') {
        //   $http({
        //     method: 'GET',
        //     url: '/api/POS/vendorServices/?vendor='+$scope.data.tableData[i].pk,
        //   }).
        //   then(function(response) {
        //     $scope.products = response.data;
        //     console.log('reeeeeeeeeeeee',response.data);
        //   })
        // }
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

});
