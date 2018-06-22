app.config(function($stateProvider){
  $stateProvider.state('hospitalManagement.configure.servicesOffered', {
    url: "/servicesOffered",
    templateUrl: '/static/ngTemplates/app.configure.servicesOffered.html',
    controller: 'hospitalManagement.configure.servicesOffered'
  });
});
app.controller("hospitalManagement.configure.servicesOffered", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.configure.services.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/patients/product/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'editDetails') {
          var title = 'Edit : ';
          var appType = 'productEditor';
        } else if (action == 'viewDetails') {
          var title = 'Product : ';
          var appType = 'productDetails';
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

app.controller("hospitalManagement.configure.services.form", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  console.log('gggggggggggg',$scope.tab);

  if ($scope.tab!=undefined) {
    $scope.productForm = $scope.tab.data;
  }else {
    $scope.productForm = {
      name:'',
      rate:''
    }
  }

  $scope.saveProduct = function () {
    if ($scope.productForm.pk) {
      $http({
        method: 'PATCH',
        url: '/api/patients/product/' + $scope.productForm.pk + '/',
        data: {name : $scope.productForm.name , rate:$scope.productForm.rate}
      }).
      then(function(response) {
        console.log('product', response.data);
          Flash.create('success', 'Saved');
        $scope.invoices = response.data
      })

    }else {
      $http({
        method: 'POST',
        url: '/api/patients/product/',
        data: {name : $scope.productForm.name , rate:$scope.productForm.rate}
      }).
      then(function(response) {
        console.log('product', response.data);
        Flash.create('success', 'Saved');
        $scope.productForm = {
          name:'',
          rate:''
        }
      })
    }
  }




});
