
app.directive('usersField', function () {
  return {
    templateUrl: '/static/ngTemplates/clientsInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data :'=',
      url : '@',
      col : '@',
      label : '@',
      viewOnly : '@'
    },
    controller : function($scope , $state , $http , Flash){
        $scope.d = {user : undefined};
        if (typeof $scope.col != 'undefined') {
            $scope.showResults = true;
        }else{
            $scope.showResults = false;
        }

        if (typeof $scope.viewOnly != 'undefined') {
            $scope.viewOnly = false;
        }
        // $scope.user = undefined;
        $scope.userSearch = function(query) {
          return $http.get( $scope.url +'?username__contains=' + query).
          then(function(response){
              for (var i = 0; i < response.data.length; i++) {
                  if ($scope.data.indexOf(response.data[i]) != -1){
                      response.data.splice(i,1);
                  }
              }
            return response.data;
          })
        };
        $scope.getName = function(u) {
          if (typeof u == 'undefined') {
            return '';
          }
          return u.first_name + '  ' +u.last_name;
        }

        $scope.removeUser = function(index) {
          $scope.data.splice(index,1);
        }

        $scope.addUser = function() {
          for (var i = 0; i < $scope.data.length; i++) {
            if ($scope.data[i] == $scope.d.user.pk){
              Flash.create('danger' , 'User already a member of this group')
              return;
            }
          }
          $scope.data.push($scope.d.user.pk);
          $scope.d.user = undefined;
        }
    },
  };
});


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

  var options = {
    main: {
      icon: 'fa-pencil',
      text: 'edit'
    },
  };

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

  $scope.addTab({
    "title": "Details :with DP5",
    "cancel": true,
    "app": "contactExplorer",
    "data": {
      "pk": 10,
      "index": 9
    },
    "active": true
  })

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

})

app.controller("businessManagement.clientRelationships.contacts.item", function($scope, $state, $users, $stateParams, $http, Flash) {




});

app.directive('crmNote', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.noteBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {

    },
  };
});

app.directive('crmCall', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.callBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window, $sce) {
      $scope.data.notesHtml = $sce.trustAsHtml($scope.data.notes);
      var parsedData = JSON.parse($scope.data.data);
      $scope.data.duration = parsedData.duration;
    },
  };
});

app.directive('crmMeeting', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.meetingBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window, $sce) {
      $scope.data.notesHtml = $sce.trustAsHtml($scope.data.notes);
      var parsedData = JSON.parse($scope.data.data);
      $scope.data.location = parsedData.location;
      $scope.data.duration = parsedData.duration;
    },
  };
});

app.directive('crmMail', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.emailBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window , $sce) {
      $scope.data.subject = JSON.parse($scope.data.data).subject;
      $scope.data.notesHtml = $sce.trustAsHtml($scope.data.notes);
    },
  };
});

app.filter('getCRMDP', function() {
  return function(input) {
    if (input == undefined) {
      return '/static/images/img_avatar_card.png';
    }
    if (input.dp != null) {
      return input.dp;
    } else {
      if (input.male) {
        return '/static/images/img_avatar_card.png';
      } else {
        return '/static/images/img_avatar_card2.png';
      }
    }
  }
})


app.directive('crmTodo', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.todoBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {

    },
  };
});


app.controller("businessManagement.clientRelationships.contacts.explore", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.contact = $scope.data.tableData[$scope.tab.data.index]
  console.log($scope.contact);
  console.log($scope.tab.data.pk);
  $scope.disableNext = false;

  $scope.pageNo = 0;

  $scope.removeCRMUser = function(ind) {
    $scope.logger.withinCRMUsers.splice(ind , 1);
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

  $scope.noteEditor = {
    text: '',
    doc: emptyFile
  };
  $scope.timelineItems = [];

  $scope.retriveTimeline = function() {
    $http({
      method: 'GET',
      url: '/api/clientRelationships/activity/?contact=' + $scope.contact.pk+'&limit=5&offset=' + $scope.pageNo*5
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

  $scope.browseForFile = function() {
    if ($scope.noteEditor.doc.size != 0) {
      $scope.noteEditor.doc = emptyFile;
      return;
    }
    $('#noteEditorFile').click();
  }

  $scope.$watch('noteEditor.doc', function(newValue, oldValue) {
    console.log(newValue);
  })




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
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 440,
    toolbar : 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function (editor ) {
      // editor.addButton();
    },
  };

  $scope.resetLogger = function() {
    $scope.logger = {when : new Date() , where : '' , subject : '' , duration : 10 , comment: '', internalUsers : [], withinCRMUsers : [] , location: '', withinCRM : '', activityType: 'Email'};
  }

  $scope.resetLogger();

  $scope.changeTab = function(index) {
    for (var i = 0; i < $scope.tabs.length; i++) {
      $scope.tabs[i].active = false;
    }
    $scope.tabs[index].active = true;
    $scope.activeTab = index;
  }
  $scope.changeTab(0);

  $scope.contactSearch = function(query) {
    return $http.get('/api/clientRelationships/contactLite/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.addWithinCRM = function() {
    for (var i = 0; i < $scope.logger.withinCRMUsers.length; i++) {
      if ($scope.logger.withinCRMUsers[i].pk == $scope.logger.withinCRM.pk) {
        $scope.logger.withinCRM = '';
        Flash.create('warning' , 'Already in the list');
        return;
      }
    }

    if (typeof $scope.logger.withinCRM == 'object' && $scope.logger.withinCRM != null && $scope.logger.withinCRM != '') {
      $scope.logger.withinCRMUsers.push($scope.logger.withinCRM)
      $scope.logger.withinCRM = '';
    }
  }

  $scope.saveActivityLog = function() {
    var dataToSend = {when : $scope.logger.when , contact: $scope.contact.pk};
    var internals = []
    for (var i = 0; i < $scope.logger.internalUsers.length; i++) {
      $scope.logger.internalUsers[i]
      internals.push($scope.logger.internalUsers[i]);
    }

    if (internals.length !=0) {
      dataToSend.internalUsers = internals;
    }



    var externals = []
    for (var i = 0; i < $scope.logger.withinCRMUsers.length; i++) {
      externals.push($scope.logger.withinCRMUsers[i].pk);
    }

    if (externals.length !=0) {
      dataToSend.contacts = externals;
    }
    var activityData;
    console.log($scope.logger.activityType);
    if ($scope.logger.activityType == 'Email') {
      dataToSend.typ = 'mail';
      if ($scope.logger.subject.length==0) {
        Flash.create('warning' , 'Subject can not be left blank');
        return;
      }
      activityData = {subject : $scope.logger.subject};
    }else if ($scope.logger.activityType == 'Meeting') {
      dataToSend.typ = 'meeting';
      activityData = {duration : $scope.logger.duration , location : $scope.logger.location};
    }else if ($scope.logger.activityType == 'Call') {
      dataToSend.typ = 'call';
      activityData = {duration : $scope.logger.duration }
    }
    dataToSend.data = JSON.stringify(activityData);

    if ($scope.logger.comment != '') {
      dataToSend.notes = $scope.logger.comment;
    }

    $http({method : 'POST' ,url: '/api/clientRelationships/activity/',data : dataToSend }).
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
    $http({
      method: 'GET',
      url: '/api/clientRelationships/contactLite/?company=' + $scope.contact.company.pk
    }).
    then(function(response) {
      $scope.coworkers = response.data;
    })
  }

  console.log($scope);

  $scope.exploreContact = function(c) {
    console.log("will exlore");
    $scope.$emit('exploreContact', {
      contact: c
    });
  }


  $scope.$watch('contact', function(newValue, oldValue) {
    if (newValue != undefined || newValue != null) {
      $scope.retriveTimeline();
    }
  })
});



app.controller("businessManagement.clientRelationships.contacts.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  if (typeof $scope.tab != 'undefined') {
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.mode = 'edit';
  } else {
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
      Flash.create('success', 'Saved')
    })



  }

})
