app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.roles', {
      url: "/roles",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.roles.html',
          controller: 'workforceManagement.organization.roles',
        }
      }
    })
});
app.controller("workforceManagement.organization.roles", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.organization.roles.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/organization/roles/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Role :';
          var appType = 'rolesEditor';
        } else if (action == 'info') {
          var title = 'Browse Role :';
          var appType = 'rolesInfo';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            roles: $scope.data.tableData[i]
          },
          active: true
        })
        console.log(title);
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




app.controller("workforceManagement.organization.roles.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
  console.log($scope.tab);

  $scope.resetForm = function() {
    $scope.form = {
      'name': '',
      'division': ''
    }
  }
  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data.roles;
  } else {
    $scope.mode = 'new';
    $scope.resetForm();
  }



  $scope.save = function() {
    console.log('entered');
    var f = $scope.form;
    console.log('kjhkhjkjkl', typeof f.emp_photo);
    var url = '/api/organization/roles/';

    var fd = new FormData();
    if (f.emp_photo != emptyFile && typeof f.emp_photo != 'string') {
      fd.append('emp_photo', f.emp_photo)
    }

    fd.append('name', f.name);
    // fd.append('departments', f.departments.pk);
    fd.append('department', f.department.pk);

    console.log(fd);
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += f.pk + '/'
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
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved')
      // $scope.fetchData();
      //  $scope.$broadcast('forceRefetch',)
      //    $scope.$broadcast('forcerefresh', response.data);
      //  $route.reload();
    })
  }




  $scope.divSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/divisions/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.unitSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/units/?division__name__contains=' + $scope.form.division.name + '&&name_contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.depSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/departments/?dept_name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };



});




app.controller("workforceManagement.organization.roles.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.roles = $scope.tab.data.roles;

});
