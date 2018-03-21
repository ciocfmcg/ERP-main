app.controller("businessManagement.clientRelationships.contacts", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.clientRelationships.contacts.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/clientRelationships/contact/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Contact :';
          var appType = 'contactEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'contactExplorer';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
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

  // $scope.addTab({
  //   "title": "Details :with DP5",
  //   "cancel": true,
  //   "app": "contactExplorer",
  //   "data": {
  //     "pk": 10,
  //     "index": 9
  //   },
  //   "active": true
  // })

  $scope.$on('exploreContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
    "title": "Details :" + input.contact.name,
      "cancel": true,
      "app": "contactExplorer",
      "data": {
        "pk": input.contact.pk
      },
      "active": true
    })
  });


  $scope.$on('editContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Edit :" + input.contact.name,
      "cancel": true,
      "app": "contactEditor",
      "data": {
        "pk": input.contact.pk,
        contact : input.contact
      },
      "active": true
    })
  });


})

app.controller("businessManagement.clientRelationships.contacts.item", function($scope, $state, $users, $stateParams, $http, Flash) {






});

app.controller("businessManagement.clientRelationships.contacts.explore", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.editContact = function() {
    $scope.$emit('editContact' , {contact : $scope.contact})
  }

  if ($scope.data != undefined) {
    $scope.contact = $scope.data.tableData[$scope.tab.data.index]
  }
  $scope.disableNext = false;
  $scope.pageNo = 0;

  $scope.cleanCalendarEntry = function(data) {
    var cleaned = []
    for (var j = 0; j < data.clients.length; j++) {
      if (data.clients[j].pk != $scope.contact.pk) {
        cleaned.push(data.clients[j]);
      }
    }
    data.clients = cleaned;
    return data;
  }

  $scope.fetchCalendarEnteries = function() {
    $http({
      method: 'GET',
      url: '/api/PIM/calendar/?originator=CRM&clients__in=[' + $scope.contact.pk + ']'
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        response.data[i] = $scope.cleanCalendarEntry(response.data[i]);
      }
      $scope.calendar = response.data;
      for (var i = 0; i < $scope.calendar.length; i++) {
        $scope.calendar[i].when = new Date($scope.calendar[i].when);
        $scope.calendar[i].newDate = false;
        if (i < $scope.calendar.length - 1) {
          if ($scope.calendar[i].when.toDateString() != new Date($scope.calendar[i + 1].when).toDateString()) {
            $scope.calendar[i].newDate = true;
            if ($scope.calendar[i].when.toDateString() == new Date().toDateString()) {
              $scope.calendar[i].today = true;
            }
          }
        }
      }
    })
  }

  $scope.resetTaskEditor = function() {
    var dummyDate = new Date()
    $scope.taskEditor = {
      otherCRMUsers: [],
      details: ''
    };
    $scope.taskEditor.when = new Date(dummyDate.getFullYear(), dummyDate.getMonth(), dummyDate.getDate(), 23, 59, 59); // 2013-07-30 23:59:59
  }
  $scope.resetTaskEditor();
  $scope.saveTask = function() {
    if ($scope.taskEditor.details.length == 0) {
      Flash.create('warning', 'Details can not be empty')
    }

    var crmUsers = [$scope.contact.pk];
    for (var i = 0; i < $scope.taskEditor.otherCRMUsers.length; i++) {
      crmUsers.push($scope.taskEditor.otherCRMUsers[i].pk);
    }

    var dataToSend = {
      when: $scope.taskEditor.when,
      text: $scope.taskEditor.details,
      eventType: 'Reminder',
      originator: 'CRM'
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

  $scope.nextPage = function() {
    if ($scope.disableNext) {
      return;
    }
    $scope.pageNo += 1;
    $scope.retriveTimeline();
  }

  $scope.prevPage = function() {
    if ($scope.pageNo == 0) {
      return;
    }
    $scope.pageNo -= 1;
    $scope.retriveTimeline();
  }

  $scope.noteEditor = {
    text: '',
    doc: emptyFile
  };
  $scope.timelineItems = [];

  $scope.retriveTimeline = function() {
    $http({
      method: 'GET',
      url: '/api/clientRelationships/activity/?contact=' + $scope.contact.pk + '&limit=5&offset=' + $scope.pageNo * 5
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

  $scope.saveNote = function() {
    console.log("will save");

    var fd = new FormData();
    fd.append('typ', 'note');
    fd.append('data', $scope.noteEditor.text);
    fd.append('contact', $scope.contact.pk);

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

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css: '/static/css/bootstrap.min.css',
    inline: false,
    plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme: 'modern',
    height: 300,
    toolbar: 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function(editor) {
      // editor.addButton();
    },
  };

  $scope.resetLogger = function() {
    $scope.logger = {
      when: new Date(),
      where: '',
      subject: '',
      duration: 10,
      comment: '',
      internalUsers: [],
      withinCRMUsers: [],
      location: '',
      withinCRM: '',
      activityType: 'Email'
    };
  }

  $scope.resetLogger();
  $scope.local = {
    activeTab: 0
  };

  $scope.resetEventScheduler = function() {
    $scope.eventScheduler = {
      internalUsers: [],
      when: new Date(),
      details: '',
      otherCRMUsers: [],
      venue: ''
    }
  }

  $scope.resetEventScheduler();
  $scope.saveEvent = function() {

    if ($scope.eventScheduler.details.length == 0) {
      Flash.create('warning', 'Details can not be empty')
    }

    var crmUsers = [$scope.contact.pk];
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
      venue: $scope.eventScheduler.venue
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


  $scope.saveActivityLog = function() {
    var dataToSend = {
      when: $scope.logger.when,
      contact: $scope.contact.pk
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


  $http({
    method: 'GET',
    url: '/api/clientRelationships/contact/' + $scope.tab.data.pk + '/'
  }).
  then(function(response) {
    $scope.contact = response.data;
    $scope.fetchCoworkers();
  })


  $scope.fetchCoworkers = function() {
    if ($scope.contact.company == null) {
      return;
    }
    $http({
      method: 'GET',
      url: '/api/clientRelationships/contactLite/?company=' + $scope.contact.company.pk
    }).
    then(function(response) {
      $scope.coworkers = response.data;
    })
  }

  $scope.exploreContact = function(c) {
    $scope.$emit('exploreContact', {
      contact: c
    });
  }


  $scope.$watch('contact', function(newValue, oldValue) {
    if (newValue != undefined || newValue != null) {
      $scope.retriveTimeline();
      $scope.fetchCalendarEnteries();
    }
  })
});

app.controller("businessManagement.clientRelationships.contacts.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.resetForm = function() {
    $scope.mode = 'new';
    $scope.form = {
      company: undefined,
      name: '',
      email: '',
      mobile: '',
      mobileSecondary: '',
      emailSecondary: '',
      designation: '',
      notes: '',
      linkedin: '',
      facebook: '',
      dp: emptyFile,
      male: true
    }
  }


  if (typeof $scope.tab != 'undefined' && $scope.tab.data.pk != -1) {
    if ($scope.tab.data.index == undefined) {
      $scope.form = $scope.tab.data.contact;
    }else {
      $scope.form = $scope.data.tableData[$scope.tab.data.index];
    }



    $scope.mode = 'edit';
  } else {
    $scope.resetForm();
  }


  $scope.companyAdvanceOptions = false;
  $scope.showCreateCompanyBtn = false;
  $scope.companyExist = false;
  $scope.showCompanyForm = false;

  $scope.me = $users.get('mySelf');

  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.$watch('form.company', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCompanyBtn = true;
      $scope.companyExist = false;
      $scope.showCompanyForm = false;
    } else if (typeof newValue == "object") {
      $scope.companyExist = true;
    } else {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
      $scope.companyExist = false;
    }

  });

  $scope.updateCompanyDetails = function() {
    if (typeof $scope.form.company != "object") {
      Flash.create('warning', "Company's basic details missing")
      return
    }

    if ($scope.form.company.address != null && typeof $scope.form.company.address == 'object') {
      var method = 'POST';
      var url = '/api/ERP/address/'
      if (typeof $scope.form.company.address.pk == 'number') {
        method = 'PATCH'
        url += $scope.form.company.address.pk + '/'
      }
      $http({
        method: method,
        url: url,
        data: $scope.form.company.address
      }).
      then(function(response) {
        $scope.form.company.address = response.data;
        var dataToSend = $scope.form.company;
        dataToSend.address = response.data.pk;

        $http({
          method: 'PATCH',
          url: '/api/ERP/service/' + $scope.form.company.pk + '/',
          data: dataToSend
        }).
        then(function(response) {
          $scope.form.company = response.data;
          Flash.create('success', 'Saved');
        });
      })
    } else {

      var dataToSend = $scope.form.company;

      $http({
        method: 'PATCH',
        url: '/api/ERP/service/' + $scope.form.company.pk + '/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success', 'Saved');
      });

    }



  }

  $scope.createCompany = function() {
    if ($scope.companyExist) {
      $scope.showCompanyForm = true;
      $scope.showCreateCompanyBtn = false;
      return
    }

    if (typeof $scope.form.company == "string" && $scope.form.company.length > 1) {
      var dataToSend = {
        name: $scope.form.company,
        user: $scope.me.pk
      }
      $http({
        method: 'POST',
        url: '/api/ERP/service/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success', 'Created');
      })
    } else {
      Flash.create('warning', 'Company name too small')
    }
  }

  $scope.createContact = function() {
    var url = '/api/clientRelationships/contact/';
    var method = 'POST'

    if ($scope.form.name == '') {
      Flash.create('warning', 'Name can not be empty!');
    }

    if ($scope.mode == 'edit') {
      url += $scope.form.pk + '/';
      method = 'PATCH'
    }

    var fd = new FormData();
    fd.append('name', $scope.form.name);
    fd.append('male', $scope.form.male);

    if ($scope.form.company != null && typeof $scope.form.company == 'object') {
      fd.append('company', $scope.form.company.pk);
    }

    if ($scope.form.email != '' && $scope.form.email != null) {
      fd.append('email', $scope.form.email);
    }

    if ($scope.form.mobile != '' && $scope.form.mobile != null) {
      fd.append('mobile', $scope.form.mobile);
    }

    if ($scope.form.emailSecondary != '' && $scope.form.emailSecondary != null) {
      fd.append('emailSecondary', $scope.form.emailSecondary);
    }

    if ($scope.form.facebook != '' && $scope.form.facebook != null) {
      fd.append('facebook', $scope.form.facebook);
    }

    if ($scope.form.linkedin != '' && $scope.form.linkedin != null) {
      fd.append('linkedin', $scope.form.linkedin);
    }

    if ($scope.form.notes != '' && $scope.form.notes != null) {
      fd.append('notes', $scope.form.notes);
    }

    if ($scope.form.designation != '' && $scope.form.designation != null) {
      fd.append('designation', $scope.form.designation);
    }

    if ($scope.form.mobileSecondary != '' && $scope.form.mobileSecondary != null) {
      fd.append('mobileSecondary', $scope.form.mobileSecondary);
    }

    if ($scope.form.dp != emptyFile && $scope.form.dp != null && typeof $scope.form.dp != 'string') {
      fd.append('dp', $scope.form.dp)
    }

    $http({
      method: method,
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.form = response.data;
      console.log($scope.form);
      if ($scope.mode == 'new') {
        $scope.form.pk = response.data.pk;
        $scope.mode = 'edit';
      }
      Flash.create('success', 'Saved')
    })



  }

})
