app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory.manufacture', {
      url: "/manufacture",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.manufacture.html',
          controller: 'businessManagement.productsInventory.manufacture',
        }
      }
    })
});

app.controller("businessManagement.productsInventory.manufacture.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

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

app.controller("businessManagement.productsInventory.manufacture.reorder", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal,$uibModalInstance, $rootScope , category ,qtyReq , $rootScope) {
  console.log('ssssssssssssssssssss',category);
  $scope.category = category
  $scope.selectedVendor = ''
  $http({
    method: 'GET',
    url: '/api/POS/VendorServicesLite/?product=' + $scope.category.pk,
  }).
  then(function(response) {
    $scope.vendors = response.data;
  })
  $scope.reorder ={qty:qtyReq}
  $scope.$watch('reorder.qty', function(newValue, oldValue) {
    if (newValue < qtyReq ) {
      $scope.reorder.qty = qtyReq
    }
  });
  $scope.selectVendor = function(obj){
    $scope.selectedVendor = obj
    console.log($scope.selectedVendor);
  }
  $scope.saveReorder = function(){
    console.log($scope.reorder.qty);
    if (typeof $scope.selectedVendor != 'object') {
      Flash.create('warning', 'Please Select One Of The Vendors');
      return

    }
    $scope.selectedVendor.qty = $scope.reorder.qty
    $rootScope.$broadcast('selectedVendor', {
      vd: $scope.selectedVendor
    });
    $uibModalInstance.dismiss()

  }

})

app.controller("productsInventory.manufacture.reorderSend.modelForm", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, POs) {


  $scope.POs = POs;


  for (var i = 0; i < $scope.POs.length; i++) {
    $scope.POs[i].products = [];
    var pk = $scope.POs[i].reorderVendor.vendor.service.pk
    $scope.count = 0
    for (var j = 0; j < $scope.POs.length; j++) {
      if (pk == $scope.POs[j].reorderVendor.vendor.service.pk) {
        $scope.POs[i].products.push({product:$scope.POs[j].category,qty:$scope.POs[j].reorderVendor.qty,rate:$scope.POs[j].reorderVendor.rate})
        $scope.count = $scope.count + 1
        if ($scope.count > 1) {
          $scope.POs.splice(j,1)
        }
      }
    }



    // if ($scope.POs[i] == undefined) {
    //   continue;
    // }
    //
    //
    //
    // for (var k = 0; k < $scope.POs[i].products.length; k++) {
    //   $scope.POs[i].total += $scope.POs[i].products[k].qty * $scope.POs[i].products[k].rate;
    // }
    //
    //
    // for (var j = 0; j < $scope.data.length; j++) {
    //   if ($scope.data[j].vendor == undefined) {
    //     continue;
    //   }
    //   // $scope.data[i].vendor.vendor.service.pk = $scope.POs[j].vendor;
    //   if ($scope.POs[i].vendor == $scope.data[j].vendor.vendor.service.pk) {
    //
    //     $scope.POs[i].vendor = $scope.data[j].vendor.vendor.service;
    //     break;
    //   }
    // }


  }


  console.log('777777777777777',$scope.POs);


  $scope.showbtn = true
  $scope.create = function() {
    for (var i = 0; i < $scope.POs.length; i++) {
      var total = 0
      for (var j = 0; j < $scope.POs[i].products.length; j++) {
        total += ($scope.POs[i].products[j].qty * $scope.POs[i].products[j].rate)
      }
      var toSend = {
        totalamount: total,
        products: JSON.stringify($scope.POs[i].products),
        service: $scope.POs[i].reorderVendor.vendor.service.pk,

      }
      var url = '/api/POS/purchaseOrder/';
      var method = 'POST';

      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i) {
        return function(response) {
          $scope.POs[i].pk = response.data.pk;
          Flash.create('success', 'Saved');
        }
      })(i))
    }
    $scope.showbtn = false
  }


});

app.controller("businessManagement.productsInventory.manufacture.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {


  $scope.data = $scope.tab.data;
  console.log('gfghfhgfh', $scope.data,typeof $scope.data.compositionQtyMap);
  if (typeof $scope.data.compositionQtyMap == 'string') {
    $scope.data.compositionQtyMap = JSON.parse($scope.data.compositionQtyMap)
  }
  $scope.data.categoriesList = []
  $scope.data.totalQuantity = 1
  $scope.data.show = false

  $http({
    method: 'GET',
    url: '/api/POS/productVerient/?parent=' + $scope.data.pk
  }).
  then(function(response) {
    $scope.data.skuData = response.data;
  })
  for (var i = 0; i < $scope.data.compositions .length; i++) {
    $scope.data.categoriesList.push({
      category : $scope.data.compositions[i],
      qty : $scope.data.compositionQtyMap[i].qty
    })
  }
  $scope.$watch('data.totalQuantity', function(newValue, oldValue) {
    if (newValue < 1 ) {
      $scope.data.totalQuantity = 1
    }
  });

  $scope.reorder = function(idx){
    $scope.idx = idx
    console.log($scope.data.compositions[idx],$scope.data.categoriesList[idx]);
    $scope.qtyReq = $scope.data.totalQuantity * $scope.data.categoriesList[idx].qty - $scope.data.compositions[idx].inStock
    console.log($scope.qtyReq);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.productsInventory.manufacture.reorderForm.html',
      size: 'md',
      backdrop: true,
      resolve: {
        category: function() {
          return $scope.data.compositions[idx]
        },
        qtyReq: function() {
          return $scope.qtyReq
        }
      },
      controller: "businessManagement.productsInventory.manufacture.reorder",
    }).result.then(function() {

    }, function() {

    });
    $scope.$on('selectedVendor', function(event, input) {
      $scope.data.show = true
      console.log("recieved");
      console.log(input);
      $scope.data.categoriesList[$scope.idx].reorderVendor = input.vd
      console.log($scope.data.categoriesList);

    });
  }

  $scope.save = function() {

    var POs = [];

    for (var i = 0; i < $scope.data.categoriesList.length; i++) {
      if ($scope.data.categoriesList[i].reorderVendor != undefined) {
        POs.push($scope.data.categoriesList[i])

        // var alreadyIndex = -1;
        // for (var j = 0; j < POs.length; j++) {
        //   if (POs[j].vendor == $scope.productsToOrder[i].vendor.vendor.service.pk) {
        //     alreadyIndex = j;
        //     break;
        //   }
        // }
        //
        // if (alreadyIndex == -1) {
        //   POs.push({
        //     vendor: $scope.productsToOrder[i].vendor.vendor.service.pk,
        //     products: [{
        //       product: $scope.productsToOrder[i].pk,
        //       qty: $scope.productsToOrder[i].qty,
        //       rate: $scope.productsToOrder[i].vendor.rate
        //     }]
        //   })
        // } else {
        //   POs[alreadyIndex].products.push({
        //     product: $scope.productsToOrder[i].pk,
        //     qty: $scope.productsToOrder[i].qty,
        //     rate: $scope.productsToOrder[i].vendor.rate
        //   })
        // }

      }
    }

    console.log(POs);
    console.log(POs.length);


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.productsInventory.manufacture.reorderSend.modelForm.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        POs: function() {
          return POs;
        }
      },

      controller: "productsInventory.manufacture.reorderSend.modelForm",
    }).result.then(function() {
      console.log('abccccccccccccc', POs);
    }, function() {
      // $rootScope.$broadcast('forceRefetch' , {});
    });

  }



});


app.controller("businessManagement.productsInventory.manufacture", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.productsInventory.manufacture.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/POS/product/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
    getParams : [{key : 'haveComposition' , value : true}]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        var title = 'Explore : ';
        var appType = 'profuctInfo';

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk +' ',
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

});
