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


  $scope.companyAdvanceOptions = false;
  $scope.showCreateCompanyBtn = false;
  $scope.companyExist = false;
  $scope.showCompanyForm = false;


  $scope.$watch('form.company', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCompanyBtn = true;
      $scope.companyExist = false;
      $scope.showCompanyForm = false;
    } else if (typeof newValue == "object") {
      $scope.companyExist = true;
    } else {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
      $scope.companyExist = false;
    }

  });

  $scope.createCompany = function() {
    if ($scope.companyExist) {
      $scope.showCompanyForm = true;
      $scope.showCreateCompanyBtn = false;
      return
    }

    if (typeof $scope.form.company == "string" && $scope.form.company.length > 1) {
      var dataToSend = {
        name: $scope.form.company,
        user: $scope.me.pk
      }
      $http({
        method: 'POST',
        url: '/api/ERP/service/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success', 'Created');
      })
    } else {
      Flash.create('warning', 'Company name too small')
    }
  }


  $scope.updateCompanyDetails = function() {
    if (typeof $scope.form.company != "object") {
      Flash.create('warning', "Company's basic details missing")
      return
    }

    if ($scope.form.company.address != null && typeof $scope.form.company.address == 'object') {
      var method = 'POST';
      var url = '/api/ERP/address/'
      if (typeof $scope.form.company.address.pk == 'number') {
        method = 'PATCH'
        url += $scope.form.company.address.pk + '/'
      }
      $http({
        method: method,
        url: url,
        data: $scope.form.company.address
      }).
      then(function(response) {
        $scope.form.company.address = response.data;
        var dataToSend = $scope.form.company;
        dataToSend.address = response.data.pk;

        $http({
          method: 'PATCH',
          url: '/api/ERP/service/' + $scope.form.company.pk + '/',
          data: dataToSend
        }).
        then(function(response) {
          $scope.form.company = response.data;
          Flash.create('success', 'Saved');
        });
      })
    } else {

      var dataToSend = $scope.form.company;

      $http({
        method: 'PATCH',
        url: '/api/ERP/service/' + $scope.form.company.pk + '/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success', 'Saved');
      });

    }



  }


  $scope.resetForm = function() {
    $scope.form = {
      'contactPersonName': '',
      'contactPersonNumber': '',
      'contactDoc': emptyFile,
      'paymentTerm': '',
      'company': ''
    }
  }



  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data;
    console.log('aaaaaaaaaaaa', $scope.tab.data);
    $scope.form.contactDoc = emptyFile;
    $scope.form.company = $scope.form.service;

  } else {
    $scope.mode = 'new';
    $scope.resetForm();
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
    fd.append('contactPersonEmail', f.contactPersonEmail);
    fd.append('paymentTerm', f.paymentTerm);
    fd.append('service', f.company.pk)

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
    }, function(err) {
      Flash.create('danger' , 'Profile already available, please edit')
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
    return $http.get('/api/POS/product/?limit=10&name__contains=' + query).
    then(function(response) {
      return response.data.results;
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
