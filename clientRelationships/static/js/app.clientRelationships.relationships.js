app.controller("businessManagement.clientRelationships.relationships.quote", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModalInstance , quoteData, currency) {

  $scope.quote = quoteData;

  $scope.types  = crmRelationTypes;
  $scope.currency = ['inr' , 'usd']

  $scope.total = $scope.quote.value;
  $scope.data = $scope.quote.data;

  $scope.resetForm = function() {
    $scope.form = { currency : currency , type : 'onetime' , quantity : 0 , tax : 0 , rate : 0 , desc : ''};
  }

  $scope.setCurrency = function(cur) {
    $scope.form.currency = cur;
  }

  $scope.setType = function(typ) {
    $scope.form.type = typ;
  }
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };

  $scope.edit = function(idx) {
    var d = $scope.data[idx];
    $scope.form = { currency : d.currency , type : d.type , quantity : d.quantity , tax : d.tax , rate : d.rate , desc : d.desc};
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
    if ($scope.form.tax>70) {
      Flash.create('warning' , 'The tax rate is unrealistic');
      return;
    }
    $scope.data.push({currency : $scope.form.currency , type : $scope.form.type , tax: $scope.form.tax , desc : $scope.form.desc , rate : $scope.form.rate , quantity : $scope.form.quantity})
    $scope.resetForm();
  }

  $scope.resetForm();

  $scope.$watch('data' , function(newValue , oldValue) {
    $scope.calculateTotal();
  }, true)

});

app.controller("businessManagement.clientRelationships.relationships.manage", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside) {


  $scope.changeStatus = function(status , indx) {
    $scope.deal.contracts[indx].status = status;
    $http({method : 'PATCH' , url : '/api/clientRelationships/contract/' + $scope.deal.contracts[indx].pk + '/' , data : {status : status}}).
    then(function(response) {

    })
  }


  $scope.editQuote = function(idx) {
    if (typeof idx == 'number') {
      $scope.quoteInEditor = $scope.deal.contracts[idx];
    }else {
      $scope.quoteInEditor = {data : [] , value : 0 , doc : null , status : 'quoted'  , details: '' , pk : null}
    }

    $aside.open({
      templateUrl : '/static/ngTemplates/app.clientRelationships.quote.form.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        quoteData : function() {
          return $scope.quoteInEditor;
        },
        currency : function() {
          return $scope.deal.currency;
        }
      },
      controller : 'businessManagement.clientRelationships.relationships.quote'
    }).result.then(function () {

    }, function () {
      var method;
      var url = '/api/clientRelationships/contract/'
      if ($scope.quoteInEditor.pk == null) {
        method = 'POST'
      }else {
        method = 'PATCH'
        url += $scope.quoteInEditor.pk +'/'
      }

      if ($scope.quoteInEditor.data.length == 0) {
        return;
      }
      var dataToSend = {deal : $scope.deal.pk , data : JSON.stringify($scope.quoteInEditor.data) , value : $scope.quoteInEditor.calculated.value};
      console.log($scope.quoteInEditor);
      console.log(dataToSend);
      console.log(url);
      console.log(method);
      $http({method : method , url : url , data : dataToSend}).
      then(function(response) {
        if ($scope.quoteInEditor.pk == null) {
          $scope.deal.contracts.push(response.data)
        }else {
          for (var i = 0; i < $scope.deal.contracts.length; i++) {
            if ($scope.deal.contracts[i].pk == response.data.pk) {
              $scope.deal.contracts[i] = response.data;
              $scope.deal.contracts[i].data = JSON.parse($scope.deal.contracts[i].data );
            }
          }
        }

      })

      console.log($scope.quoteData);
    });
  }

  $scope.fetchContracts = function() {
    for (var i = 0; i < $scope.deal.contracts.length; i++) {
      $http({method : 'GET' , url : '/api/clientRelationships/contract/' + $scope.deal.contracts[i] +'/'}).
      then(function(response) {
        for (var i = 0; i < $scope.deal.contracts.length; i++) {
          if ($scope.deal.contracts[i] == response.data.pk) {
            $scope.deal.contracts[i] = response.data;
            $scope.deal.contracts[i].data = JSON.parse(response.data.data);
            break
          }
        }
        // $scope.editQuote();
      })
    }
  }


  $scope.fetchDeal = function() {
    $http({method : 'GET' , url : '/api/clientRelationships/deal/' + $scope.tab.data.pk + '/'}).
    then(function(response) {
      $scope.deal = response.data;
      $scope.deal.requirements = $sce.trustAsHtml(response.data.requirements);
      console.log($scope.deal);
      $http({method : 'GET' , url : '/api/ERP/service/' + response.data.company.pk +'/'}).
      then(function(response) {
        $scope.deal.company = response.data;
        $scope.fetchContracts();

      });

    });
  }
  $scope.minInfo = false;
  $scope.fetchDeal();

});

app.controller("businessManagement.clientRelationships.relationships.item", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.expanded = false;

  $scope.toggleExpand = function() {
    $scope.expanded = !$scope.expanded;
  }
  ///api/clientRelationships/deal/?&name__contains=&limit=16&offset=0&created=0&lost=0&won=1
  $scope.fetchDeals = function() {
    $http({method : 'GET' , url : '/api/clientRelationships/dealLite/?result=won&company='+ $scope.data.pk}).
    then(function(response) {
      $scope.data.deals = response.data;
    })
  }

  $scope.$watch('data.deals' , function(newValue , oldValue) {
    if (newValue == undefined) {
      $scope.fetchDeals();
    }
  });

});

app.controller("businessManagement.clientRelationships.relationships", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.clientRelationships.relationships.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/clientRelationships/relationships/',
    searchField: 'name',
    itemsNumPerView: [5, 10, 20],
    // getParams : [{key : 'result' , value : 'won'}]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Contact :';
          var appType = 'contactEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'contactExplorer';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
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

  $scope.$on('exploreRelation' , function(evt, input) {
    $scope.addTab({
      "title": "Manage : " + input.name,
      "cancel": true,
      "app": "manageRelation",
      "data": {
        "pk": input.pk,
      },
      "active": true
    })
  })

  // $scope.addTab({"title":"Manage : Win in HCL","cancel":true,"app":"manageRelation","data":{"pk":10},"active":true});


});
