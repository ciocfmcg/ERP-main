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

  $scope.data = {
    tableData: []
  };

  // views = [{
  //   name: 'list',
  //   icon: 'fa-th-large',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.productsInventory.purchaseOrder.items.html',
  // }, ];
  //
  //
  // $scope.config = {
  //   views: views,
  //   url: '/api/POS/vendorProfile/',
  //   searchField: 'name',
  //   itemsNumPerView: [2, 4, 8],
  // }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'purchaseOrderEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'purchaseOrderInfo';
        }

        // $scope.addTab({
        //   title: title + $scope.data.tableData[i].pk,
        //   cancel: true,
        //   app: appType,
        //   data: $scope.data.tableData[i],
        //   active: true
        // })
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  // $scope.closeTab = function(index) {
  //   $scope.tabs.splice(index, 1)
  // }
  //
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

  // $scope.selected = [];

  $http({
    method: 'GET',
    url: '/api/POS/reorderingReport/?onlyData=' + $scope.data.pk,
  }).
  then(function(response) {
    $scope.product = response.data;
    $scope.pages = $scope.product.slice(0, 10)
    $scope.startPage = 0;

    // console.log('reeeeeeeeeeeee',response.data);
  })


  $scope.openVendor = function(id, idx) {
    $http({
      method: 'GET',
      url: '/api/POS/VendorServicesLite/?product=' + id,
    }).
    then((function(idx) {
      return function(response) {
        $scope.cid = idx
        $scope.vendor = response.data;
        $scope.pages[idx].selectedData = {}
        console.log('ddddddddddd', response.data);
        for (var i = 0; i < response.data.length; i++) {
          console.log(i);
          if (response.data[i].select == true) {
            console.log('yesssssssssssssss');
            $scope.pages[idx].selectedData = response.data[i]
          }
        }
        console.log('aaaaaaaaaaa', $scope.vendor);
      }
    })(idx))
  }

  $scope.selectVendor = function(id, idx) {
    console.log('ciddddddddddd', $scope.cid);
    for (var i = 0; i < $scope.vendor.length; i++) {
      var a = i
      if (idx == i) {
        var toSend = {
          'select': true
        }
      } else {
        var toSend = {
          'select': false
        }
      }
      $http({
        method: 'PATCH',
        url: '/api/POS/VendorServicesLite/' + $scope.vendor[i].pk + '/',
        data: toSend
      }).
      then((function(id, idx, a) {
        return function(response) {
          console.log('ciddddddddddd', $scope.cid);
          // $scope.openVendor();
          console.log(idx);
          console.log('aaaaaaaaaaa', $scope.vendor);
          $scope.vendor[a].select = response.data.select
          console.log('aaaaaaaaaaa', $scope.vendor);
          if (id == response.data.pk) {
            $scope.pages[$scope.cid].selectedData = response.data
          }
        }
        // $scope.vendor = response.data;
      })(id, idx, a))
    }
  }

  // $scope.selectVendor = function(id,idx){
  //   console.log('ciddddddddddd',$scope.cid);
  //   $http({
  //     method: 'PATCH',
  //     url: '/api/POS/VendorServicesLite/'+ id + '/',
  //     data:{'select': !$scope.vendor.select}
  //   }).
  //   then(function(response) {
  //       // console.log('ciddddddddddd',$scope.cid);
  //       // $scope.openVendor();
  //       // console.log(idx);
  //       // console.log('aaaaaaaaaaa',$scope.vendor);
  //       $scope.vendor.select = response.data.select
  //       // console.log('aaaaaaaaaaa',$scope.vendor);
  //       if (response.data.select == true) {
  //         $scope.pages.selectedData.push(response.data)
  //       }else{
  //         $scope.pages.selectedData.splice(idx, 1)
  //       }
  //     // $scope.vendor = response.data;
  //   })
  // }






  $scope.nextPage = function() {
    console.log('aaaaaaaaaaa');
    if ($scope.disableNext) {
      return;
    }
    $scope.startPage += 1;
    console.log('aaaaaaaaaaa');
    $scope.pages = $scope.product.slice($scope.startPage * 10, $scope.startPage * 10 + 9)
    // $scope.startPage = $scope.startPage * 10;
    console.log('aaaaaaaaaaa', $scope.pages);

  }

  $scope.prevPage = function() {
    if ($scope.startPage == 1) {
      return;
    }
    $scope.startPage -= 1;
    console.log('aaaaaaaaaaa');
    $scope.pages = $scope.product.slice($scope.startPage * 10 - 10, $scope.startPage * 10 - 1)
    // $scope.startPage = $scope.startPage * 10;
    console.log('bbbbbbbb', $scope.pages);

  }

  $scope.create = function() {
    for (var i = 0; i < $scope.pages.length; i++) {
      console.log('ppp',$scope.pages);
      var toSend = {
        qty: $scope.pages[i].qty,
        service: $scope.pages[i].pk
      }

      var url = '/api/POS/purchaseOrder/';
      var method = 'POST';
      if ($scope.pages[i].pk != undefined) {
        url += $scope.pages[i].pk + '/';
        method = 'PATCH';
      }

      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i) {
        return function(response) {
          $scope.pages[i].pk = response.data.pk;
          Flash.create('success', 'Saved');
        }
      })(i))
    }
  }









});
