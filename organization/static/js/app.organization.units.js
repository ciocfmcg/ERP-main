app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.organization.units', {
      url: "/units",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.units.html',
          controller: 'workforceManagement.organization.units',
        }
      }
    })
});
app.controller("workforceManagement.organization.units", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.organization.unit.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/organization/units/',
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
          var appType = 'unitEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'unitInfo';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            unit: $scope.data.tableData[i]
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
            unit: $scope.data.tableData[i]
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
  //customer search pk



});


app.controller("workforceManagement.organization.unit.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.unit = $scope.tab.data.unit;


});


app.controller("workforceManagement.organization.units.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  console.log($scope.tab);

  $scope.resetForm = function() {
    $scope.form = {
      'name': '',
      'address': '',
      'pincode': '',
      'mobile': '',
      'telephone': '',
      'fax': '',
      'contacts': [],
      'l1': '',
      'l2': '',
      'division': ''
    }
  }



  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data.unit;
  } else {
    $scope.mode = 'new';
    $scope.resetForm();
  }



  $scope.save = function() {
    console.log('entered');
    var f = $scope.form;
    var url = '/api/organization/units/';



    if (f.name.length == 0) {
      Flash.create('warning', 'Name can not be blank');
      return;

    }
    if (f.division.length == 0) {
      Flash.create('warning', 'Division can not be blank');
      return;

    }
    if (f.address.length == 0) {
      Flash.create('warning', 'Address can not be blank');
      return;

    }
    if (f.pincode.length == 0) {
      Flash.create('warning', 'Pincode can not be blank');
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
    if (f.mobile.length == 0) {
      Flash.create('warning', 'Mobile can not be blank');
      return;

    }
    if (f.telephone.length == 0) {
      Flash.create('warning', 'Telephone can not be blank');
      return;

    }
    if (f.fax.length == 0) {
      Flash.create('warning', 'FAX can not be blank');
      return;

    }

    // console.log('*',$scope.form.unit);

    var toSend = {
      name: f.name,
      address: f.address,
      pincode: f.pincode,
      mobile: f.mobile,
      telephone: f.telephone,
      fax: f.fax,
      l1: f.l1,
      l2: f.l2,
      contacts: f.contacts,
      division: f.division.pk,
    }


    // fd.append('name', f.name);
    // fd.append('address', f.address);
    // fd.append('pincode', f.pincode);
    // fd.append('mobile', f.mobile);
    // fd.append('telephone', f.telephone);
    // fd.append('fax', f.fax);
    // fd.append('l1', f.l1);
    // fd.append('l2', f.l2);
    // fd.append('contacts', f.contacts);



    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += f.pk + '/'
    }


    $http({
      method: method,
      url: url,
      data: toSend,

    }).
    then(function(response) {
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved')
    })
  }

  //find in another table

  $scope.divisionSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/divisions/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data);
      return response.data;
    })
  };


});
