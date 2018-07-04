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
app.controller("workforceManagement.recruitment.jobs.explore", function($scope,Flash, $state, $users, $stateParams, $http, Flash, $uibModal, $aside) {

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
        $scope.jobApplied[i].status = 'TechInterviewing'
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
      text: 'TechInterviewing',
      cat: 'TechInterviewing'
    },
    {
      icon: 'fa-file-pdf-o',
      text: 'HrInterviewing',
      cat: 'HrInterviewing'
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
        TechInterviewing: [],
        HrInterviewing: [],
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
  $scope.exploreApplicant = function(applicant , evt) {
    if ($scope.isDragging) {
      $scope.isDragging = false;
    }else {
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


app.controller("recruitment.applicant.view", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $timeout, $rootScope, $aside) {
  $scope.disableNext = false;
  $scope.pageNo = 0;
  $scope.sms = {text : '' , include : [] , selectAll : false , preventUnselect : false}
  $scope.form={}

  $scope.$watch('sms.selectAll' , function(newValue , oldValue) {
    if ($scope.sms.preventUnselect && !newValue) {
      $scope.sms.preventUnselect = false;
      return;
    }
    for (var i = 0; i < $scope.sms.include.length; i++) {
      $scope.sms.include[i] = newValue;
    }
    if (newValue) {
      $scope.sms.preventUnselect = false;
    }
  })

  $scope.$watch('sms.include' , function(newValue , oldValue) {
    for (var i = 0; i < $scope.sms.include.length; i++) {
      if ($scope.sms.include[i] == false) {
        $scope.sms.selectAll = false;
        $scope.sms.preventUnselect = true;
        return;
      }
    }
    $scope.sms.selectAll = true;
  }, true)

  $scope.sendSMS = function() {
    if ($scope.sms.text == '') {
      Flash.create('danger' , 'No text to send');
      return;
    }
    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      if ($scope.deal.contacts[i].mobile != null && $scope.deal.contacts[i].mobile != undefined && $scope.sms.include[i]) {
        var cleanedNumber = $scope.deal.contacts[i].mobile;

        var numb = cleanedNumber.match(/\d/g);
        cleanedNumber = numb = numb.join("");

        if (cleanedNumber.length == 11 && cleanedNumber[0] == '0') {
          clientRelationships = clientRelationships.substring(1,11)
        }else if (cleanedNumber.substring(0, 2) == '91') {
          clientRelationships = clientRelationships.substring(2)
        }

        $http({method : 'POST' , url : '/api/ERP/sendSMS/' , data : {text : $scope.sms.text , number : cleanedNumber }}).
        then(function(response) {
          $scope.sms.text = '';
          Flash.create('success' , 'Sent');
        });
      }
    }
  }


  $scope.editDeal = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.clientRelationships.editDeal.form.html',
      size: 'lg',
      backdrop : true,
      resolve : {
        deal : function() {
          return $scope.deal;
        }
      },
      controller: function($scope , deal){
        $scope.deal = deal;

        $timeout(function () {
            $scope.deal.probability += 0.1;
        }, 1000);
        $scope.setCurrency = function(curr) {
          $scope.deal.currency = curr;
        }

      },
    }).result.then(function () {

    }, function () {
      var deal = $scope.deal;
      var dataToSend = {name : deal.name , probability : deal.probability , requirements : deal.requirements , closeDate : deal.closeDate , currency : deal.currency , value : deal.value}

      var crmUsers = []
      for (var i = 0; i < deal.contacts.length; i++) {
        crmUsers.push(deal.contacts[i].pk)
      }

      if (crmUsers.length!= 0) {
        dataToSend.contacts = crmUsers;
      }else {
        Flash.create('warning' , 'At least one contact is required');
        return;
      }

      if (deal.internalUsers.length != 0) {
        dataToSend.internalUsers = deal.internalUsers;
      }

      $http({method : 'PATCH' , url : '/api/clientRelationships/deal/'+ $scope.deal.pk + '/' , data : dataToSend}).
      then(function(response) {
        $rootScope.$broadcast('dealUpdated', {
          deal: response.data
        });
      });

    });
  }

  $scope.cloneDeal = function() {
    $rootScope.$broadcast('cloneDeal', {
      deal: $scope.deal
    });
  }


  $scope.sortedFeeds = [{
      type: 'note'
    },
    {
      type: 'call'
    },
    {
      type: 'meeting'
    },
    {
      type: 'mail'
    },
    {
      type: 'todo'
    },
  ]

  $scope.noteEditor = {
    text: '',
    doc: emptyFile
  };

  $scope.concludeDeal = function(state) {
    $http({method : 'PATCH' , url : '/api/clientRelationships/deal/' + $scope.deal.pk + '/' , data : {result : state}}).
    then(function(response) {
      $scope.processDealResponse(response.data);
      $rootScope.$broadcast('dealUpdated', {
        deal: response.data
      });

    })
  }


  $scope.saveActivityLog = function() {
    var dataToSend = {
      when: $scope.logger.when,
      deal: $scope.deal.pk
    };
    var internals = []
    for (var i = 0; i < $scope.logger.internalUsers.length; i++) {
      $scope.logger.internalUsers[i]
      internals.push($scope.logger.internalUsers[i]);
    }

    if (internals.length != 0) {
      dataToSend.internalUsers = internals;
    }

    var externals = []
    for (var i = 0; i < $scope.logger.withinCRMUsers.length; i++) {
      externals.push($scope.logger.withinCRMUsers[i].pk);
    }

    if (externals.length != 0) {
      dataToSend.contacts = externals;
    }
    var activityData;
    if ($scope.logger.activityType == 'Email') {
      dataToSend.typ = 'mail';
      if ($scope.logger.subject.length == 0) {
        Flash.create('warning', 'Subject can not be left blank');
        return;
      }
      activityData = {
        subject: $scope.logger.subject
      };
    } else if ($scope.logger.activityType == 'Meeting') {
      dataToSend.typ = 'meeting';
      activityData = {
        duration: $scope.logger.duration,
        location: $scope.logger.location
      };
    } else if ($scope.logger.activityType == 'Call') {
      dataToSend.typ = 'call';
      activityData = {
        duration: $scope.logger.duration
      }
    }
    dataToSend.data = JSON.stringify(activityData);

    if ($scope.logger.comment != '') {
      dataToSend.notes = $scope.logger.comment;
    }

    $http({
      method: 'POST',
      url: '/api/clientRelationships/activity/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.timelineItems.unshift(response.data);
      $scope.resetLogger();
      Flash.create('success', 'Saved');
    }, function(err) {
      Flash.create('danger', 'Error');
    })

  }

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 300,
    toolbar : 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function (editor ) {
      // editor.addButton();
    },
  };

  $scope.quote = function() {
    console.log("will create a quote");
    $aside.open({
      templateUrl : '/static/ngTemplates/app.clientRelationships.quote.form.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        deal : function() {
          return $scope.deal;
        },
      },
      controller : 'businessManagement.clientRelationships.opportunities.quote'
    })
  }

  $scope.tabs = [{
      name: 'Timeline',
      active: true,
      icon: 'th-large'
    },
    {
      name: 'Activity',
      active: false,
      icon: 'plus'
    },
    {
      name: 'Email',
      active: false,
      icon: 'envelope-o'
    },
    {
      name: 'Call / SMS',
      active: false,
      icon: 'phone'
    },
    {
      name: 'Task',
      active: false,
      icon: 'check-circle-o'
    },
    {
      name: 'Schedule',
      active: false,
      icon: 'clock-o'
    },
  ]

  $scope.resetTaskEditor = function() {
    var dummyDate = new Date()
    $scope.taskEditor = { otherCRMUsers : [] , details : ''};
    $scope.taskEditor.when = new Date(dummyDate.getFullYear()
                           ,dummyDate.getMonth()
                           ,dummyDate.getDate()
                           ,23,59,59); // 2013-07-30 23:59:59
  }

  $scope.resetTaskEditor();

  $scope.resetLogger = function() {
    $scope.logger = {when : new Date() , where : '' , subject : '' , duration : 10 , comment: '', internalUsers : [], withinCRMUsers : [] , location: '', withinCRM : '', activityType: 'Email'};
  }

  $scope.resetLogger();

  $scope.local = {activeTab : 0 , minInfo :false};

  if ($.cookie("minInfo") == undefined) {
    $scope.local.minInfo = false;
  }else {
    $scope.local.minInfo = $.cookie("minInfo");
  }

  $scope.resetEventScheduler = function() {
    $scope.eventScheduler = {internalUsers : [] , when : new Date()  , details : '' , otherCRMUsers : [] , venue : ''}
  }

  $scope.saveEvent = function() {

    if ($scope.eventScheduler.details.length == 0) {
      Flash.create('warning', 'Details can not be empty')
    }

    var crmUsers = [];
    for (var i = 0; i < $scope.eventScheduler.otherCRMUsers.length; i++) {
      crmUsers.push($scope.eventScheduler.otherCRMUsers[i].pk);
    }

    var internalUsers = [];
    for (var i = 0; i < $scope.eventScheduler.internalUsers.length; i++) {
      internalUsers.push($scope.eventScheduler.internalUsers[i]);
    }

    var dataToSend = {
      when: $scope.eventScheduler.when,
      text: $scope.eventScheduler.details,
      eventType: 'Meeting',
      originator: 'CRM',
      venue: $scope.eventScheduler.venue,
      data : JSON.stringify({deal : $scope.deal.pk})
    }

    if (crmUsers.length != 0) {
      dataToSend.clients = crmUsers;
    }

    if (internalUsers.length != 0) {
      dataToSend.followers = internalUsers;
    }

    $http({
      method: 'POST',
      url: '/api/PIM/calendar/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      // $scope.calendar.unshift($scope.cleanCalendarEntry(response.data));
      $scope.fetchCalendarEnteries();
      $scope.resetEventScheduler();
    });
  }


  $scope.markComplete = function(pk) {
    for (var i = 0; i < $scope.calendar.length; i++) {
      if ($scope.calendar[i].pk == pk) {
        $scope.calendar[i].completed = true;
        $http({
          method: 'PATCH',
          url: '/api/PIM/calendar/' + pk + '/',
          data: {
            completed: true
          }
        }).
        then(function(response) {
          Flash.create('success', 'Updated');
        }, function(err) {
          Flash.create('danger', 'Error while updating');
        })
      }
    }
  }

  $scope.resetEventScheduler();

  $scope.toggleInfoLevel = function() {
    $scope.local.minInfo = !$scope.local.minInfo;
    $.cookie("minInfo" , $scope.local.minInfo);
  }

  $scope.fetchCalendarEnteries = function() {
    $http({method : 'GET' , url : '/api/PIM/calendar/?originator=CRM&data__contains=' + JSON.stringify({deal : $scope.deal.pk}) }).
    then(function(response) {

      $scope.calendar = response.data;


      for (var i = 0; i < $scope.calendar.length; i++) {
        $scope.calendar[i].when = new Date($scope.calendar[i].when);
        $scope.calendar[i].newDate = false;
        if (i < $scope.calendar.length-1) {
          if ($scope.calendar[i].when.toDateString() != new Date($scope.calendar[i+1].when).toDateString() ) {
            $scope.calendar[i].newDate = true;
            if ($scope.calendar[i].when.toDateString() == new Date().toDateString()) {
              $scope.calendar[i].today = true;
            }
          }
        }
      }
    })
  }

  $scope.moveToNextStage = function() {
    var state = crmSteps[$scope.deal.state+1].text;
    $http({method : 'PATCH' , url : '/api/clientRelationships/deal/' + $scope.deal.pk +'/' , data : {state : state} }).
    then(function(response) {
      $scope.deal.state += 1;
      $rootScope.$broadcast('dealUpdated', {
        deal: response.data
      });
    })
  }

  $scope.exploreContact = function(c) {
    $scope.$emit('exploreContact', {
      contact: c
    });
  }

  $scope.nextPage = function() {
    if ($scope.disableNext) {
      return;
    }
    $scope.pageNo +=1;
    $scope.retriveTimeline();
  }

  $scope.prevPage = function() {
    if ($scope.pageNo == 0) {
      return;
    }
    $scope.pageNo -=1;
    $scope.retriveTimeline();
  }

  $scope.timelineItems = [];

  $scope.saveTask = function() {
    if ($scope.taskEditor.details.length == 0) {
      Flash.create('warning', 'Details can not be empty')
    }

    var crmUsers = [];
    for (var i = 0; i < $scope.taskEditor.otherCRMUsers.length; i++) {
      crmUsers.push($scope.taskEditor.otherCRMUsers[i].pk);
    }

    var dataToSend = {
      when: $scope.taskEditor.when,
      text: $scope.taskEditor.details,
      eventType: 'Reminder',
      originator: 'CRM',
      data : JSON.stringify({deal : $scope.deal.pk})
    }
    if (crmUsers.length != 0) {
      dataToSend.clients = crmUsers;
    }

    $http({
      method: 'POST',
      url: '/api/PIM/calendar/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      // $scope.calendar.unshift($scope.cleanCalendarEntry(response.data));
      $scope.fetchCalendarEnteries();
      $scope.resetTaskEditor();
    });
  }


  $scope.retriveTimeline = function() {
    $http({
      method: 'GET',
      url: '/api/clientRelationships/activity/?deal=' + $scope.deal.pk+'&limit=5&offset=' + $scope.pageNo*5
    }).
    then(function(response) {
      $scope.timelineItems = response.data.results;
      if ($scope.timelineItems.length == 0 && $scope.pageNo != 0) {
        $scope.prevPage();
      }
      $scope.disableNext = response.data.next == null;
      $scope.analyzeTimeline();
    })
  }

  $scope.analyzeTimeline = function() {
    for (var i = 0; i < $scope.timelineItems.length; i++) {
      $scope.timelineItems[i].created = new Date($scope.timelineItems[i].created);
      if (i < $scope.timelineItems.length - 1 && $scope.timelineItems[i].created.getMonth() != new Date($scope.timelineItems[i + 1].created).getMonth()) {
        $scope.timelineItems[i + 1].newMonth = true;
      }
    }
  }

  $scope.data = {steps : crmSteps}

  $scope.processDealResponse = function(data) {
    $scope.deal = data;
    // console.log(data);
    for (var i = 0; i < $scope.data.steps.length; i++) {
      if ($scope.data.steps[i].text == data.state) {
        $scope.deal.state = i;
        break;
      }
    }
    if (typeof $scope.deal.state == 'string') {
      if ($scope.deal.state == 'created') {
        $scope.deal.state = -1;
      }else {
        $scope.deal.state = 0;
      }
    }
    if ($scope.deal.result == 'won' && $scope.deal.state == 5) {
      $scope.deal.state += 1;
    }

    $scope.retriveTimeline();
    $scope.fetchCalendarEnteries();

    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      $scope.sms.include.push(false)
    }


  }

  $scope.fetchDeal = function() {

    $http({method : 'GET' , url : '/api/clientRelationships/deal/' + $scope.tab.data.pk + '/'}).
    then(function(response) {
      $scope.processDealResponse(response.data);
    });

  }

  $scope.fetchDeal();

  $scope.saveNote = function() {

    var fd = new FormData();
    fd.append('typ', 'note');
    fd.append('data', $scope.noteEditor.text);
    fd.append('deal', $scope.deal.pk);

    if ($scope.noteEditor.doc != emptyFile) {
      fd.append('doc', $scope.noteEditor.doc);
    }

    $http({
      method: 'POST',
      url: '/api/clientRelationships/activity/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.timelineItems.unshift(response.data);
      Flash.create('success', 'Saved');
      $scope.noteEditor.text = '';
      $scope.noteEditor.doc = emptyFile;
    })
  }

  $scope.resetEmailForm = function() {
    $scope.form={cc:[], emailBody : '' , emailSubject : ''}
  }

  $scope.resetEmailForm();

  $scope.sendEmail = function() {
    var cc = []
    for (var i = 0; i < $scope.form.cc.length; i++) {
      cc.push($scope.form.cc[i]);
    }
    var contact = []
    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      contact.push($scope.deal.contacts[i].pk);
    }
    var toSend = {
      contact :contact,
      cc : cc,
      emailbody :$scope.form.emailBody,
      emailSubject:$scope.form.emailSubject
    }
    $http({method : 'POST' , url : '/api/clientRelationships/sendEmail/' , data : toSend}).
    then(function() {
      Flash.create('success', 'Email sent successfully')
      $scope.resetEmailForm();
    })
  }

});
