app.config(function($stateProvider) {

  $stateProvider
    .state('hospitalManagement.outPatients', {
      url: "/outPatients",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.activePatients.html',
          controller: 'hospitalManagement.activePatients',
        }
      }
    })
});


app.controller("hospitalManagement.activePatients", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.activePatients.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/patients/activePatient/',
    searchField: 'Name',
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
          var appType = 'patientEditor';
        } else if (action == 'viewDetails') {
          var title = 'Patient : ';
          var appType = 'patientDetails';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].patient.firstName,
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


app.controller('hospitalManagement.activePatients.editDetails', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {



});
