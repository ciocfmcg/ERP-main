app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.contract', {
    url: "/contract",
    templateUrl: '/static/ngTemplates/app.warehouse.contract.html',
    controller: 'businessManagement.warehouse.contract'
  });
});

app.controller("businessManagement.warehouse.contract.quote", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModalInstance , quoteData,) {
  $scope.quote = quoteData;
  $scope.firstQuote = false;
  $scope.types  = crmRelationTypes;
  $scope.total = $scope.quote.value;
  $scope.data = $scope.quote.data;

  $scope.resetForm = function() {
    $scope.form = {type : 'onetime' , quantity : 0 , tax : 0 , rate : 0 , desc : '' , productMeta : ''};
  }
  $scope.searchTaxCode = function(c) {
    return $http.get('/api/clientRelationships/productMeta/?description__contains='+c).
    then(function(response) {
      return response.data;
    })
  }
  $scope.$watch('form.productMeta' , function(newValue , oldValue) {
    if (typeof newValue == 'object') {
      $scope.showTaxCodeDetails = true;
    }else {
      $scope.showTaxCodeDetails = false;
    }
  })
  $scope.setType = function(typ) {
    $scope.form.type = typ;
  }
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };
  $scope.remove = function(idx) {
    $scope.data.splice(idx , 1);
  }
  $scope.edit = function(idx) {
    var d = $scope.data[idx];
    $scope.form = {type : d.type , quantity : d.quantity , tax : d.tax , rate : d.rate , desc : d.desc};
    $http({method : 'GET' , url : '/api/clientRelationships/productMeta/?code='+d.taxCode}).
    then(function(response) {
      $scope.form.productMeta = response.data[0];
    })
    $scope.data.splice(idx , 1);
  }
  $scope.calculateTotal = function() {
    var total = 0;
    var totalTax = 0;
    var grandTotal = 0;
    for (var i = 0; i < $scope.data.length; i++) {
      $scope.data[i].total = parseInt($scope.data[i].quantity) * parseInt($scope.data[i].rate);
      $scope.data[i].totalTax = $scope.data[i].total * parseInt($scope.data[i].tax)/100;
      $scope.data[i].subtotal = $scope.data[i].totalTax + $scope.data[i].total;
      total += $scope.data[i].total;
      totalTax += $scope.data[i].totalTax;
      grandTotal += $scope.data[i].subtotal;
    }

    $scope.totalTax = totalTax;
    $scope.total = total;
    $scope.grandTotal = grandTotal;
    $scope.quote.calculated = {value : total , tax : totalTax , grand : grandTotal}

  }

  $scope.add = function() {
    console.log('entered');
    if ($scope.form.tax>70) {
      Flash.create('warning' , 'The tax rate is unrealistic');
      return;
    }
    $scope.data.push({type : $scope.form.type , tax: $scope.form.productMeta.taxRate , desc : $scope.form.desc , rate : $scope.form.rate , quantity : $scope.form.quantity, taxCode : $scope.form.productMeta.code})
    $scope.resetForm();
  }
  $scope.resetForm();
  $scope.$watch('data' , function(newValue , oldValue) {
    $scope.calculateTotal();
  }, true)

});
app.controller("businessManagement.warehouse.contract.explore", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside, $timeout, $uibModal) {
  $scope.contract = $scope.tab.data;
  console.log('invoice');
  $scope.fetchInvoice = function() {
    $scope.contract.invoice=[];
    $http({method : 'GET' , url : '/api/warehouse/invoice/'}).
    then(function(response){
      for (var i=0;  i<response.data.length; i++){
        if(response.data[i].contract==$scope.contract.pk){
          response.data[i].data = JSON.parse(response.data[i].data );
          $scope.contract.invoice.push(response.data[i]);
        }
      }
    })
  }
  $scope.fetchInvoice();
  console.log($scope.contract);
  console.log($scope.contract.invoice);

  $scope.contactSearch = function() {
    return $http.get( '/api/warehouse/contact/').
    then(function(response){
      $scope.contract.contact=response.data;
    })
  };
  $scope.contactSearch();

  $scope.editQuote = function(idx) {
    if (typeof idx == 'number') {
      $scope.quoteInEditor = $scope.contract.invoice[idx];
    }else {
      $scope.quoteInEditor = {data : [] , value : 0 , doc : null , status : 'quoted'  , details: '' , pk : null}
    }
    console.log('in quote');
    $aside.open({
      templateUrl : '/static/ngTemplates/app.warehouse.quote.form.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        quoteData : function() {
          return $scope.quoteInEditor;
        },
      },
      controller : 'businessManagement.warehouse.contract.quote'
    }).result.then(function () {

    }, function () {
      console.log('submitting');
      console.log($scope.contract.pk);
      console.log($scope.contract);
      var method;
      var url = '/api/warehouse/invoice/'
      if ($scope.quoteInEditor.pk == null) {
        method = 'POST'
      }else {
        method = 'PATCH'
        url += $scope.quoteInEditor.pk +'/'
      }

      if ($scope.quoteInEditor.data.length == 0) {
        return;
      }
      var dataToSend = {contract : $scope.contract.pk , data : JSON.stringify($scope.quoteInEditor.data) , value : $scope.quoteInEditor.calculated.value , status : $scope.quoteInEditor.status };
      console.log($scope.quoteInEditor);
      console.log(dataToSend);
      console.log(url);
      console.log(method);
      $http({method : method , url : url , data : dataToSend}).
      then(function(response) {
        response.data.data = JSON.parse(response.data.data );
        if ($scope.contract.invoice.length == 0) {
          $scope.contract.invoice.push(response.data);
        }else {
          for (var i = 0; i < $scope.contract.invoice.length; i++) {
            if ($scope.contract.invoice[i].pk == response.data.pk) {
              $scope.contract.invoice[i] = response.data;
            }else {
              $scope.contract.invoice.push(response.data);
            }
          }
        }
        $scope.fetchInvoice();
      })
      // $scope.fetchInvoice();
      console.log($scope.quoteData);
    });

  }

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

  $scope.contract = {company : '' , rate : 0 , dueDays : 0 ,quantity : 0 ,contractPaper : emptyFile ,billingFrequency : 0 ,billingDates : '' ,unitType : 'sqft' ,otherDocs : emptyFile ,occupancy: '' }
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
