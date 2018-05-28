app.config(function($stateProvider) {
  $stateProvider.state('workforceManagement.employees.approvals', {
    url: "/approvals",
    templateUrl: '/static/ngTemplates/app.employees.approvals.html',
    controller: 'workforceManagement.employees.approvals'
  });
});

app.controller("workforceManagement.employees.approvals.info", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {

  $scope.data = $scope.tab.data;

  $scope.save = function() {
    var url = '/api/HR/leave/' + $scope.data.pk + '/';
    $http({
      method: 'PATCH',
      url: url,
      data: {},
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      $scope.data = response.data;
    })
  }

});

app.controller("workforceManagement.employees.timeSheet.info", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {

  $scope.data = $scope.tab.data;


  // $http({
  // method: 'GET',
  // url: '/api/performance/timeSheet/'
  // }).
  // then(function(response) {
  //     $scope.timeSheet = response.data[0];
  // console.log($scope.timeSheet);
  // })


  $scope.totalTime = function() {

    if ($scope.data == undefined) {
      return 0;
    }


    var total = 0;
    for (var i = 0; i < $scope.data.items.length; i++) {
      if ($scope.data.items[i].duration != undefined) {
        total += $scope.data.items[i].duration;
      }
    }
    return total.toFixed(2);
    console.log('aaaaaa', total);
  }

  $scope.save = function() {
    var url = '/api/performance/timeSheet/' + $scope.data.pk + '/';
    $http({
      method: 'PATCH',
      url: url,
      data: {
        typ: 'approved'
      },
    }).
    then(function(response) {
      Flash.create('success', 'Approved');
      $scope.data = response.data;
    })
  }
  $scope.reject = function() {
    var url = '/api/performance/timeSheet/' + $scope.data.pk + '/';
    $http({
      method: 'PATCH',
      url: url,
      data: {
        typ: 'created'
      },
    }).
    then(function(response) {
      Flash.create('success', 'Rejected');
      $scope.data = response.data;
    })
  }



});



app.controller("workforceManagement.employees.approvals", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {

  $scope.data = {
    tableData: [],
    sheetTableData: [],
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.employees.approvals.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/HR/leave/',
    // searchField: 's',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Leave request :';
          var appType = 'leavesInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }
  }

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.employees.timeSheet.item.html',
  }, ];


  $scope.configSheet = {
    views: views,
    url: '/api/performance/timeSheet/',
    searchField: 'dept_name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableActionSheet = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.sheetTableData);

    for (var i = 0; i < $scope.data.sheetTableData.length; i++) {
      if ($scope.data.sheetTableData[i].pk == parseInt(target)) {
        if (action == 'sheet') {
          var title = 'Time Sheet :';
          var appType = 'sheetInfo';
        }

        $scope.addTab({
          title: title + $scope.data.sheetTableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.sheetTableData[i],
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
