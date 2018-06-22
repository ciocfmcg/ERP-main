app.config(function($stateProvider) {

  $stateProvider
    .state('hospitalManagement.inPatients', {
      url: "/inPatients",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.activePatients.html',
          controller: 'hospitalManagement.activePatients',
        }
      }
    })
});

app.controller('hospitalManagement.activePatient.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {

console.log('coming in explooreeee');

$scope.data = $scope.tab.data;
console.log('exploreee', $scope.data);

$scope.invoices = [];

$scope.fetchInvoices = function() {
  $http({
    method: 'GET',
    url: '/api/patients/invoice/?activePatient=' + $scope.data.pk
  }).
  then(function(response) {
    console.log('invoicesss', response.data);
    $scope.invoices = response.data
  })
  $http({
    method: 'GET',
    url: '/api/patients/dischargeSummary/?patientName=' + $scope.data.patient.pk
  }).
  then(function(response) {
    console.log('dissssssssss', response.data);
    $scope.dis = response.data
    if ($scope.dis.length>0) {
      console.log('thteeeeeeeeeee');
      $scope.dischargeSummForm=$scope.dis[0]
    }else {
      console.log('newwwwwwwwwwwwwwww');
      $scope.refresh();
      $scope.dischargeSummForm.patientName = $scope.data.patient
    }
    console.log(777777777777777777777,$scope.dischargeSummForm);
  })
}

$scope.fetchInvoices();

  //form for discharge summary

  $scope.refresh = function () {

    $scope.dischargeSummForm = {
      age:'',
      sex:'',
      telephoneNo  :'',
      uhidNo  :'',
      ipNo  :'',
      treatingConsultantName  :'',
      treatingConsultantContact  :'',
      treatingConsultantDept  :'',
      dateOfAdmission  :new Date(),
      dateOfDischarge  :new Date(),
      mlcNo  :'',
      firNo  :'',
      provisionalDiagnosis  :'',
      finalDiagnosis  :'',
      complaintsAndReason  :'',
      summIllness  :'',
      keyFindings  :'',
      historyOfAlchohol  :'',
      pastHistory  :'',
      familyHistory  :'',
      courseInHospital  :'',
      patientCondition  :'',
      advice  :'',
      reviewOn  :'',
      complications  :'',
      doctorName  :'',
      regNo  :''
    }
  }







  $scope.saveDischargeSumm = function() {

    console.log('here...');
    console.log($scope.dischargeSummForm);
    // if ($scope.dischargeSummForm.patientName.length==0) {
    //   Flash.create('warning', 'Please fill patient name');
    //   return
    // }

    var toSend = $scope.dischargeSummForm
    toSend.patientName = $scope.dischargeSummForm.patientName.pk


      $http({
        method: 'POST',
        url: '/api/patients/dischargeSummary/',
        data: $scope.dischargeSummForm,

      }).
      then(function(response) {
        Flash.create('success', 'Saved');
        console.log('dataaaa', response.data);
        $scope.refresh();
      })



  }





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
            grandTotal: 0
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
        },
        indx: function() {
          return idx;
        }
      },
      controller: function($scope,indx, invoiceData, $uibModalInstance) {

        $scope.indx = indx;
        $scope.form = invoiceData;
        $scope.form.productsList = [];
        console.log($scope.form);
        if ($scope.form.products!=null && typeof $scope.form.products=='string') {
          $scope.form.productsList = JSON.parse($scope.form.products);
        }

        console.log('formmmmmm', $scope.form);

        // if (typeof $scope.form.products == 'string') {
        //   $scope.form.products = JSON.parse($scope.form.products)
        //   console.log('iiii',$scope.invoice);
        // }

        $scope.addTableRow = function() {
          $scope.form.productsList.push({
            data: "",
            quantity: 1
          });
          console.log($scope.form.productsList);
        }

        $scope.deleteTable = function(index) {
          $scope.form.productsList.splice(index, 1);
        };

        $scope.subTotal = function() {
          var subTotal = 0;
          angular.forEach($scope.form.productsList, function(item) {
              subTotal += (item.quantity *item.data.rate);
          })
          return subTotal.toFixed(2);
        }

        $scope.productSearch = function(query) {
          console.log("called");
          return $http.get('/api/patients/product/?name__contains=' + query).
          then(function(response) {
            return response.data;
          })
        }

        $scope.saveInvoiceForm = function() {
          console.log('************');
          console.log($scope.form);
          var f = $scope.form;
          console.log(f);
          console.log(f.productsList);
          if (f.productsList.length==0) {
            Flash.create('danger', 'Please add product');
            return ;
          }
          var gtotal = $scope.subTotal()
          console.log(gtotal , typeof gtotal);
          if (gtotal=='NaN') {
            Flash.create('danger', 'Please delete empty row');
            return ;
          }
          var toSend = {
            products: JSON.stringify(f.productsList),
            grandTotal: gtotal
          }
          console.log(toSend);

          $http({
            method: 'PATCH',
            url: '/api/patients/invoice/' + f.pk + '/',
            data: toSend
          }).
          then(function(response) {
            // $scope.form.pk = response.data.pk;
            Flash.create('success', 'Saved');
            $uibModalInstance.dismiss();
          })

        }


      },
    }).result.then(function() {

    }, function() {
      $scope.fetchInvoices();
    });
  }

  $scope.checkOut = function() {
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


  $scope.patientSearch = function(query) {
    return $http.get('/api/patients/patient/?firstName__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };



  $scope.statusList = [{
      name: "Checked In",
      value: "checkedIn"
    },
    {
      name: "Treatment ongoing",
      value: "onGoingTreatment"
    },
    {
      name: "Operation",
      value: "operation"
    },
    {
      name: "Observation",
      value: "observation"
    },
    {
      name: "Ready to discharged",
      value: "readyToDischarged"
    },
    {
      name: "Discharged",
      value: "dishcharged"
    },
    {
      name: "Settled",
      value: "settled"
    }
  ];


  $scope.activePatientsForm = {
    patient: '',
    inTime: '',
    status: '',
    comments: ''
  };


  $scope.addNewActivePatient = function(name) {
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
      controller: function($scope, name, form, $uibModalInstance) {
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
            form.patient = response.data;
            $uibModalInstance.dismiss(form.patient);
          }, function(response) {
            Flash.create('danger', response.status + ' : ' + response.statusText);
          });

        }



      },
    }).result.then(function() {

    }, function(c) {
      $scope.activePatientsForm.patient = c;
    });

  }

  $scope.$watch('activePatientsForm.patient' , function(newValue , oldValue) {
    if (typeof newValue == 'object' || newValue.length == 0) {
      $scope.addNewPatient = false;
    }else{
      $scope.addNewPatient = true;
    }
  })


  $scope.createActivePatient = function() {

    if ($scope.activePatientsForm.patient == '') {
      Flash.create('danger', 'please fill patient name');
      return
    }
    if ($scope.activePatientsForm.inTime == '') {
      Flash.create('danger', 'please fill In Time');
      return
    }
    if ($scope.selectedStatus == undefined) {
      Flash.create('danger', 'please select status');
      return
    }

    dataToSend = {
      patient: $scope.activePatientsForm.patient.pk,
      inTime: $scope.activePatientsForm.inTime,
      status: $scope.selectedStatus
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
