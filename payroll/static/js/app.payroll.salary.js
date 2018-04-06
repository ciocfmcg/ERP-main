app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.payroll.salary', {
      url: "/salary",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.payroll.salary.html',
          controller: 'workforceManagement.salary',
        }
      }
    })
});

app.controller("controller.warehouse.payroll.openReportInfo", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $uibModalInstance, usr) {

  $http({
    method: 'GET',
    url: '/api/HR/payroll/?user=' + usr
  }).then(function(response) {
    $scope.payroll = response.data[0];
    console.log($scope.payroll);
  })

})


app.controller("workforceManagement.salary.payroll.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = $scope.tab.data;

  // $scope.yearInView = $scope.data.joiningDate;
  $scope.yearInView = 2014;

  $scope.joiningDate = new Date('2014-04-02');
  $scope.lastWorkingDate = new Date();

  $scope.$watch('yearInView', function(newValue, oldValue) {

    if (newValue == 2014) {
      $scope.months = ['04', '05', '06', '07', '08', '09', '10', '11', '12']
    } else if (newValue == 2015) {
      $scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    } else if (newValue == new Date()) {
      $scope.months == new Date();
    }

  })

  $scope.next = function() {
    $scope.yearInView += 1;
  }

  $scope.prev = function() {
    $scope.yearInView -= 1;
  }


})

app.controller("workforceManagement.salary.payslips.info", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = $scope.tab.data;

  $scope.months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "Octobar", "November", "December"]
  //
    $scope.reportData = [];

    $http({
    method: 'GET',
    url: '/api/payroll/payslip/?month='+$scope.data.month
  }).
  then(function(response) {
    $scope.reportData = response.data;
    console.log($scope.reportData);
    // console.log($scope.checkin.pk);
  })



})


app.controller("workforceManagement.salary.payroll.report", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {


  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  var today = new Date();
  $scope.selectedYear = today.getFullYear();
  $scope.selectedMonth = today.getMonth() + 1 + '';


  // $scope.data = $scope.tab.data;



  $scope.data = []

  $scope.daysInMonth = new Date(parseInt($scope.selectedYear), parseInt($scope.selectedMonth), 0).getDate();

  $scope.initializeSheet = function() {

    var toDelete = [];
    for (var i = 0; i < $scope.report.payslips.length; i++) {
      toDelete.push($scope.report.payslips[i].payslipID);
    }

    for (var i = 0; i < toDelete.length; i++) {
      $http({
        method: 'DELETE',
        url: '/api/payroll/payslip/' + toDelete[i] + '/'
      }).
      then(function(response) {

      })
    }


    $http({
      method: 'GET',
      url: '/api/HR/payroll/'
    }).
    then(function(response) {
      $scope.report.payslips = [];
      console.log('******************', response.data);

      for (var i = 0; i < response.data.length; i++) {
        response.data[i].adHoc = 0;
        response.data[i].reimbursement = 0;
        // response.data[i].totalTDS = $scope.totalTDS;
        response.data[i].days = $scope.daysInMonth;
        response.data[i].saved = false;
        response.data[i].amount = ((response.data[i].hra + response.data[i].special + response.data[i].lta + response.data[i].basic + response.data[i].adHoc) / 12).toFixed(2);
        response.data[i].tds = ((((response.data[i].hra + response.data[i].special + response.data[i].lta + response.data[i].basic + response.data[i].adHoc) / 12) + response.data[i].adHoc) * 0.1).toFixed(2);
        response.data[i].totalPayable = (((((response.data[i].hra + response.data[i].special + response.data[i].lta + response.data[i].basic + response.data[i].adHoc) / 12) + response.data[i].adHoc) * 0.9) + response.data[i].reimbursement).toFixed(2);

        $scope.report.payslips.push(response.data[i]);
      }
    })
  }


  $scope.openReportInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.salary.payroll.openReportInfo.html',
      size: 'md',
      backdrop: true,
      resolve: {
        usr: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.report.payslips[idx].user;
          }
        }
      },
      controller: "controller.warehouse.payroll.openReportInfo",
    }).result.then(function() {

    }, function() {
      // $rootScope.$broadcast('forceRefetch' , {});
    });



  }

  $scope.deffer = function(indx) {
    $scope.report.payslips[indx].deffered = true;
    if ($scope.report.payslips[indx].payslipID != undefined) {
      $http({
        method: 'PATCH',
        url: '/api/payroll/payslip/' + $scope.report.payslips[indx].payslipID + '/',
        data: {
          deffered: true
        }
      }).
      then(function(response) {

      })
    }
  }

  $scope.saveIndividualPayslip = function(id, indx) {
    var url = '/api/payroll/payslip/'
    if (id == undefined) {
      method = 'POST';
    } else {
      method = 'PATCH';
      url += id + '/'
    }

    var toSend = {
      tds: $scope.report.payslips[indx].tds,
      adHoc: $scope.report.payslips[indx].adHoc,
      days: $scope.report.payslips[indx].days,
      report: $scope.report.pk,
      user: $scope.report.payslips[indx].user,
      month: $scope.selectedMonth,
      year: $scope.selectedYear,
      amount: $scope.report.payslips[indx].amount,
      totalPayable: $scope.report.payslips[indx].totalPayable,
      reimbursement: $scope.report.payslips[indx].reimbursement,
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then((function(indx) {
      return function(response) {
        $scope.report.payslips[indx].payslipID = response.data.pk;
      }
    })(indx))
  }

  $scope.fetchOrCreate = function() {



    $http({
      method: 'GET',
      url: '/api/payroll/report/?month=' + $scope.selectedMonth + '&year=' + $scope.selectedYear
    }).
    then(function(response) {
      if (response.data.length == 0) {
        // the report was not created

        $http({
          method: 'POST',
          url: '/api/payroll/report/',
          data: {
            month: $scope.selectedMonth,
            year: $scope.selectedYear
          }
        }).
        then(function(response) {
          $scope.report = response.data;
          $scope.initializeSheet();
        })

      } else {
        $scope.report = response.data[0];
        for (var i = 0; i < $scope.report.payslips.length; i++) {
          $scope.report.payslips[i].payslipID = $scope.report.payslips[i].pk;
        }


      }
    })
  }

  $scope.save = function(submit) {
    // make a POST request with : total , totalTDS
    var toSend = {
      total: 0,
      totalTDS: 0
    }
    if (submit) {
      toSend.status = 'submitted';
    }

    $http({
      method: 'PATCH',
      url: '/api/payroll/' + $scope.report.pk + '/',
      data: toSend
    }).
    then(function() {

    })

  }

  $scope.submit = function() {
    $scope.save(true);
  }

  $scope.cancel = function(e) {
    console.log("eeeeeeeeeeeeee");
    $uibModalInstance.dismiss();
  };

  $scope.$watch('selectedYear', function() {
    $scope.fetchOrCreate();
  })

  $scope.$watch('selectedMonth', function() {
    $scope.fetchOrCreate();
  })


  $scope.years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]


  $scope.months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "Octobar", "November", "December"]

  // $scope.reportData = [];
  // // if ($scope.report != undefined){
  // $http({
  //   method: 'GET',
  //   url: '/api/payroll/report/?month=' + $scope.months
  // }).
  // then(function(response) {
  //   $scope.reportData = response.data;

    // console.log('******************', response.data);
    // // $scope.reportData = response.data;
    // for (var i = 0; i < response.data.length; i++) {
    //   $scope.reportData.push(response.data[i]);
    // }



  // })


})

app.controller('workforceManagement.salary.payroll.report.item', function($scope) {

  $scope.months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "Octobar", "November", "December"]

});



app.controller("workforceManagement.salary", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $aside) {


  $scope.data = {
    tableData: [],
    allTableData: [],
    // reportTableData: []
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.payroll.salary.allitems.html',
  }, ];

  $scope.configAll = {
    views: views,
    url: '/api/HR/payroll/',
    searchField: 'user',
    itemsNumPerView: [8, 16, 24],
    // multiselectOptions: multiselectOptions,
  }


  $scope.tableActionAll = function(target, action, mode) {
    for (var i = 0; i < $scope.data.allTableData.length; i++) {
      if ($scope.data.allTableData[i].pk == parseInt(target)) {
        if (action == 'explore') {
          var title = 'payroll :';
          var appType = 'payrollExplorer';
        }


        console.log({
          title: title + $scope.data.allTableData[i],
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({

          title: title + $scope.data.allTableData[i].user,
          cancel: true,
          app: appType,
          data: $scope.data.allTableData[i],
          active: true
        })
      }
    }

  }


  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.payroll.salary.reportitems.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/payroll/report',
    searchField: 'username',
    itemsNumPerView: [8, 16, 24],
    multiselectOptions: multiselectOptions,
  }



  $scope.tableAction = function(target, action, mode) {
    if (action == 'new') {
      $aside.open({
        templateUrl: '/static/ngTemplates/app.payroll.salary.report.html',
        placement: 'right',
        size: 'xl',
        backdrop: true,
        resolve: {

        },
        controller: 'workforceManagement.salary.payroll.report'
      })
    } else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'details') {
            var title = 'Report :';
            var appType = 'reportExplorer';
          }


          console.log({
            title: title + $scope.data.tableData[i],
            cancel: true,
            app: appType,
            data: {
              pk: target,
              index: i
            },
            active: true
          });


          $scope.addTab({

            title: title + $scope.data.tableData[i].pk,
            cancel: true,
            app: appType,
            data: $scope.data.tableData[i],
            active: true
          })
        }
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
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
