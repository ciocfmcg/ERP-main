app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.assets', {
      url: "/assets",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.assets.html',
          controller: 'businessManagement.assets',
        }
      }
    })
});



app.controller("businessManagement.assets.form.info", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  // $scope.serialSearch = function(query) {
  //   return $http.get('/api/assets/checkin/?serialNo__contains=' + query).
  //   then(function(response) {
  //     return response.data;
  //   })
  // };

  $scope.data = $scope.tab.data;

  console.log('ffffffffjjjjjjjjjjjjj', $scope.data);

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.assets.checkin.users.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/assets/allotment/',
    getParams: [{
      "key": 'asset',
      "value": $scope.data.pk
    }, {
      "key": 'returned',
      "value": false
    }],
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $rootScope.$on('removeOneAllot', function(evt, data) {
    $scope.infoForm.alloted -= 1;
  });

  $rootScope.$on('checkedout', function(evt, data) {
    $scope.infoForm.totalQuantity -= data.qtyToReduce;
    console.log($scope.infoForm.totalQuantity);
  });


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'return') {
          console.log('coming in return');
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.assets.explore.return.html',
            size: 'lg',
            backdrop: true,
            resolve: {
              data: function() {
                return $scope.data.tableData[i];
              }
            },
            controller: "businessManagement.assets.explore.return",

          }).result.then(function() {
            console.log('here...');
          }, function() {

          });

        }

        // $scope.addTab({
        //   title: title + $scope.data.tableData[i].name,
        //   cancel: true,
        //   app: appType,
        //   data: $scope.data.tableData[i],
        //   active: true
        // })
      }
    }
  }

  $scope.checkinForm = {
    'serialNos': '',
    'manufacturedOn': '',
    'warrantyTill': '',
    'poNumber': '',
    'asset': '',
  }

  $scope.allotmentForm = {
    'serialNo': '',
    'to': '',
    'approvedBy': '',
    'comments': '',
    'refurbished': 'false',
  }

  $scope.infoForm = {
    'totalQuantity': '',
    'inStock': '',
    'alloted': '',
  }


  $scope.save = function() {

    if ($scope.checkinForm.serialNos == '' || $scope.checkinForm.manufacturedOn == '' || $scope.checkinForm.warrantyTill == '' || $scope.checkinForm.poNumber == '') {
      Flash.create('danger', 'Please fill all details')
      return;
    }

    if (parseInt($scope.checkinForm.poNumber)) {
      console.log($scope.checkinForm.poNumber + " is a number.");
    } else {
      console.log($scope.checkinForm.poNumber + " is NaN.");
      Flash.create('danger', 'PO No should be Numeric')
      return;
    }

    var f = $scope.checkinForm;
    var url = '/api/assets/checkin/';

    var serialNoCount = f.serialNos.split(',').length;

    $scope.infoForm.totalQuantity += serialNoCount;


    // $scope.totalAlloted = serialNoCount + $scope.totalAlloted;

    var toSend = {
      serialNos: f.serialNos,
      manufacturedOn: f.manufacturedOn.toJSON().split('T')[0],
      warrantyTill: f.warrantyTill.toJSON().split('T')[0],
      qty: serialNoCount,
      poNumber: f.poNumber,
      asset: $scope.data.pk
    }

    $http({
      method: 'POST',
      url: url,
      data: toSend,

    }).
    then(function(response) {
      f.pk = response.data.pk;
      Flash.create('success', 'Saved')
    })

    $scope.checkinForm = {
      'serialNos': '',
      'manufacturedOn': '',
      'warrantyTill': '',
      'poNumber': '',
      'asset': '',
    }
  }

  $scope.allot = function() {
    if ($scope.allotmentForm.to == '' || $scope.allotmentForm.approvedBy == '' || $scope.allotmentForm.comments == '') {
      Flash.create('danger', 'Please fill all details')
      return;
    }

    if (!$scope.infoForm.alloted) {
      console.log('not defined cioming herer....');
      $scope.infoForm.alloted = 0;
    }

    console.log($scope.allotmentForm);
    var f = $scope.allotmentForm;
    var url = '/api/assets/allotment/';

    var toSend = {
      serialNo: f.serialNo,
      to: f.to.pk,
      approvedBy: f.approvedBy.pk,
      comments: f.comments,
      refurbished: f.refurbished,
      asset: $scope.data.pk
    }

    $http({
      method: 'POST',
      url: url,
      data: toSend,

    }).
    then(function(response) {
      f.pk = response.data.pk;
      Flash.create('success', 'Saved')
      $rootScope.$broadcast('forceRefetch', {});
    })

    $scope.infoForm.alloted += 1;

    $scope.allotmentForm = {
      'serialNo': '',
      'to': '',
      'approvedBy': '',
      'comments': '',
      'refurbished': 'false',
    }

  }

  $http({
    method: 'GET',
    url: '/api/assets/checkin/?asset=' + $scope.data.pk
  }).then(function(response) {
    $scope.totalQty = 0;
    $scope.checkinData = response.data;
    console.log('checkins', $scope.checkinData);
    for (var i = 0; i < $scope.checkinData.length; i++) {
      $scope.totalQty = $scope.totalQty + $scope.checkinData[i].qty;
    }
    $scope.infoForm.totalQuantity = $scope.totalQty;
    console.log($scope.totalQty);
  })


  $http({
    method: 'GET',
    url: '/api/assets/allotment/?asset=' + $scope.data.pk
  }).then(function(response) {
    // $scope.totalAlloted = 0;
    $scope.allotmentData = response.data;
    console.log('herererer for alllll');
    for (var i = 0, alloted = 0; i < $scope.allotmentData.length; i++) {
      if ($scope.allotmentData[i].returned == false) {
        console.log('comimg heree...', $scope.allotmentData[i].returned);
        $scope.totalAlloted = alloted + 1;
        alloted++;
      }
    }
    $scope.infoForm.alloted = $scope.totalAlloted;
    console.log('$44444444', $scope.totalAlloted);
  })


  $scope.auditLogs = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.assets.explore.auditlogs.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.data;
        }
      },
      controller: "businessManagement.assets.explore.auditlogs",
    }).result.then(function() {

    }, function() {

    });

  }

  $scope.checkOutFun = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.assets.explore.checkout.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.data;
        }
      },
      controller: "businessManagement.assets.explore.checkout",
    }).result.then(function() {

    }, function() {

    });
  }

});



app.controller("businessManagement.assets.form", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data;
    console.log('aaaaaaaaaaaaaaaaaaaaaaa', $scope.tab.data);

  } else {
    $scope.mode = 'new';
    $scope.form = {
      'name': '',
      'brand': '',
      'modelNo': '',
    }
  }



  $scope.save = function() {
    if ($scope.form.name == '' || $scope.form.brand == '' || $scope.form.modelNo == '') {
      console.log('return without saving');
      Flash.create('danger', 'Please fill all details')
      return;
    }
    console.log('coming in save.');
    console.log($scope.form);

    var f = $scope.form;
    var url = '/api/assets/assets/';

    var toSend = {
      name: f.name,
      brand: f.brand,
      modelNo: f.modelNo,
    }

    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += f.pk + '/'
    }


    $http({
      method: method,
      url: url,
      data: toSend,

    }).
    then(function(response) {
      $scope.form.pk = response.data.pk;
      $rootScope.$broadcast('forceRefetch', {});
      Flash.create('success', 'Saved')
    })

    $scope.form = {
      'name': '',
      'brand': '',
      'modelNo': '',
    }

  }

});

app.controller("businessManagement.assets", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.assets.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/assets/assets/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Asset : ';
          var appType = 'assetEditor';
        } else if (action == 'details') {
          var title = 'Browse Assets : ';
          var appType = 'assetDetails';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
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

app.controller("businessManagement.assets.explore.auditlogs", function($scope, $rootScope, data, $state, $users, $stateParams, $http, Flash, $uibModal) {
  //   $scope.abc = $scope.data.tableData
  //   console.log($scope.abc);

  // $scope.checkinItem = $scope.data.tableData[$scope.tab.data.index]
  // console.log('lllllllllllllll',$scope.checkinItem);

  $scope.auditlogsCheckin = data;

  console.log('ffffffffffff', data);

  // $http({
  //   method: 'GET',
  //   url: '/api/assets/checkin/?asset=' + $scope.data.pk
  // }).then(function(response) {
  //   $scope.chData = response.data;
  //   console.log('aaaaaaaaaaaaa',$scope.chData);
  // })

  console.log('444444444444', $scope.auditlogsCheckin);

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.assets.checkin.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/assets/checkin/',
    searchField: 'PO no',
    getParams: [{
      "key": 'asset',
      "value": $scope.auditlogsCheckin.pk
    }],
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

  // $scope.tableAction = function(target, action, mode) {
  //   console.log(target, action, mode);
  //   console.log($scope.data.tableData);
  //
  //   for (var i = 0; i < $scope.data.tableData.length; i++) {
  //     if ($scope.data.tableData[i].pk == parseInt(target)) {
  //       if (action == 'edit') {
  //         var title = 'Edit Asset : ';
  //         var appType = 'assetEditor';
  //       } else if (action == 'details') {
  //         var title = 'Browse Assets : ';
  //         var appType = 'assetDetails';
  //       }
  //
  //       $scope.addTab({
  //         title: title + $scope.data.tableData[i].name,
  //         cancel: true,
  //         app: appType,
  //         data: $scope.data.tableData[i],
  //         active: true
  //       })
  //     }
  //   }
  //
  // }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  // $scope.closeTab = function(index) {
  //   $scope.tabs.splice(index, 1)
  // }

  // $scope.addTab = function(input) {
  //   console.log(JSON.stringify(input));
  //   $scope.searchTabActive = false;
  //   alreadyOpen = false;
  //   for (var i = 0; i < $scope.tabs.length; i++) {
  //     if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
  //       $scope.tabs[i].active = true;
  //       alreadyOpen = true;
  //     } else {
  //       $scope.tabs[i].active = false;
  //     }
  //   }
  //   if (!alreadyOpen) {
  //     $scope.tabs.push(input)
  //   }
  // }

  // console.log($scope.tabs.data.pk,"aaaaaa")
  //
  // $http({
  //   method: 'GET',
  //   url: '/api/assets/checkin/?asset=' + $scope.checkin.pk
  // }).then(function(response) {
  //   $scope.checkin = response.data;
  //   console.log('aaaaaaaaaaaaa',$scope.checkin);
  // })

});

app.controller("businessManagement.assets.explore.return", function($scope, $rootScope, data, $state, $users, $stateParams, $http, Flash, $uibModal, $uibModalInstance) {

  console.log('coming in return modal window ctrllllrr');

  $scope.data = data;

  console.log($scope.data);

  $scope.returnFrom = {
    'returnComment': '',
    'returned': 'true',
  }

  $scope.returnProduct = function(p) {
    console.log(p);
    console.log('coming in return function');

    // $uibModal.dismiss();

    var f = $scope.returnFrom;

    if (f.returnComment=='') {
        Flash.create('danger', 'Please Write a reason to return')
      return;
    }


    var url = '/api/assets/allotment/' + p + '/';

    var toSend = {
      returnComment: f.returnComment,
      returned: f.returned,
    }


    $http({
      method: 'PATCH',
      url: url,
      data: toSend
    }).
    then(function(response) {
      // $scope.f.pk = response.data.pk;
      $rootScope.$broadcast('removeOneAllot', {});
      $rootScope.$broadcast('forceRefetch', {});
      $uibModalInstance.dismiss();
      Flash.create('success', 'Product Returned');
    });

  }

});

app.controller("businessManagement.assets.explore.checkout", function($scope, $rootScope, data, $state, $users, $stateParams, $http, Flash, $uibModal, $uibModalInstance) {

  $scope.checkOutFrom = {
    'quantity': '',
    'sentTo': '',
    'reason': '',
  }

  $scope.checkedOutFun = function() {
    console.log('check out from here....');

    var f = $scope.checkOutFrom;
    var url = '/api/assets/checkout/'

    var toSend = {
      reason: f.reason,
      sentTo: f.sentTo,
      quantity: f.quantity,
    }

    console.log('checkouttt', toSend);

    $http({
      method: 'POST',
      url: url,
      data: toSend,
    }).
    then(function(response) {
      console.log('response', response);
      Flash.create('success', 'Saved')
      $uibModalInstance.dismiss();
      $rootScope.$broadcast('checkedout', {
        qtyToReduce: f.quantity
      });
    })

  }






});
