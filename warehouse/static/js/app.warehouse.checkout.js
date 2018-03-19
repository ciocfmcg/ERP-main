app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.warehouse.checkout', {
      url: "/checkout",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.warehouse.checkout.html',
          controller: 'businessManagement.warehouse.checkout',
        }
      }
    })
});

app.controller("controller.warehouse.checkout.info", function($scope, checkout,$http) {

  if (checkout.pk != undefined) {
    $scope.mode = 'edit';
    $scope.checkout = checkout;
  }
  // } else {
  //   $scope.mode = 'new';
  //   $scope.checkout = {
  //     name: '',
  //     img: emptyFile
  //   }



// $scope.products=products;

//   $scope.labels = ["January", "February", "March", "April", "May", "June", "July","August","September","October","November","December"];
//
// $scope.data = [
//   [65, 59, 80, 81, 56, 55, 40,50,30,44,55,66]
//
// ];
// $scope.onClick = function(points, evt) {
//   console.log(points, evt);
// };

$http({
  method: 'GET',
  url: '/api/warehouse/checkin/'
}).
then(function(response) {
  $scope.data = response.data;
})

})

app.controller("businessManagement.warehouse.checkout", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: []
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkout.item.html',
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
        if (action == 'openCheckout') {
          var title = 'openCheckout :';
          var appType = 'checkoutExplorer';
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

  $scope.openCheckinDetails = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.warehouse.checkout.info.html',
      size: 'md',
      backdrop: true,
      resolve: {
        checkout: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.checkout[idx];
          }
        }
      },
      controller: "controller.warehouse.checkout.info",
    }).result.then(function() {

    }, function() {
      // $rootScope.$broadcast('forceRefetch' , {});
    });



  }






});
