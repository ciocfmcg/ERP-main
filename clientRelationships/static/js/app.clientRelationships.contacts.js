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
        }else if (action == 'details') {
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

  $scope.addTab({"title":"Details :with DP5","cancel":true,"app":"contactExplorer","data":{"pk":10,"index":9},"active":true})

  $scope.$on('exploreContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({"title":"Details :" + input.contact.name ,"cancel":true,"app":"contactExplorer","data":{"pk":input.contact.pk},"active":true})
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
      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
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
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {
      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
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
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {
      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
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
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {
      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
    },
  };
});

app.filter('getCRMDP' , function(){
  return function(input){
    if (input.dp != null) {
      return input.dp;
    }else{
      if (input.male) {
        return '/static/images/img_avatar_card.png';
      }else {
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
      $scope.openPost = function(position, backdrop, input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
    },
  };
});


app.controller("businessManagement.clientRelationships.contacts.explore", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.contact = $scope.data.tableData[$scope.tab.data.index]
  console.log($scope.contact);
  console.log($scope.tab.data.pk);

  $scope.sortedFeeds = [
    {type : 'note'},
    {type : 'call'},
    {type : 'meeting'},
    {type : 'mail'},
    {type : 'todo'},
  ]

  $scope.tabs = [
    {name : 'Timeline', active : true ,icon: 'th-large'},
    {name : 'Activity', active : false ,icon: 'plus'},
    {name : 'Email', active : false ,icon: 'envelope-o'},
    {name : 'Call / SMS', active : false ,icon: 'phone'},
    {name : 'Task', active : false ,icon: 'check-circle-o'},
    {name : 'Schedule', active : false ,icon: 'clock-o'},
  ]
  $scope.activeTab = 0;

  $scope.changeTab = function(index) {
    for (var i = 0; i < $scope.tabs.length; i++) {
      $scope.tabs[i].active = false;
    }
    $scope.tabs[index].active = true;
    $scope.activeTab = index;
  }

  $http({method: 'GET' , url : '/api/clientRelationships/contact/' +$scope.tab.data.pk + '/' }).
  then(function(response) {
    $scope.contact = response.data;
    $scope.fetchCoworkers();
  })


  $scope.fetchCoworkers = function() {
    $http({method : 'GET' , url : '/api/clientRelationships/contactLite/?company=' + $scope.contact.company.pk}).
    then(function(response) {
      $scope.coworkers = response.data;
    })
  }

  console.log($scope);

  $scope.exploreContact = function(c) {
    console.log("will exlore");
    $scope.$emit('exploreContact', { contact : c});
  }

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
