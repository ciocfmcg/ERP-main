app.config(function($stateProvider){
  $stateProvider.state('hospitalManagement.configure.doctors', {
    url: "/doctors",
    templateUrl: '/static/ngTemplates/app.configure.doctors.html',
    controller: 'hospitalManagement.configure.doctors'
  });
});
app.controller("hospitalManagement.configure.doctors", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.configure.doctor.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/patients/doctor/',
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
          var appType = 'doctorEditor';
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

app.controller("hospitalManagement.configure.doctors.form", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  console.log('gggggggggggg',$scope.tab);

  if ($scope.tab!=undefined) {
    $scope.doctorForm = $scope.tab.data;
  }else {
    $scope.doctorForm = {
      name:'',
      department:'',
      education:'',
      mobile : ''
    }
  }

  $scope.saveDoctor = function () {
    if ($scope.doctorForm.pk) {
      $http({
        method: 'PATCH',
        url: '/api/patients/doctor/' + $scope.doctorForm.pk + '/',
        data: {name : $scope.doctorForm.name , department:$scope.doctorForm.department ,education:$scope.doctorForm.education , mobile : $scope.doctorForm.mobile }
      }).
      then(function(response) {
        console.log('product', response.data);
          Flash.create('success', 'Saved');
        $scope.invoices = response.data
      })

    }else {
      $http({
        method: 'POST',
        url: '/api/patients/doctor/',
        data: {name : $scope.doctorForm.name , department:$scope.doctorForm.department ,education:$scope.doctorForm.education }
      }).
      then(function(response) {
        console.log('product', response.data);
        Flash.create('success', 'Saved');
        $scope.doctorForm = {
          name:'',
          rate:''
        }
      })
    }
  }




});
