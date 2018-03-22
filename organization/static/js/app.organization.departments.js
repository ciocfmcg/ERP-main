app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.departments', {
      url: "/departments",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.departments.html',
          controller: 'workforceManagement.organization.departments',
        }
      }
    })
});
app.controller("workforceManagement.organization.departments", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.organization.departments.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/organization/departments/',
    searchField: 'dept_name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'departmentsEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'departmentsInfo';
        }


        console.log({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            departments: $scope.data.tableData[i]
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            departments: $scope.data.tableData[i]
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

});


app.controller("workforceManagement.organization.departments.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  $scope.resetForm = function() {
    $scope.form = {
      'title': '',
      'dept_name': '',
      'picture': emptyFile,
      'mobile': '',
      'telephone': '',
      'fax': '',
      'contacts': [],
      'units': [],
    }
  }
  //
  // 'name':'',
  // 'emp_id':'',
  // 'emp_photo': emptyFile,
  // 'departments':'',
  // 'reporting_manager':'',
  // 'email':'',
  // 'mobile':'',
  // 'telephone':'',
  // 'fax':'',

  $scope.units = [];
  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data.departments;
    $scope.units = $scope.form.units;
    $scope.form.units = [];
  } else {
    $scope.mode = 'new';
    $scope.resetForm();
  }

  $scope.unitsSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/units/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data);
      return response.data;
    })
  };



  $scope.unititem = function() {
    $scope.units.push($scope.form.units)
    $scope.form.units = [];
  }


  $scope.deleteitem = function(index) {
    $scope.units.splice(index, 1);
  }



  $scope.save = function() {
    console.log('entered');
    console.log($scope.units);
    // $scope.form.units = [ ];
    for (var i = 0; i < $scope.units.length; i++) {
      $scope.form.units.push($scope.units[i].pk)
    }
    var f = $scope.form;
    var url = '/api/organization/departments/';

    var fd = new FormData();
    if (f.picture != emptyFile && typeof f.picture != 'string') {
      fd.append('picture', f.picture)
    }


    fd.append('title', f.title);
    fd.append('dept_name', f.dept_name);
    fd.append('mobile', f.mobile);
    fd.append('telephone', f.telephone);
    fd.append('fax', f.fax);
    fd.append('contacts', f.contacts);
    fd.append('units', f.units);

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
      console.log(response.data);
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved')
      // $scope.fetchData();
      //  $scope.$broadcast('forceRefetch',)
      //    $scope.$broadcast('forcerefresh', response.data);
      //  $route.reload();
    })
  }








});




app.controller("workforceManagement.organization.departments.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.departments = $scope.tab.data.departments;

});
