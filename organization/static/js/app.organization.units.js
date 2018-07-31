app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.organization.units', {
      url: "/units",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.organization.units.html',
          controller: 'businessManagement.organization.units',
        }
      }
    })
});
app.controller("businessManagement.organization.units", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

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
    url: '/api/organization/unit/',
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


app.controller("businessManagement.organization.unit.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.unit = $scope.tab.data.unit;


});


app.controller("businessManagement.organization.units.form", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {



  $scope.unitsSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data);
      return response.data;
    })
  };
  // $scope.units = [];
  // $scope.unititems = function() {
  //   console.log('aaaaaaaaaaaaaaaaaaaaaa', $scope.form.parent);
  //   $scope.units.push($scope.form.parent)
  //   $scope.form.parent = [];
  // }
  //
  // $scope.deleteitem = function(index) {
  //   $scope.units.splice(index, 1);
  // }


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
      'division': '',
      'parent': '',
    }
  }


  $scope.units = [];
  if ($scope.tab != undefined) {
    $scope.mode = 'edit';
    $scope.form = $scope.tab.data.unit;
    $scope.units = $scope.form.units;
  } else {
    $scope.mode = 'new';
    $scope.resetForm();
  }



  $scope.save = function() {
    console.log('entered');
    var f = $scope.form;
    var url = '/api/organization/unit/';

    // var parent = []
    // for (var i = 0; i < $scope.form.parent.length; i++) {
    //   parent.push($scope.form.parent[i].pk);
    // }
    console.log($scope.form.parent);
    console.log($scope.form);
    // for (var i = 0; i < $scope.units.length; i++) {
    //   $scope.form.units.push($scope.units[i].pk)
    // }






    // console.log('*',$scope.form.unit);

    var toSend = {
      name: f.name,
      address: f.address,
      pincode: f.pincode,
      mobile: f.mobile,
      contacts: f.contacts,
      division: f.division.pk,
      parent:f.parent.pk
    }

    if (f.telephone.length != '' && f.telephone != undefined) {
      toSend.telephone = f.telephone;
    }
    if (f.fax.length != '' && f.fax != undefined) {
      toSend.fax = f.fax;
    }
    if (f.l1.length != '' && f.l1 != undefined) {
      toSend.l1 = f.l1;
    }
    if (f.l2.length != '' && f.l2 != undefined) {
      toSend.l2 = f.l2;
    }

    // if (division != null) {
    //   toSend.division = division.pk;
    // } else {
    //   toSend.parent = parent;
    // }


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
      if($scope.mode == 'new'){
          $scope.resetForm ()
      }
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
