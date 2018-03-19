app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.warehouse.checkin', {
      url: "/checkin",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.warehouse.checkin.html',
          controller: 'businessManagement.warehouse.checkin',
        }
      }
    })
});

app.controller("controller.warehouse.checkin.info", function($scope, $state, $users, $stateParams, $http, Flash,checkin) {

  $http({
    method: 'GET',
    url: '/api/warehouse/checkin/?contract=' + checkin
  }).
  then(function(response) {
    $scope.checkin = response.data;
  })
  // $scope.data = $scope.tab.data;

});
app.controller("businessManagement.warehouse.checkin.explore", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModal) {
  // $http({
  //   method: 'GET',
  //   url: '/api/warehouse/checkin/'
  // }).
  // then(function(response) {
  //   $scope.data = response.data;
  // })
  $scope.data = $scope.tab.data;

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.openCheckinDetails = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.warehouse.checkout.info.html',
      size: 'md',
      backdrop: true,
      resolve: {
        checkin: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.checkin[idx];
          }
        }
      },
      controller: "controller.warehouse.checkin.info",
    }).result.then(function() {

    }, function() {
      // $rootScope.$broadcast('forceRefetch' , {});
    });



  }

});

app.controller("businessManagement.warehouse.checkin.item", function($scope, $state, $users, $stateParams, $http, Flash) {

  $http({method : 'GET' , url : '/api/warehouse/checkin/?contract=' + $scope.data.pk})

});

app.controller("businessManagement.warehouse.checkin", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
    checkouttableData: []
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkin.item.html',
  }, ];




  $scope.config = {
    views: views,
    url: '/api/warehouse/contract/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],

  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == parseInt(target)) {
            if (action == 'openCheckin') {
              var title = 'openCheckin :';
              var appType = 'checkinExplorer';
            }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          // data: {
          //   pk: target,
          //   index: i
          // },
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }

  }

 var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkout.item.html',
  }, ];




  $scope.configCheckout = {
    views: views,
    url: '/api/warehouse/checkin/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],

  }

  $scope.tableActionCheckout = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.checkouttableData);

    for (var i = 0; i < $scope.data.checkouttableData.length; i++) {
          if ($scope.data.tableData[i].pk == parseInt(target)) {
            if (action == 'openCheckout') {
              var title = 'openCheckout :';
              var appType = 'checkoutExplorer';
            }

        $scope.addTab({
          title: title + $scope.data.checkouttableData[i].pk,
          cancel: true,
          app: appType,
          // data: {
          //   pk: target,
          //   index: i
          // },
          data: $scope.data.checkouttableData[i],
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

  $scope.serviceSearch = function(query) {
    return $http.get('/api/warehouse/contract/?company__name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };






});

app.controller("businessManagement.warehouse.checkin.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.serviceSearch = function(query) {
    return $http.get('/api/warehouse/contract/?company__name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.checkin = {
    'contract': '',
    'description': '',
    'height': 0,
    'width': 0,
    'length': 0,
    'weight': 0,
    'qty':0
  }

  // if ($scope.checkin.pk != undefined) {
  //   $scope.mode = 'edit';
  //   $scope.checkin = checkin;
  //   }else{
  //   $scope.mode = 'new';
  //   $scope.checkin = {'contract':'','description':'','height':0,'width':0,'length':0,'weight':0}
  // }
  $scope.save = function() {
    var f = $scope.checkin;
    console.log(f);
    // if (f.serialNumber.length == 0) {
    //   Flash.create('warning', 'serialNumber can not be left blank');
    //   return;
    // }
    var toSend = {
      contract: f.contract.pk,
      description: f.description,
      height: f.height,
      width: f.width,
      length: f.length,
      weight: f.weight,
      qty:f.qty

    }

    console.log(toSend);
    var url = '/api/warehouse/checkin/';
    if ($scope.checkin.pk == undefined) {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.checkin.pk + '/';
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.checkin.pk = response.data.pk;
      Flash.create('success', 'Saved');
    })
  }



});
