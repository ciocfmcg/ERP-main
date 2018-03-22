app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.divisions', {
      url: "/divisions",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.division.html',
          controller: 'workforceManagement.organization.division',
        }
      }
    })
});
app.controller("workforceManagement.organization.division", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.organization.division.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/organization/divisions/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'divisionEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'divisionInfo';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            division: $scope.data.tableData[i]
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            division: $scope.data.tableData[i]
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

app.controller("workforceManagement.organization.division.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  console.log($scope.tab);

  $scope.resetForm = function() {
    $scope.form = {
      'name': '',
      'website': '',
      'contacts': [],
      'logo': emptyFile,
      'gstin': '',
      'pan': '',
      'cin': '',
      'l1': '',
      'l2': '',
    }
  }



  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data.division;
    $scope.form.logo = emptyFile;
  } else {
    $scope.mode = 'new';
    $scope.resetForm();
  }



  $scope.save = function() {
    console.log('entered');
    var f = $scope.form;
    var url = '/api/organization/divisions/';

    var fd = new FormData();
    if (f.logo != emptyFile && f.logo != null) {
      fd.append('logo', f.logo)
    }

    if (f.name.length == 0) {
      Flash.create('warning', 'Name can not be blank');
      return;

    }
    if (f.website.length == 0) {
      Flash.create('warning', 'Website can not be blank');
      return;

    }
    if (f.gstin.length == 0) {
      Flash.create('warning', 'GSTIN can not be blank');
      return;

    }
    if (f.pan.length == 0) {
      Flash.create('warning', 'PAN can not be blank');
      return;

    }
    if (f.cin.length == 0) {
      Flash.create('warning', 'CIN can not be blank');
      return;

    }
    if (f.l1.length == 0) {
      Flash.create('warning', 'L1 can not be blank');
      return;

    }
    if (f.l2.length == 0) {
      Flash.create('warning', 'L2 can not be blank');
      return;

    }
    fd.append('name', f.name);
    fd.append('website', f.website);
    fd.append('contacts', f.contacts);
    fd.append('gstin', f.gstin);
    fd.append('pan', f.pan);
    fd.append('cin', f.cin);
    fd.append('l1', f.l1);
    fd.append('l2', f.l2);

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
});


app.controller("workforceManagement.organization.division.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.division = $scope.tab.data.division;

});

app.controller("workforceManagement.organization.division.item", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  //
  //
  // $http({
  //   method: 'GET',
  //   url: '/api/organization/divisions/'
  // }).
  // then(function(response) {
  //    $scope.division = response.data;
  //
  // })
});
