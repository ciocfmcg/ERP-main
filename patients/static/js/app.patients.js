app.config(function($stateProvider) {

  $stateProvider
    .state('hospitalManagement.patients', {
      url: "/patients",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.patients.html',
          controller: 'hospitalManagement.patients',
        }
      }
    })
});

app.controller('hospitalManagement.patients.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {

  $scope.data = $scope.tab.data;

});

app.controller('hospitalManagement.patients.edit', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.form = $scope.tab.data;
  console.log($scope.tab.data);
  console.log('coming in edit', $scope.form);

  $scope.editForm = $scope.form;

  $scope.modeOfPay = [ {name: 'MLC' , value : false }, {name: 'Insurance' , value : false } , {name: 'Cash' , value : false }]

  // $scope.mode = false ,
  if ($scope.editForm.modeOfPayment!=null && $scope.editForm.modeOfPayment.length>0) {
    var m = $scope.editForm.modeOfPayment.split(',');
    for (var i = 0; i < m.length; i++) {
      if (m[i]=='MLC') {
        $scope.modeOfPay[0].value = true
      }else if (m[i]=='Insurance') {
        $scope.modeOfPay[1].value = true
      }else {
        $scope.modeOfPay[2].value = true
      }
    }
  }

  $scope.$watch('modeOfPay' , function(newValue , oldValue) {
    console.log('########',newValue);
  },true)



  $scope.saveDetails = function() {
    console.log('it comes here');

    var v = "";
    for (var i = 0; i < $scope.modeOfPay.length; i++) {
      if ($scope.modeOfPay[i].value) {
        if (v.length>0) {
          v += ',' + $scope.modeOfPay[i].name
        }else {
          v = $scope.modeOfPay[i].name
        }
      }
    }

    console.log(v);

    var fd = new FormData()
    if (v.length>0) {
      fd.append('modeOfPayment', v);
    }
    if ($scope.editForm.firstName != null && $scope.editForm.firstName.length != 0) {
      fd.append('firstName', $scope.editForm.firstName);
    }
    if ($scope.editForm.lastName != null && $scope.editForm.lastName.length != 0) {
      fd.append('lastName', $scope.editForm.lastName);
    }
    if ($scope.editForm.phoneNo != null && $scope.editForm.phoneNo.length != 0) {
      fd.append('phoneNo', $scope.editForm.phoneNo);
    }
    if ($scope.editForm.email != null && $scope.editForm.email.length != 0) {
      fd.append('email', $scope.editForm.email);
    }
    if ($scope.editForm.emergencyContact1 != null && $scope.editForm.emergencyContact1.length != 0) {
      fd.append('emergencyContact1', $scope.editForm.emergencyContact1);
    }
    if ($scope.editForm.emergencyContact2 != null && $scope.editForm.emergencyContact2.length != 0) {
      fd.append('emergencyContact2', $scope.editForm.emergencyContact2);
    }
    if (typeof $scope.editForm.dateOfBirth == 'object' && $scope.editForm.dateOfBirth!=null ) {
      fd.append('dateOfBirth', $scope.editForm.dateOfBirth.toJSON().split('T')[0]);
    }
    if ($scope.editForm.uniqueId != null && $scope.editForm.uniqueId.length != 0) {
      fd.append('uniqueId', $scope.editForm.uniqueId);
    }
    if ($scope.editForm.street != null && $scope.editForm.street.length != 0) {
      fd.append('street', $scope.editForm.street);
    }
    if ($scope.editForm.city != null && $scope.editForm.city.length != 0) {
      fd.append('city', $scope.editForm.city);
    }
    if ($scope.editForm.pin != null && $scope.editForm.pin.length != 0) {
      fd.append('pin', $scope.editForm.pin);
    }
    if ($scope.editForm.state != null && $scope.editForm.state.length != 0) {
      fd.append('state', $scope.editForm.state);
    }
    if ($scope.editForm.country != null && $scope.editForm.country.length != 0) {
      fd.append('country', $scope.editForm.country);
    }
    if ($scope.editForm.gender != null && $scope.editForm.gender.length != 0) {
      fd.append('gender', $scope.editForm.gender);
    }




    console.log('gggggggggggggggggg', fd);
    console.log($scope.editForm);
    $http({
      method: 'PATCH',
      url: '/api/patients/patient/' + $scope.form.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      console.log('dataaaa', response.data);
    })

  }

});

app.controller("hospitalManagement.patients", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.patients.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/patients/patient/',
    searchField: 'firstName',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'editDetails') {
          var title = 'Edit : ';
          var appType = 'patientEditor';
        } else if (action == 'viewDetails') {
          var title = 'Patient : ';
          var appType = 'patientDetails';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].firstName,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
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

app.controller("hospitalManagement.patients.form", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  $scope.newPatient = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    uniqueId: ''
  };

  $scope.generateUniqueId = function() {
    $scope.newPatient.uniqueId = new Date().getTime()
    console.log('generateeeee....');
  }

  $scope.createPatient = function() {

    // if ($scope.newPatient.gender=='') {
    //   Flash.create('danger', 'please select gender');
    //   return
    // }

    dataToSend = {
      firstName: $scope.newPatient.firstName,
      lastName: $scope.newPatient.lastName,
      dateOfBirth: $scope.newPatient.dateOfBirth.toJSON().split('T')[0],
      gender: $scope.newPatient.gender,
      uniqueId: $scope.newPatient.uniqueId
    };

    console.log('lklklkllklklklklkl', dataToSend);

    $http({
      method: 'POST',
      url: '/api/patients/patient/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.newPatient = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        uniqueId: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });


  }

});
