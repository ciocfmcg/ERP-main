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
  // $scope.range = function(min, max, step){
  //   step = step || 1;
  //   var input = [];
  //   for (var i = min; i <= max; i += step) input.push(i);
  //   return input;
  // };
  // $scope.mcurange = $scope.range(0,200,1)

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 300,
    toolbar : false,
    menubar : false,
    setup: function (editor ) {
      editor.addButton( 'publishBtn', {
        text: 'Publish',
        icon: false,
        onclick: function() {
          var tags = [];
          for (var i = 0; i < $scope.editor.tags.length; i++) {
            tags.push($scope.editor.tags[i].pk)
          }
          var dataToSend = {
            source : $scope.editor.source,
            header : $scope.editor.header,
            title : $scope.editor.title,
            users : [$scope.me.pk],
            sourceFormat : 'html',
            state : 'published',
            tags : tags,
          };

          if ($scope.mode == 'edit') {
            method = 'PATCH';
            url = $scope.editor.url;
          } else if ($scope.mode == 'new') {
            method = 'POST';
            url = '/api/PIM/blog/';
          }

          $http({method : method , url : url, data : dataToSend}).
          then(function(response){
            Flash.create('success' , response.status + ' : ' + response.statusText);
            $scope.editor.source = '';
            $scope.editor.header = '';
            $scope.editor.title = '';
            $scope.editor.tags = [];
            $scope.editor.mode = 'hedaer';
          }, function(response){
            Flash.create('danger' , response.status + ' : ' + response.statusText);
          });
        }
      });
      editor.addButton( 'saveBtn', {
        text: 'Save',
        icon: false,
        onclick: function() {
          tags = '';
          for (var i = 0; i < $scope.editor.tags.length; i++) {
            tags += $scope.editor.tags[i].title;
            if (i != $scope.editor.tags.length-1) {
              tags += ',';
            }
          }
          var dataToSend = {
            source : $scope.editor.source,
            header : $scope.editor.header,
            title : $scope.editor.title,
            users : [$scope.me.pk],
            sourceFormat : 'html',
            state : 'saved',
            tags : tags,
          };

          if ($scope.mode == 'edit') {
            method = 'PATCH';
            url = $scope.editor.url;
          } else if ($scope.mode == 'new') {
            method = 'POST';
            url = '/api/PIM/blog/';
          }

          $http({method : method , url : url, data : dataToSend}).
          then(function(response){
            Flash.create('success' , response.status + ' : ' + response.statusText);
            $scope.editor.source = '';
            $scope.editor.header = '';
            $scope.editor.title = '';
            $scope.editor.tags = [];
            $scope.editor.mode = 'hedaer';
          }, function(response){
            Flash.create('danger' , response.status + ' : ' + response.statusText);
          });
        }
      });
      editor.addButton( 'cancelBtn', {
        text: 'Cancel',
        icon: false,
        onclick: function() {
          if ($scope.mode == 'edit') {
            $state.go('home.blog' , { action:'list'} )
          } else {
            $state.go('home.blog' , {id : '' , action:'list'} )
          }

        }
      });
    },
  };

  $scope.tinymceOptionsSmall = JSON.parse(JSON.stringify($scope.tinymceOptions))
  $scope.tinymceOptionsSmall.height = 100




console.log('coming in explooreeee');

$scope.data = $scope.tab.data;
console.log('exploreee', $scope.data);

$scope.$watch('data.msg' , function(newValue , oldValue) {

  if (newValue != null) {

    $http({
      method: 'PATCH',
      url: '/api/patients/activePatient/'+ $scope.data.pk +'/',
      data: {msg:$scope.data.msg}
    }).
    then(function(response) {
    });

  }



})

$scope.invoices = [];

// /api/patients/downloadInvoice/?invoicePk={{i.pk}}

$scope.doctorSearch = function(query) {
  return $http.get('/api/patients/doctor/?name__contains=' + query).
  then(function(response) {
    return response.data;
  })
};

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
    url: '/api/patients/dischargeSummary/?patient=' + $scope.data.pk
  }).
  then(function(response) {
    $scope.dis = response.data
    if ($scope.dis.length>0) {
      console.log('thteeeeeeeeeee');
      $scope.dischargeSummForm=$scope.dis[0]
      $scope.dischargeSummForm.primaryDoctor = $scope.data.docName
      $scope.dischargeSummForm.docList = $scope.dischargeSummForm.treatingConsultant
      $scope.dischargeSummForm.docListPk = []
      for (var i = 0; i < $scope.dischargeSummForm.docList.length; i++) {
        $scope.dischargeSummForm.docListPk.push($scope.dischargeSummForm.docList[i].pk)
      }
      $scope.dischargeSummForm.treatingConsultant = ''
    }else {
      console.log('newwwwwwwwwwwwwwww');
      $scope.refresh();
      $scope.dischargeSummForm.patient = $scope.data
      $scope.dischargeSummForm.primaryDoctor = $scope.data.docName
    }
  })
}

$scope.fetchInvoices();

  //form for discharge summary

  $scope.refresh = function () {

    $scope.dischargeSummForm = {
      ipNo  :'',
      treatingConsultant  :'',
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
      summaryKeyInvestigation : '',
      courseInHospital  :'',
      patientCondition  :'',
      advice  :'',
      reviewOn  :'',
      complications  :'',
      treatmentGiven : '',
      docList: [],
      docListPk: [],
      primaryDoctor:$scope.data.docName
    }
  }

  $timeout(function() {
    $scope.$watch('dischargeSummForm.patient.dateOfDischarge' , function(newValue , oldValue) {

      if (newValue == '' || newValue == undefined) {
        $scope.dischargeSummForm.patient.dateOfDischarge = new Date();
      }else{
        if (typeof newValue == 'string') {
          $scope.dischargeSummForm.patient.dateOfDischarge = new Date($scope.dischargeSummForm.patient.dateOfDischarge);
        }
      }

      $http({
        method: 'PATCH',
        url: '/api/patients/activePatient/' + $scope.data.pk + '/' ,
        data: {status: 'dishcharged' , dateOfDischarge: newValue },

      }).
      then(function(response) {
        // Flash.create('success', 'Saved');
      })
    })
  }, 500)

  $scope.chageStatus = function () {
    $http({
      method: 'PATCH',
      url: '/api/patients/activePatient/' + $scope.data.pk + '/' ,
      data: {status: 'dishcharged' , dateOfDischarge: new Date() },

    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      console.log('dataaaa', response.data);
      // $scope.data = response.data;
      $scope.dischargeSummForm.patient.dateOfDischarge = new Date();
    })
  }


  $scope.addDoctor = function(){
    if ($scope.dischargeSummForm.treatingConsultant.pk == undefined) {
      Flash.create('warning', 'Please Select Suggested Doctors');
      return
    }
    if ($scope.dischargeSummForm.docListPk.indexOf($scope.dischargeSummForm.treatingConsultant.pk) >= 0) {
      Flash.create('warning', 'This Doctor Has Already Added');
      $scope.dischargeSummForm.treatingConsultant = ''
      return
    }
    $scope.dischargeSummForm.docList.push($scope.dischargeSummForm.treatingConsultant)
    $scope.dischargeSummForm.docListPk.push($scope.dischargeSummForm.treatingConsultant.pk)
    $scope.dischargeSummForm.treatingConsultant = ''
  }
  $scope.removeDoctor = function(idx){
    $scope.dischargeSummForm.docList.splice(idx,1)
    $scope.dischargeSummForm.docListPk.splice(idx,1)
  }


  $scope.saveDischargeSumm = function() {

    console.log('here...');
    console.log($scope.dischargeSummForm);
    if (typeof $scope.dischargeSummForm.primaryDoctor != 'object') {
      Flash.create('warning', 'Please Fill Suggested Primary Doctor');
      return
    }

    $scope.copyOfDoctor = $scope.dischargeSummForm.primaryDoctor
    var toSend = $scope.dischargeSummForm
    toSend.patient = $scope.dischargeSummForm.patient.pk
    toSend.primaryDoctor = $scope.dischargeSummForm.primaryDoctor.pk
    delete toSend['treatingConsultant']
    delete toSend['docList']
    console.log('******************',toSend);

    if ($scope.dischargeSummForm.pk) {
      var method = 'PATCH'
      var url = '/api/patients/dischargeSummary/'+$scope.dischargeSummForm.pk +'/'
    }else {
      var method = 'POST'
      var url = '/api/patients/dischargeSummary/'
    }
      $http({
        method: method,
        url: url,
        data: toSend,

      }).
      then(function(response) {
        Flash.create('success', 'Saved');
        console.log('dataaaa', response.data);
        $scope.dischargeSummForm = response.data
        $scope.dischargeSummForm.primaryDoctor = $scope.copyOfDoctor
        $scope.dischargeSummForm.docList = $scope.dischargeSummForm.treatingConsultant
        $scope.dischargeSummForm.docListPk = []
        for (var i = 0; i < $scope.dischargeSummForm.docList.length; i++) {
          $scope.dischargeSummForm.docListPk.push($scope.dischargeSummForm.docList[i].pk)
        }
        $scope.dischargeSummForm.treatingConsultant = ''
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

  $scope.updatePayment = function(idx) {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.activePatients.makePayment.html',
      size: 'sm',
      backdrop: true,
      resolve: {
        invoiceData: function() {
          console.log($scope.invoices);
          console.log(idx);
          return $scope.invoices[idx];
        },
        indx: function() {
          return idx;
        }
      },
      controller: function($scope,indx, invoiceData, $uibModalInstance) {
        $scope.indx = indx;
        $scope.invoice = invoiceData;

        $scope.form = {
          discount : 0
        }

        $scope.saveInvoiceForm = function() {

          var toSend = {
            discount : $scope.form.discount,
            billed : true,
          }

          $http({
            method: 'PATCH',
            url: '/api/patients/invoice/' + $scope.invoice.pk + '/',
            data: toSend
          }).
          then(function(response) {
            // $scope.form.pk = response.data.pk;
            Flash.create('success', 'Saved');
            $uibModalInstance.dismiss();
          })


        }
      }
    }).result.then(function() {

    }, function() {
      $scope.fetchInvoices();
    });



  }

  $scope.openInvoice =function(pk) {
    window.open('/api/patients/downloadInvoice/?invoicePk=' + pk , '_blank');
  }

  $scope.openDischargeSummary =function(pk) {
    $scope.saveDischargeSumm()
    $timeout(function() {
      window.open('/api/patients/downloaddischargeSummary/?pPk=' + pk , '_blank');
    }, 500)
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
    getParams: [{key : 'outPatient' , value : false } , {key : 'status__ne' , value : 'settled'}],
    searchField: 'patient__firstName',
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
  $scope.doctorSearch = function(query) {
    return $http.get('/api/patients/doctor/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  // console.log('kkkkkkkkkkk',$scope.data);
  // console.log('kkkkkk',$scope.tab);

  if ($scope.tab!=undefined) {
    console.log('yesssss');
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

    // $scope.mode = 'edit'
    console.log('jjjjjjjjjjjjj',$scope.tab.data);
    $scope.activePatientsForm = $scope.tab.data;
    // $scope.selectedStatus = $scope.activePatientsForm.status

  }else {
    $scope.activePatientsForm = {
      patient: '',
      docName: '',
      inTime: new Date(),
      status: '',
      comments: '',
      mlc : false,
      cash : false,
      insurance : false,
    };
  }

  $scope.$watch('activePatientsForm.status' , function(newValue , oldValue) {
    console.log('newValue',newValue);
  })

  $scope.addNewActivePatient = function(name) {
    // $scope.addForm = true;
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.activePatients.addNewPatientModal.html',
      size: 'lg',
      backdrop: false,
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
        // $scope.newPatient = {
        //   firstName: '',
        //   lastName: '',
        //   dateOfBirth: '',
        //   gender: '',
        //   uniqueId: ''
        // };
        //
        // $scope.newPatient.firstName = $scope.name;
        //
        // $scope.generateUniqueId = function() {
        //   $scope.newPatient.uniqueId = new Date().getTime()
        //   console.log('generateeeee....');
        // }
        //
        // $scope.createPatient = function() {
        //
        //   dataToSend = {
        //     firstName: $scope.newPatient.firstName,
        //     lastName: $scope.newPatient.lastName,
        //     dateOfBirth: $scope.newPatient.dateOfBirth.toJSON().split('T')[0],
        //     gender: $scope.newPatient.gender,
        //     uniqueId: $scope.newPatient.uniqueId
        //   };
        //
        //   console.log('lklklkllklklklklkl', dataToSend);
        //
        //   $http({
        //     method: 'POST',
        //     url: '/api/patients/patient/',
        //     data: dataToSend
        //   }).
        //   then(function(response) {
        //     Flash.create('success', response.status + ' : ' + response.statusText);
        //     $scope.newPatient = {
        //       firstName: '',
        //       lastName: '',
        //       dateOfBirth: '',
        //       gender: '',
        //       uniqueId: ''
        //     };
        //     form.patient = response.data;
        //     $uibModalInstance.dismiss(form.patient);
        //   }, function(response) {
        //     Flash.create('danger', response.status + ' : ' + response.statusText);
        //   });
        //
        // }

        $scope.formRefresh = function() {
          $scope.newPatient = {
            firstName: $scope.name ,
            // lastName: '',
            gender:'',
            // dateOfBirth:'',
            uniqueId: '',
            age : '',
            // email: '',
            phoneNo: '',
            // emergencyContact1:'',
            // emergencyContact2:'',
            street:'',
            city:'Bangalore',
            pin:'',
            state:'Karnataka',
            country:'India'
          };
        }
        $scope.formRefresh();




        $scope.generateUniqueId = function() {
          $scope.newPatient.uniqueId = new Date().getTime()
          console.log('generateeeee....');
        }

        $scope.createPatient = function() {

          if ($scope.newPatient.firstName=='') {
            Flash.create('warning', 'Please fill First Name');
            return
          }

          if ($scope.newPatient.uniqueId=='') {
            Flash.create('warning', 'Please generate unique ID');
            return
          }
          if ($scope.newPatient.phoneNo=='') {
            Flash.create('warning', 'Please enter mobile no');
            return
          }

          // dataToSend = {
          //   firstName: $scope.newPatient.firstName,
          //   lastName: $scope.newPatient.lastName,
          //   dateOfBirth: $scope.newPatient.dateOfBirth.toJSON().split('T')[0],
          //   gender: $scope.newPatient.gender,
          //   uniqueId: $scope.newPatient.uniqueId
          // };

          console.log('lklklkllklklklklkl', $scope.newPatient);

          $http({
            method: 'POST',
            url: '/api/patients/patient/',
            data: $scope.newPatient
          }).
          then(function(response) {
            Flash.create('success', response.status + ' : ' + response.statusText);
              $scope.formRefresh()
              $uibModalInstance.dismiss(response.data);
          }, function(response) {
            Flash.create('danger', response.status + ' : ' + response.statusText);
          });


        }



      },
    }).result.then(function() {

    }, function(res) {
      console.log('ressssssssssssss', res);
      $scope.activePatientsForm.patient = res
      // $scope.activePatientsForm.patient = c;
    });

  }

  $scope.displayDetails = false;

  $scope.$watch('activePatientsForm.patient' , function(newValue , oldValue) {
    if (newValue.length ==0) {
      $scope.displayDetails = false;
      $scope.addNewPatient = false;
      return
    }
    console.log(newValue.length);
    if (typeof newValue == 'object') {
      $scope.addNewPatient = false;
      $scope.displayDetails = true;
      console.log('obbjjj' );
      if ($scope.activePatientsForm.pk==undefined) {
        $http.get('/api/patients/activePatient/?patient=' + newValue.pk + '&outPatient=false' ).
        then(function(response) {
          console.log(response.data);
          if (response.data.length>0) {
            Flash.create('danger', 'This patient is already added');
            $scope.activePatientsForm.patient = '';
            return ;
          }
        })
      }



    }else{
      $scope.addNewPatient = true;
      $scope.displayDetails = false;
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
    if ($scope.activePatientsForm.docName == '' || $scope.activePatientsForm.docName.pk == undefined) {
      Flash.create('danger', 'please Select Suggested Doctor Name');
      return
    }

    // if ($scope.mode=='edit') {
    //   console.log('ffffffffffff');
    //   console.log('patchhhhh');
    // }else {
    //   console.log('postttttt');
    // }


    dataToSend = {
      patient: $scope.activePatientsForm.patient.pk,
      inTime: $scope.activePatientsForm.inTime,
      docName: $scope.activePatientsForm.docName.pk,
      mlc: $scope.activePatientsForm.mlc,
      cash: $scope.activePatientsForm.cash,
      insurance: $scope.activePatientsForm.insurance,
    };

    if ($scope.activePatientsForm.pk!=undefined) {
      dataToSend.status = $scope.activePatientsForm.status
      var m = 'PATCH'
      var url = '/api/patients/activePatient/'+ $scope.activePatientsForm.pk +'/'
    }else {
      var m = 'POST'
      var url = '/api/patients/activePatient/'
    }

    console.log(dataToSend);

    $http({
      method: m,
      url: url,
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);

      if ($scope.activePatientsForm.pk==undefined) {

        $scope.activePatientsForm = {
          patient: '',
          docName: '',
          inTime: new Date(),
          status: '',
          comments: ''
        };
      }

    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }

});

app.controller('hospitalManagement.activePatients.editDetails', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {



});
