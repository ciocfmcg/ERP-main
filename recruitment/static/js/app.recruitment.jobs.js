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
app.controller("workforceManagement.recruitment.jobs", function($scope, $http, $uibModal, $aside, $state, Flash, $users, $filter, $permissions) {

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
    console.log('******************', $scope.data);
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      $http({
        method: 'GET',
        url: '/api/recruitment/applyJob/?job=' + $scope.data.tableData[i].pk + '&status__in!=Created,Closed'
      }).
      then((function(i) {
        return function(response) {
          console.log(response.data, 'aaaaaaaaaaaaa');
          $scope.data.tableData[i].screening = response.data;
        }
      })(i));
    }
  })
  $scope.config = {
    views: views,
    url: '/api/recruitment/job/',
    searchField: 'jobtype',
    itemsNumPerView: [16, 32, 48],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log("fdg", $scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Jobs: ';
          var myapp = 'jobEdit';
        } else if (action == 'jobBrowse') {
          var title = 'Browse Jobs : ';
          var myapp = 'jobBrowse';
        } else if (action == 'selected') {
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
    console.log($scope.tabs, $scope.tabs.length);
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
      console.log($scope.tabs, $scope.tabs.length);
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
  $scope.resetForm = function() {
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
    } else {
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
      maximumCTC: f.maximumCTC
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
app.controller("workforceManagement.recruitment.jobs.explore", function($scope, Flash, $state, $users, $stateParams, $http, Flash, $uibModal, $aside) {

  $scope.jobDetails = $scope.data.tableData[$scope.tab.data.index]
  $scope.jobApplied = []

  $scope.approve = function() {
    $scope.jobDetails.approved = true;
    $scope.jobDetails.status = 'Approved'
    var toSend = {
      approved: $scope.jobDetails.approved,
      status: $scope.jobDetails.status
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
  $scope.active = function() {
    if ($scope.jobDetails.status == 'Active') {
      $scope.jobDetails.status = 'Closed';
    } else if ($scope.jobDetails.status == 'Approved' || $scope.jobDetails.status == 'Closed') {
      $scope.jobDetails.status = 'Active';
    }
    var toSend = {
      status: $scope.jobDetails.status
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
  $scope.listData = function() {
    $http({
      method: 'GET',
      url: '/api/recruitment/applyJob/?job=' + $scope.jobDetails.pk + '&status=Created'
    }).
    then(function(response) {
      $scope.jobApplied = response.data;
    });
  }
  $scope.listData();

  $scope.$watch('form.checkAll', function(newValue, oldValue) {
    for (var i = 0; i < $scope.jobApplied.length; i++) {
      $scope.jobApplied[i].select = newValue;
    }
  })

  $scope.selected = function() {
    var count = 0
    for (var i = 0; i < $scope.jobApplied.length; i++) {
      if ($scope.jobApplied[i].select) {
        count += 1
        console.log("aaaaaaa");
        $scope.jobApplied[i].status = 'TechicalInterview'
        var toSend = {
          status: $scope.jobApplied[i].status
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
          Flash.create('success', 'Done !');
          $scope.listData();
        })
      }
    }
    if (count == 0) {
      Flash.create('warning', 'Please Select Some Candidates')
      return
    }
  }

  $scope.rejected = function() {
    var count = 0
    for (var i = 0; i < $scope.jobApplied.length; i++) {
      if ($scope.jobApplied[i].select) {
        count += 1
        console.log("aaaaaaa");
        $scope.jobApplied[i].status = 'Closed'
        var toSend = {
          status: $scope.jobApplied[i].status
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
          Flash.create('success', 'Done !');
          $scope.listData();
        })
      }
    }
    if (count == 0) {
      Flash.create('warning', 'Please Select Some Candidates')
      return
    }
  }

  $scope.resumeView = function(data) {
    console.log("will create a quote", data);
    $aside.open({
      templateUrl: '/static/ngTemplates/app.recruitment.resume.view.html',
      placement: 'left',
      size: 'xl',
      resolve: {
        job: function() {
          return data;
        },
      },
      controller: 'recruitment.resume.view'
    })
  }


});

app.controller("recruitment.resume.view", function($scope, $state, $users, $stateParams, $http, Flash, $uibModalInstance, job) {
  $scope.job = job;
  $scope.resumes = {}
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };

  $http({
    method: 'GET',
    url: '/api/recruitment/applyJob/' + $scope.job
  }).
  then(function(response) {
    console.log(response.data, 'aaaaa');
    $scope.resumes = response.data;
  });


});

app.controller("recruitment.jobs.selected", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.jobDetails = $scope.data.tableData[$scope.tab.data.index]

  $scope.columns = [
    // {icon : 'fa-pencil-square-o' , text : 'Created' , cat : 'created'},
    {
      icon: 'fa-desktop',
      text: 'Techical Interview',
      cat: 'TechicalInterview'
    },
    {
      icon: 'fa-user-circle-o ',
      text: 'HR Interview',
      cat: 'HRInterview'
    },
    {
      icon: 'fa-bars ',
      text: 'Negotiation',
      cat: 'Negotiation'
    },

  ]

  $scope.fetchDeals = function() {
    $http({
      method: 'GET',
      url: '/api/recruitment/applyJob/?job=' + $scope.jobDetails.pk + '&status__in!=Created,Closed'
    }).
    then(function(response) {
      $scope.List = response.data;
      $scope.data = {
        TechicalInterview: [],
        HRInterview: [],
        Negotiation: []
      }
      console.log(response.data);
      for (var i = 0; i < response.data.length; i++) {
        $scope.data[response.data[i].status].push(response.data[i])
      }
    });
  }

  $scope.fetchDeals();
  $scope.isDragging = false;

  // $scope.$on('exploreDeal', function(event, input) {
  //   $scope.addTab({
  //     "title": "Details :" + input.deal.name,
  //     "cancel": true,
  //     "app": "exploreDeal",
  //     "data": {
  //       "pk": input.deal.pk
  //     },
  //     "active": true
  //   })
  // });
  //
  // $scope.exploreDeal = function(deal , evt) {
  //   if ($scope.isDragging) {
  //     $scope.isDragging = false;
  //   }else {
  //     $scope.$emit('exploreDeal', {
  //       deal: deal
  //     });
  //   }
  // }
  $scope.exploreApplicant = function(applicant, evt) {
    if ($scope.isDragging) {
      $scope.isDragging = false;
    } else {
      $scope.addTab({
        "title": "Applicant : " + applicant.firstname,
        "cancel": true,
        "app": "applicant",
        "data": {
          "pk": applicant.pk
        },
        "active": true
      })
    }
  }
  $scope.$on('draggable:start', function (data) {
    $scope.isDragging=true;
  });

  $scope.removeFromData = function(pk) {
    for (var key in $scope.data) {
      if ($scope.data.hasOwnProperty(key)) {
        for (var i = 0; i < $scope.data[key].length; i++) {
          if ($scope.data[key][i].pk == pk) {
            $scope.data[key].splice(i, 1);
            return;
          }
        }
      }
    }
  }

  $scope.onDropComplete = function(data, evt, newState) {
    if (data == null) {
      return;
    }
    $scope.removeFromData(data.pk);
    $scope.data[$scope.columns[newState].cat].push(data);
    console.log($scope.columns[newState].cat);
    console.log(data);

    var dataToSend = {
      status: $scope.columns[newState].cat
    }

    $http({
      method: 'PATCH',
      url: '/api/recruitment/applyJob/' + data.pk + '/',
      data: dataToSend
    }).
    then(function(Response) {}, function(err) {
      Flash.create('danger', 'Error while updating')
    });
    console.log("drop complete");
  }
});

app.controller("recruitment.applicant.view", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.applicant = []
  $scope.schedules=[]
  $scope.fetchDeal = function() {

    $http({
      method: 'GET',
      url: '/api/recruitment/applyJob/' + $scope.tab.data.pk
    }).
    then(function(response) {
      $scope.applicant = response.data;
      $http({
        method: 'GET',
        url: '/api/recruitment/interview/?candidate=' + $scope.applicant.pk
      }).
      then(function(response) {
        $scope.schedules = response.data;
      });
      $http({
        method: 'GET',
        url: '/api/recruitment/applyJob/?email=' + $scope.applicant.email + '&mobile=' + $scope.applicant.mobile
      }).
      then(function(response) {
        console.log( response.data,'dddddddddddddddd');
        $scope.pastApplyHistory = response.data;
      });
    });
  }
  $scope.fetchDeal()

  $scope.rejected = function() {
    var toSend = {
      status: 'Closed'
    }
    var method = 'PATCH';
    var url = '/api/recruitment/applyJob/' + $scope.applicant.pk + '/';
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Done !');
    })
  }

  $scope.onlineTest = function() {
    var toSend = {
      first_name: $scope.applicant.firstname,
      last_name: $scope.applicant.lastname,
      emailID: $scope.applicant.email,
      value : 'online',
    }
    $http({
      method: 'POST',
      url: '/api/recruitment/onlinelink/',
      data: toSend
    }).
    then(function() {
      Flash.create('success', 'Email sent successfully')
    })
  }


  $scope.resetForm = function() {
    $scope.form = {
      'interviewer': '',
      'interviewDate': new Date(),
      'mode' : ''
    }
  }
  $scope.resetForm();

  $scope.schedule=function(){
    console.log($scope.form.interviewer.pk,'aaaaaaaaaaaaa');
    if (typeof $scope.form.interviewer != 'object') {
      Flash.create('warning','please Select Suggested Interviewer')
      return
    }
    if ($scope.form.mode.length == 0) {
      Flash.create('warning','please Select Interview Mode')
      return
    }
    var toSend = {
      interviewer:$scope.form.interviewer.pk,
      interviewDate: $scope.form.interviewDate,
      candidate: $scope.applicant.pk,
      mode: $scope.form.mode
    }
    console.log('svchhhhhhhhhhhhhhhhh',toSend);
    $http({
      method: 'POST',
      url: '/api/recruitment/interview/',
      data: toSend
    }).
    then(function(response) {
      $scope.schedules.push(response.data);
      Flash.create('success', 'Saved')
      $scope.resetForm();
    })
  }

$scope.interviewerSearch = function(query) {
  return $http.get('/api/HR/userSearch/?limit=10&username__contains=' + query).
  then(function(response) {
    return response.data.results;
  })
}
$scope.getName = function(u) {
  if (u != undefined && u.first_name != undefined) {
    return u.first_name + '  ' + u.last_name;
  }
}

$scope.sendSMS=function(){
  console.log("aaaaaaaaaaaaa");
  $uibModal.open({
    templateUrl: '/static/ngTemplates/app.recruitment.jobs.applicant.sms.html',
    size: 'sm',
    backdrop: true,
    // resolve: {
    //   data: function() {
    //     return $scope.data;
    //   }
    // },
    controller: "workforceManagement.recruitment.jobs.applicant.sms",
  }).result.then(function() {

  }, function() {

  });
}
$scope.sendMail=function(){
  console.log("aaaaaaaaaaaaa");
  $uibModal.open({
    templateUrl: '/static/ngTemplates/app.recruitment.jobs.applicant.email.html',
    size: 'lg',
    backdrop: true,
    resolve: {
      data: function() {
        return $scope.applicant;
      }
    },
    controller: "workforceManagement.recruitment.jobs.applicant.email",
  }).result.then(function() {

  }, function() {

  });
}
});
app.controller("workforceManagement.recruitment.jobs.applicant.sms", function($scope, $state, $users, $stateParams, $http, Flash) {
});
app.controller("workforceManagement.recruitment.jobs.applicant.email", function($scope, $state, $users, $stateParams, $http, Flash, data) {
  $scope.applicant=data,

  $scope.send = function() {
    var toSend = {
      first_name: $scope.applicant.firstname,
      last_name: $scope.applicant.lastname,
      emailID: $scope.applicant.email,
      status : $scope.applicant.status,
      message : $scope.form.email,
      subject : $scope.form.subject,
      value : 'email'
    }
    $http({
      method: 'POST',
      url: '/api/recruitment/onlinelink/',
      data: toSend
    }).
    then(function() {
      Flash.create('success', 'Email sent successfully')
    })
  }
});
