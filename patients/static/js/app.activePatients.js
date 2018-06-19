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
    console.log('invoicesss', response.data);
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
        patientData: function() {
          return $scope.data;
        }
      },
      controller: function($scope, patientData, invoiceData, $uibModalInstance) {

        $scope.invoiceForm = {
          name: ''
        }

        $scope.saveNewInvoice = function() {

          if ($scope.invoiceForm.name == '') {
            return
          }
          console.log('creating invoice.....s.');

          dataToSend = {
            activePatient: patientData.pk,
            invoiceName: $scope.invoiceForm.name,
            grandTotal:0
          };

          console.log(dataToSend);

          $http({
            method: 'POST',
            url: '/api/patients/invoice/',
            data: dataToSend
          }).
          then(function(response) {
            console.log('new invoice createdddd', response.data);
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
        console.log('invoice infoooooo', $scope.invoiceData);
        $scope.items = $scope.invoiceData.items;
        console.log($scope.products);

        $scope.addTableRow = function() {
          $scope.items.push({
            name: '',
            rate: 0,
            created: true
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
          invoiceData.grandTotal = total;
          return total;
        }

        $scope.deleteTable = function(index) {
          $scope.items.splice(index, 1);
        };

        $scope.deleteTable = function(index) {

          // if ($scope.items[index].created) {
          //   console.log('new');
          //   $scope.items.splice(index, 1);
          // }else {
          //   console.log('delete from backend');
          //   $scope.items.splice(index, 1);
          // }

          if ($scope.items[index].pk != undefined) {
            $http({
              method: 'DELETE',
              // url: '/api/performance/timeSheetItem/' + $scope.items[index].pk + '/'
              url: '/api/patients/product/' + $scope.items[index].pk + '/'
            }).
            then((function(index) {
              return function(response) {
                $scope.items.splice(index, 1);
                Flash.create('success', 'Deleted');
              }
            })(index))

          } else {
            $scope.items.splice(index, 1);
          }
        };

        $scope.save = function() {

          // dataToSend = {
          //   name: $scope.items.name,
          //   rate: $scope.items.rate
          // };
          $scope.itemsPkTopatch = [];

          for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].created) {
              dataToSend = {
                name: $scope.items[i].name,
                rate: $scope.items[i].rate
              };
              $http({
                method: 'POST',
                url: '/api/patients/product/',
                data: dataToSend
              }).
              then(function(response) {
                Flash.create('success', 'post new product');
                $scope.itemsPkTopatch.push(response.data.pk)
              });
            }
          }

          for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].pk!=undefined) {
              $scope.itemsPkTopatch.push($scope.items[i].pk)
            }
            console.log($scope.itemsPkTopatch);
          }



          $timeout(function () {
            console.log($scope.totalRateToPatch);
            console.log('jjjjjjjjj',$scope.itemsPkTopatch);
            $http({
               method: 'PATCH',
               url: '/api/patients/invoice/'+ $scope.invoiceData.pk + '/' ,
               data: {items: $scope.itemsPkTopatch , grandTotal : invoiceData.grandTotal }
             }).
             then(function(response) {
                 // Flash.create('success');
             });
          }, 2000);



          console.log('coming here...', $scope.items);
          console.log('patch request', invoiceData);
          $uibModalInstance.dismiss();
        }

      },
    }).result.then(function() {

    }, function() {

    });
  }

  $scope.checkOut = function () {
    console.log('checkout');
    console.log($scope.data);
    var date = new Date()
    console.log(date);
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
    searchField: 'Name',
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

  $scope.addNewPatient = false;
  // $scope.addForm = false;

  $scope.patientSearch = function(query) {
    return $http.get('/api/patients/patient/?firstName__contains=' + query).
    then(function(response) {
      if (response.data.length==0) {
        $scope.addNewPatient = true;
      }else {
        $scope.addNewPatient = false;
      }
      console.log('patient search.',response.data);
      return response.data;
    })
  };



  $scope.statusList = [
    {name : "Checked In", value : "checkedIn"},
    {name : "Treatment ongoing", value : "onGoingTreatment"},
    {name : "Operation", value : "operation"},
    {name : "Observation", value : "observation"},
    {name : "Ready to discharged", value : "readyToDischarged"},
    {name : "Discharged", value : "dishcharged"},
    {name : "Settled", value : "settled"}
];


  $scope.activePatientsForm = {
    patient: '',
    inTime: '',
    status: '',
    comments: ''
  };


  $scope.addNewActivePatient = function (name) {
      // $scope.addForm = true;
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.activePatients.addNewPatient.html',
        size: 'lg',
        backdrop: true,
        resolve: {
          name: function() {
            return name;
          },
          form: function() {
            return $scope.activePatientsForm;
          }
        },
        controller: function($scope, name , form ,$uibModalInstance) {
          $scope.name = name
          $scope.newPatient = {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: '',
            uniqueId: ''
          };

          $scope.newPatient.firstName = $scope.name;

          $scope.generateUniqueId = function() {
            $scope.newPatient.uniqueId = new Date().getTime()
            console.log('generateeeee....');
          }

          $scope.createPatient = function() {

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
              console.log('rrreeessss',response.data);
              form.patient = response.data;
              console.log(addNewPatient);
              console.log(form);
            }, function(response) {
              Flash.create('danger', response.status + ' : ' + response.statusText);
            });

            $uibModalInstance.dismiss('removeAdd');
          }



        },
      }).result.then(function() {

      }, function(c) {
        console.log(c);
        if (c == 'removeAdd') {
          $scope.addNewPatient = false;
        }
      });

  }


  $scope.createActivePatient = function() {

    if ($scope.activePatientsForm.patient =='') {
      Flash.create('danger','please fill patient name');
      return
    }

    dataToSend = {
      patient: $scope.activePatientsForm.patient.pk,
      inTime: $scope.activePatientsForm.inTime,
      status : $scope.selectedStatus
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
        status: '',
        comments: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }

});

app.controller('hospitalManagement.activePatients.editDetails', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {



});
