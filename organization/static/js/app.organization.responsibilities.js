app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.organization.responsibilities', {
      url: "/responsibilities",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.responsibilities.html',
          controller: 'businessManagement.organization.responsibilities',
        }
      }
    })
});


app.controller("businessManagement.organization.responsibilities", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: []
  };
  $scope.me = $users.get('mySelf');

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.organization.responsibilities.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/organization/responsibility/',
    searchField: 'title',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    if (mode == 'multi') {
      $scope.createTask();
    } else {
      if (action == 'editResponsibilities') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == parseInt(target)) {
            $scope.addTab({
              title: 'Edit Responsibilities : ' + $scope.data.tableData[i].title,
              cancel: true,
              app: 'editResponsibilities',
              data: {
                pk: target,
                meeting: $scope.data.tableData[i]
              },
              active: true
            })
          }
        }
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = false;

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

app.controller('businessManagement.organization.responsibilities.form', function($scope, $http, $aside, $state, Flash, $users, $timeout, $uibModal) {
  $scope.resetForm = function() {
    $scope.mode = 'new';
    $scope.form = {
      title: '',
      data: '',
      departments: [],
      departmentTxt: ''
    }
  }
  $scope.resetForm();

  $scope.departmentSearch = function(query) {
    return $http.get('/api/organization/departments/?dept_name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }
  // $scope.form.departments=[]
  $scope.addDepartment = function() {
    if (typeof $scope.form.departmentTxt == 'object') {

      for (var i = 0; i < $scope.form.departments.length; i++) {
        if ($scope.form.departments[i].pk == $scope.form.departmentTxt.pk) {
          Flash.create('warning', 'Already in the list');
          return;
        }
      }

      $scope.form.departments.push($scope.form.departmentTxt);
      $scope.form.departmentTxt = '';
    }
  }
  $scope.removeDepartment = function(idx) {
    $scope.form.departments.splice(idx, 1)
  }
  if (typeof $scope.tab == 'undefined') {
    $scope.mode = 'new';

  } else {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data.meeting;
    console.log($scope.form, "aaaaaaaaaaa");
  }

  $scope.save = function() {
    var f = $scope.form;
    if (f.title == null || f.title.length == 0) {
      Flash.create('warning', 'Please Enter The Name')
      return
    }
    var depList = []
    for (var i = 0; i < $scope.form.departments.length; i++) {
      depList.push($scope.form.departments[i].pk);
    }
    var toSend = {
      title: f.title,
      depList: depList,
    }
    if (f.data != null && f.data.length > 0) {
      toSend.data = f.data
    }
    var method = 'POST'
    var url = '/api/organization/responsibility/';
    if ($scope.mode == 'edit') {
      method = 'PATCH';
      url += $scope.form.pk + '/'
    }
    console.log(toSend, '************');
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      console.log(response);
      Flash.create('success', 'Saved');
      if ($scope.mode == 'new') {
        $scope.resetForm();
      }

    }, function(err) {
      console.log(err);
      Flash.create('danger', 'Please Check Data Field Formate');
    })
  }



});
