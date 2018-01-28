app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.contract', {
    url: "/contract",
    templateUrl: '/static/ngTemplates/app.warehouse.contract.html',
    controller: 'businessManagement.warehouse.contract'
  });
});

app.controller("businessManagement.warehouse.contract.explore", function($scope, $state, $users, $stateParams, $http, Flash) {
  if ($scope.data != undefined) {
    $scope.contract = $scope.data.tableData[$scope.tab.data.index]
  }
  console.log($scope.contract);

});

app.controller("businessManagement.warehouse.contract.item", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller('businessManagement.warehouse.contract', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.contract.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/warehouse/contract/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit contract : ';
          var appType = 'contractEditor';
        } else if (action == 'details') {
          var title = 'Contract Details : ';
          var appType = 'contractExplorer';
        }
        console.log("sampleee");
        console.log($scope.data.tableData[i]);
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          // data: {
          //   pk: target,
          //   index: i,
          //   contract : $scope.data.tableData[i]
          // },
          data:$scope.data.tableData[i],
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


app.controller("businessManagement.warehouse.contract.form", function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.contract = {company : '' , rate : 0 , dueDays : 0 ,quantity : 0 ,contractPaper : emptyFile ,billingFrequency : 0 ,billingDates : '' ,unitType : 'sqft' ,otherDocs : emptyFile ,occupancy: ''}
  $scope.dates=[]
  for (var i = 1; i < 29; i++) {
    $scope.dates.push(i.toString());
  }
  $scope.addDate=function(date){
    $scope.contract.billingDates +=$scope.contract.billingDates == ''? date : ','+date;
  }
  if ($scope.tab == undefined || $scope.tab.data == undefined) {
    $scope.mode = 'new';
    console.log('in new');
  }else {
    $scope.mode = 'edit';
    $scope.contract = $scope.tab.data
    console.log('edited form');
  }

  $scope.serviceSearch = function(query) {
    return $http.get( '/api/warehouse/service/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.resetForm=function(){
    $scope.contract = {company : undefined , rate : 0 , dueDays : 0 ,quantity : 0 ,contractPaper : emptyFile ,billingFrequency : 0 ,billingDates : '' ,unitType : 'sqrt' ,otherDocs : emptyFile ,occupancy: ''}
  }

  $scope.save= function(){
    console.log('entered');
    var f = $scope.contract;
    if (f.company.length == 0) {
      Flash.create('warning' , 'Company can not be blank');
      return;
    }else if (typeof f.company != "object") {
      Flash.create('warning' , "Company doesn't exist!");
      return;
    }
    if (f.occupancy.length == 0){
      Flash.create('warning',"Occupancy Can't be Null");
    }
    var url = '/api/warehouse/contract/';
    if ($scope.mode == 'new'){
      var method = 'POST';
    }else {
      var method = 'PATCH';
      url += $scope.tab.data.pk +'/';    // $scope.tab.data.service.pk +'/';
    }

    var tosend = new FormData();
    if (f.contractPaper != emptyFile && f.contractPaper != null) {
      tosend.append('contractPaper' , f.contractPaper)
    }
    if (f.otherDocs != emptyFile && f.otherDocs != null) {
      tosend.append('otherDocs' , f.otherDocs)
    }
    if (f.billingFrequency != f.billingDates.split(',').length){
      Flash.create('warning' , 'BillingDates count Should Be Equal To BillingFrequency ');
      return;
    }
    tosend.append('company' , f.company.pk);
    tosend.append('billingFrequency' , f.billingFrequency);
    tosend.append('billingDates' , f.billingDates);
    tosend.append('rate' , f.rate);
    tosend.append('quantity' , f.quantity);
    tosend.append('unitType' , f.unitType);
    tosend.append('dueDays' , f.dueDays);
    tosend.append('occupancy' , f.occupancy);
    console.log(tosend);

    $http({
      method: method,
      url: url,
      data: tosend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      if ($scope.mode == 'new') {
        $scope.contract.pk = response.data.pk;
        Flash.create('success', 'Created');
        $scope.resetForm()
        // $scope.mode = 'edit';
      }else{
        Flash.create('success', 'Saved')
      }
      console.log('sampleee');
      console.log(response.data);
    })
  };

});
