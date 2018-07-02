app.config(function($stateProvider) {

  $stateProvider
    .state('hospitalManagement.reports', {
      url: "/reports",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.reports.html',
          controller: 'hospitalManagement.reports',
        }
      }
    })
});


app.controller("hospitalManagement.reports", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {
  var toDay = new Date()
  console.log(toDay);


  $scope.dateForm = {'start':new Date(toDay.getFullYear(),toDay.getMonth(),1),'end':toDay}
  console.log('datesssssssssssssssss',$scope.dateForm);

  $scope.tableData = []
  $scope.$watch('[dateForm.start,dateForm.end]' , function(newValue , oldValue) {

    console.log($scope.dateForm);
    var s = $scope.dateForm.start
    s = new Date(s.getFullYear(),s.getMonth(),s.getDate()+1)
    var d = $scope.dateForm.end
    d = new Date(d.getFullYear(),d.getMonth(),d.getDate()+2)
    console.log(d);
    $http({
      method: 'GET',
      url: '/api/patients/reports/?start=' + s.toJSON().split('T')[0] + '&end=' + d.toJSON().split('T')[0]
    }).
    then(function(response) {
      console.log('reports', response.data);
      $scope.grandTotal = 0
      $scope.tableData = response.data
      for (var i = 0; i < $scope.tableData.length; i++) {
        $scope.grandTotal += $scope.tableData[i].grandTotal
      }
    })
  },true)

  // $scope.data = {
  //   tableData: [],
  // };
  // views = [{
  //   name: 'list',
  //   icon: 'fa-th-large',
  //   template: '/static/ngTemplates/genericTable/genericSearchList.html',
  //   itemTemplate: '/static/ngTemplates/app.outPatients.items.html',
  // }, ];
  //
  //
  // $scope.config = {
  //   views: views,
  //   url: '/api/patients/activePatient/',
  //   getParams: [{
  //     key: 'outPatient',
  //     value: true
  //   }],
  //   searchField: 'patient__firstName',
  //   deletable: true,
  //   itemsNumPerView: [16, 32, 48],
  // }
  //
  //
  // $scope.tableAction = function(target, action, mode) {
  //   console.log(target, action, mode);
  //   console.log($scope.data.tableData);
  //
  //   for (var i = 0; i < $scope.data.tableData.length; i++) {
  //     if ($scope.data.tableData[i].pk == parseInt(target)) {
  //       if (action == 'editDetails') {
  //         var title = 'Edit : ';
  //         var appType = 'patientEditor';
  //       } else if (action == 'viewDetails') {
  //         var title = 'Patient : ';
  //         var appType = 'patientDetails';
  //       }
  //
  //       $scope.addTab({
  //         title: title + $scope.data.tableData[i].patient.firstName,
  //         cancel: true,
  //         app: appType,
  //         data: $scope.data.tableData[i],
  //         active: true
  //       })
  //     }
  //   }
  //
  // }
  //
  // $scope.tabs = [];
  // $scope.searchTabActive = true;
  //
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


});
