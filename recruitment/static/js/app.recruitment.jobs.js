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

  $scope.$watch('data.tableData', function(newValue, oldValue) {
    console.log('******************',$scope.data);
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      $http({
        method: 'GET',
        url: '/api/recruitment/applyJob/?job=' + $scope.data.tableData[i].pk + '&status__in!=Created,Closed'
      }).
      then((function(i) {
        return function(response){
        $scope.data.tableData[i].screening=response.data;
      }
      })(i));
    }
  })
  $scope.config = {
    views: views,
    url: '/api/recruitment/job/',
    searchField: 'jobtype',
    itemsNumPerView: [2, 4, 6],
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
        }else if (action == 'selected') {
          var title = 'Manage Applications  : ';
          var myapp = 'selected';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
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
app.controller("workforceManagement.recruitment.jobs.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $aside) {

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
  $http({
    method: 'GET',
    url: '/api/recruitment/applyJob/?job=' + $scope.jobDetails.pk + '&status=Created'
  }).
  then(function(response) {
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
      $scope.jobApplied[i].status='TechInterviewing'
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

$scope.resumeView = function(data) {
  console.log("will create a quote",data);
  $aside.open({
    templateUrl : '/static/ngTemplates/app.recruitment.resume.view.html',
    placement: 'left',
    size: 'xl',
    resolve: {
      job : function() {
        return data;
      },
    },
    controller : 'recruitment.resume.view'
  })
}


  });

app.controller("recruitment.resume.view", function($scope, $state, $users, $stateParams, $http, Flash,   $uibModalInstance, job) {
  $scope.job=job;
  $scope.resumes={}
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };

  $http({
    method: 'GET',
    url: '/api/recruitment/applyJob/' +$scope.job
  }).
  then(function(response) {
    console.log(response.data,'aaaaa');
    $scope.resumes=response.data;
  });


});

app.controller("recruitment.jobs.selected", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.jobDetails = $scope.data.tableData[$scope.tab.data.index]
  console.log('444444444444444440',$scope.jobDetails);

  $scope.columns = [
    // {icon : 'fa-pencil-square-o' , text : 'Created' , cat : 'created'},
    {icon : 'fa-desktop' , text : 'TechInterviewing' , cat : 'TechInterviewing'},
    {icon : 'fa-file-pdf-o' , text : 'HrInterviewing' , cat : 'HrInterviewing'},
    {icon : 'fa-bars ' , text : 'Negotiation' , cat : 'Negotiation'},

  ]

  $scope.fetchDeals = function() {
    $http({method : 'GET' , url : '/api/recruitment/applyJob/?job=' + $scope.jobDetails.pk + '&status__in!=Created,Closed'}).
    then(function(response) {
      $scope.List = response.data;
      $scope.data = { TechInterviewing : [] , HrInterviewing : [] , Negotiation : []}
      console.log(response.data);
      for (var i = 0; i < response.data.length; i++) {
        $scope.data[response.data[i].status].push(response.data[i])
      }
    });
  }

  $scope.fetchDeals();
  $scope.isDragging = false;

  // $scope.exploreDeal = function(deal , evt) {
  //   if ($scope.isDragging) {
  //     $scope.isDragging = false;
  //   }else {
  //     $scope.$emit('exploreDeal', {
  //       deal: deal
  //     });
  //   }
  // }

  $scope.removeFromData = function(pk) {
    for (var key in $scope.data) {
      if ($scope.data.hasOwnProperty(key)) {
        for (var i = 0; i < $scope.data[key].length; i++) {
          if ($scope.data[key][i].pk ==pk) {
            $scope.data[key].splice(i,1);
            return;
          }
        }
      }
    }
  }

  $scope.onDropComplete = function(data , evt , newState) {
    if (data == null) {
      return;
    }
    $scope.removeFromData(data.pk);
    $scope.data[$scope.columns[newState].cat].push(data);
    console.log($scope.columns[newState].cat);
    console.log(data);

    var dataToSend = {status : $scope.columns[newState].cat}

    $http({method : 'PATCH' , url : '/api/recruitment/applyJob/' + data.pk + '/' , data : dataToSend}).
    then(function(Response) {
    }, function(err) {
      Flash.create('danger' , 'Error while updating')
    });
    console.log("drop complete");
  }


});
