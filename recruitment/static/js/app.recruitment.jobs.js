app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.recruitment.jobs', {
      url: "/jobs",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.recruitment.jobs.html',
          controller: 'workforceManagement.recruitment.jobs',
        }
      }
    })
});
app.controller("workforceManagement.recruitment.jobs", function($scope, $http, $uibModal,$aside, $state, Flash, $users, $filter, $permissions) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.recruitment.jobs.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/recruitment/job/',
    searchField: 'jobtype',
    itemsNumPerView: [16, 32, 48],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log("fdg",$scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Jobs: ';
          var myapp = 'jobEdit';
        } else if (action == 'jobBrowse') {
          var title = 'Browse Jobs : ';
          var myapp = 'jobBrowse';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].jobtype,
          cancel: true,
          app: myapp,
          data: {
            pk: target,
            index: i
          },
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
  console.log($scope.tabs,$scope.tabs.length);
  for (var i = 0; i < $scope.tabs.length; i++) {
    console.log('***********************');
    if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
      $scope.tabs[i].active = true;
      alreadyOpen = true;
    } else {
      $scope.tabs[i].active = false;
    }
  }
  if (!alreadyOpen) {
    console.log(input);
    $scope.tabs.push(input)
    console.log($scope.tabs,$scope.tabs.length);
  }
}
});
app.controller("workforceManagement.recruitment.roles.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.refreshOption = true;
  $scope.departmentSearch = function(query) {
    return $http.get('/api/organization/departments/?dept_name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.unitsSearch = function(query) {
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.roleSearch = function(query) {
    return $http.get('/api/organization/role/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.resetForm = function(){
  $scope.form = {
    'jobtype': '',
    'unit': '',
    'department': '',
    'role': '',
    'contacts': [],
    'skill': '',
  }
  }

  if (typeof $scope.tab != 'undefined' && $scope.tab.data.pk != -1) {
  if ($scope.tab.data.index == undefined) {
    $scope.form = $scope.tab.data.jObData;
  }else {
    $scope.form = $scope.data.tableData[$scope.tab.data.index];
  }
  $scope.mode = 'edit';
  console.log($scope.form)
} else {
  $scope.mode = 'new';
  $scope.resetForm();

}

  $scope.saveJobs = function() {
    var f = $scope.form;
    var toSend = {
      jobtype: f.jobtype,
      unit: f.unit.pk,
      department: f.department.pk,
      role: f.role.pk,
      contacts: f.contacts,
      skill: f.skill,
      maximumCTC : f.maximumCTC
    }
    console.log(toSend);
    var url = '/api/recruitment/job/';
    if ($scope.form.pk == undefined) {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.form.pk + '/';
    }
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      // $scope.form= response.data;
      Flash.create('success', 'Saved');
      if ($scope.mode == 'new') {
        $scope.resetForm();
      }
    })
  }

});
app.controller("workforceManagement.recruitment.jobs.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.jobDetails = $scope.data.tableData[$scope.tab.data.index]
  $scope.jobApplied=[]

  $scope.approve=function(){
    $scope.jobDetails.approved = true;
    $scope.jobDetails.status = 'Approved'
    var toSend = {
      approved : $scope.jobDetails.approved,
      status : $scope.jobDetails.status
    }
    var method = 'PATCH';
    var url = '/api/recruitment/job/';
    url += $scope.jobDetails.pk + '/';
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    })
  }
  $scope.active=function(){
    if ($scope.jobDetails.status == 'Active') {
        $scope.jobDetails.status = 'Closed';
    }
    else if ($scope.jobDetails.status == 'Approved'||$scope.jobDetails.status == 'Closed') {
      $scope.jobDetails.status = 'Active';
    }
    var toSend = {
      status : $scope.jobDetails.status
    }
    var method = 'PATCH';
    var url = '/api/recruitment/job/';
    url += $scope.jobDetails.pk + '/';
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    })
  }
  $scope.listData =function() {
  console.log('aaaaaaaaabbbbbbbbbbbb');
  $http({
    method: 'GET',
    url: '/api/recruitment/applyJob/?job=' + $scope.jobDetails.pk + '&status=Created'
  }).
  then(function(response) {
    console.log(response.data.length,'aaaaaaaaabbbbbbbbbbbb');
    $scope.jobApplied=response.data;
  });
}
$scope.listData();

  $scope.$watch('form.checkAll' , function(newValue , oldValue) {
    for (var i = 0; i < $scope.jobApplied.length; i++) {
      $scope.jobApplied[i].select=newValue;
    }
  })

  $scope.selected =function() {
  for (var i = 0; i < $scope.jobApplied.length; i++) {
    if($scope.jobApplied[i].select){
      console.log("aaaaaaa");
      $scope.jobApplied[i].status='Screening'
      var toSend = {
        status : $scope.jobApplied[i].status
      }
      var method = 'PATCH';
      var url = '/api/recruitment/applyJob/';
      url += $scope.jobApplied[i].pk + '/';
      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then(function(response) {
        Flash.create('success', 'Saved');
        $scope.listData();
      })
    }
  }
}



  });
