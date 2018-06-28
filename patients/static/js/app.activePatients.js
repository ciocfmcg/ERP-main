app.config(function($stateProvider) {

  $stateProvider
    .state('hospitalManagement.activePatients', {
      url: "/activePatients",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.activePatients.html',
          controller: 'hospitalManagement.activePatients',
        }
      }
    })
});

app.controller('hospitalManagement.activePatient.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {

  $scope.data = $scope.tab.data;
  console.log('exploreee', $scope.data);

  $scope.invoices = [];


  $http({
    method: 'GET',
    url: '/api/patients/invoice/?activePatient=' + $scope.data.pk
  }).
  then(function(response) {
    console.log('invoicesss',response.data);
    $scope.invoices = response.data
  })



  // $scope.invoices = [{
  //   name: 'Consultancy',
  //   items: [],
  //   totalRate: 0
  // }, {
  //   name: 'Lab Tests',
  //   items: [],
  //   totalRate: 0
  // }]

  $scope.createInvoice = function() {
    console.log('hereeeee');
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.activePatients.createInvoice.html',
      size: 'md',
      backdrop: true,
      resolve: {
        invoiceData: function() {
          return $scope.invoices;
        },
        patientData: function () {
          return $scope.data;
        }
      },
      controller: function($scope,patientData, invoiceData, $uibModalInstance) {

        $scope.invoiceForm = {
          name: ''
        }

        $scope.saveNewInvoice = function() {

          if ($scope.invoiceForm.name=='') {
          return
          }
          console.log('creating invoice.....s.');

          dataToSend = {
            activePatient: patientData.pk,
            invoiceName: $scope.invoiceForm.name
          };

          console.log(dataToSend);

          $http({
            method: 'POST',
            url: '/api/patients/invoice/',
            data: dataToSend
          }).
          then(function(response) {
            console.log('new invoice createdddd',response.data);
            invoiceData.push(response.data);
            $uibModalInstance.dismiss();
          })

        }

      },
    }).result.then(function() {

    }, function() {

    });
  }


  $scope.invoiceInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.activePatients.invoiceInfo.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        invoiceData: function() {
          return $scope.invoices[idx];
        }
      },
      controller: function($scope, invoiceData, $uibModalInstance) {
        $scope.invoiceData = invoiceData;
        console.log('invoice infoooooo',$scope.invoiceData);
        $scope.items = invoiceData.items;

        $scope.addTableRow = function() {
          $scope.items.push({
            name: '',
            rate: 0
          });
        }

        $scope.calcTotalRate = function() {
          if ($scope.items == undefined) {
            return 0;
          }
          var total = 0;
          for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].rate != undefined) {
              total += $scope.items[i].rate;
            }
          }
          invoiceData.totalRate = total;
          return total;
        }

        $scope.deleteTable = function(index) {
            $scope.items.splice(index, 1);
        };

        $scope.save = function() {

          dataToSend = {
            name: $scope.items.name,
            rate: $scope.items.rate
          };

          console.log('llllllllllll',dataToSend);

          // $http({
          //   method: 'POST',
          //   url: '/api/patients/product/',
          //   data: dataToSend
          // }).
          // then(function(response) {
          //
          //
          //   // console.log('new invoice createdddd',response.data);
          //   // $http({
          //   //   method: 'PATCH',
          //   //   url: '/api/patients/product/'+ response.data.pk ,
          //   //   data: {items: response.data.pk }
          //   // }).
          //   // then(function(response) {
          //   // });
          //
          //
          //   invoiceData.push(response.data);
          //   $uibModalInstance.dismiss();
          //
          //
          // })


          console.log('coming here...',$scope.items);
          console.log('patch request',invoiceData);
          $uibModalInstance.dismiss();
        }

      },
    }).result.then(function() {

    }, function() {

    });
  }

});

app.controller("hospitalManagement.activePatients", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.activePatients.items.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/patients/activePatient/',
    searchField: 'name',
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
          title: title + $scope.data.tableData[i].patient.firstName,
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

app.controller("hospitalManagement.activePatients.form", function($scope, $rootScope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.patientSearch = function(query) {
    return $http.get('/api/patients/patient/?firstName__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.activePatientsForm = {
    patient: '',
    inTime: '',
    outTime: '',
    status: '',
    comments: ''
  };


  $scope.createActivePatient = function() {

    dataToSend = {
      patient: $scope.activePatientsForm.patient.pk,
      inTime: $scope.activePatientsForm.inTime.toJSON().split('T')[0],
      outTime: $scope.activePatientsForm.outTime.toJSON().split('T')[0]
    };
    console.log(dataToSend);

    $http({
      method: 'POST',
      url: '/api/patients/activePatient/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.activePatientsForm = {
        patient: '',
        inTime: '',
        outTime: '',
        status: '',
        comments: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }

});
