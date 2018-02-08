app.controller("businessManagement.clientRelationships.relationships.quote", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModalInstance , quoteData, currency) {

  $scope.quote = quoteData;
  $scope.firstQuote = false;
  $scope.types  = crmRelationTypes;
  $scope.currency = ['inr' , 'usd']

  $scope.total = $scope.quote.value;
  $scope.data = $scope.quote.data;

  $scope.resetForm = function() {
    $scope.form = { currency : currency , type : 'onetime' , quantity : 0 , tax : 0 , rate : 0 , desc : '' , productMeta : ''};
  }

  $scope.$watch('form.productMeta' , function(newValue , oldValue) {
    if (typeof newValue == 'object') {
      $scope.showTaxCodeDetails = true;
    }else {
      $scope.showTaxCodeDetails = false;
    }
  })

  $scope.setCurrency = function(cur) {
    $scope.form.currency = cur;
  }

  $scope.setType = function(typ) {
    $scope.form.type = typ;
  }
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };

  $scope.remove = function(idx) {
    $scope.data.splice(idx , 1);
  }

  $scope.searchTaxCode = function(c) {
    return $http.get('/api/clientRelationships/productMeta/?description__contains='+c).
    then(function(response) {
      return response.data;
    })
  }

  $scope.edit = function(idx) {
    var d = $scope.data[idx];
    $scope.form = { currency : d.currency , type : d.type , quantity : d.quantity , tax : d.tax , rate : d.rate , desc : d.desc};

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
    if ($scope.form.tax>70) {
      Flash.create('warning' , 'The tax rate is unrealistic');
      return;
    }
    $scope.data.push({currency : $scope.form.currency , type : $scope.form.type , tax: $scope.form.productMeta.taxRate , desc : $scope.form.desc , rate : $scope.form.rate , quantity : $scope.form.quantity, taxCode : $scope.form.productMeta.code})
    $scope.resetForm();
  }

  $scope.resetForm();

  $scope.$watch('data' , function(newValue , oldValue) {
    $scope.calculateTotal();
  }, true)

});
app.controller("businessManagement.clientRelationships.relationships.quote.notification", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside , quote , deal , $uibModalInstance) {
  $scope.quote = quote;
  $scope.deal = deal;
  $scope.send = function() {
    var contacts = []
    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      if ($scope.deal.contacts[i].checked) {
        contacts.push($scope.deal.contacts[i].pk);
      }
    }

    var internal = []
    for (var i = 0; i < $scope.internalUsers.length; i++) {
      internal.push($scope.internalUsers[i]);
    }

    var toSend = {
      sendEmail : $scope.sendEmail,
      sendSMS : $scope.sendSMS,
      internal : internal,
      contacts : contacts,
      type : $scope.notificationType,
      contract : $scope.quote.pk
    }
    $http({method : 'POST' , url : '/api/clientRelationships/sendNotification/' , data : toSend}).
    then(function() {

    }, function() {
      $scope.reset();
    })
  }




  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };

  $scope.reset = function() {
    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      $scope.deal.contacts[i].checked = false;
    }
    $scope.notificationType = 'Please select';
    $scope.sendEmail = false;
    $scope.sendSMS = false;
    $scope.internalUsers = [];
  }

  $scope.reset();


});


app.controller("businessManagement.clientRelationships.relationships.manage", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside, $timeout, $uibModal) {


  $scope.changeStatus = function(status , indx) {
    $scope.deal.contracts[indx].status = status;

    if (status == 'billed') {
      $uibModal.open({
        template: '<div style="padding:30px;"><div class="form-group"><label>Due Date</label>'+
            '<div class="input-group" >'+
                '<input type="text" class="form-control" show-weeks="false" uib-datepicker-popup="dd-MMMM-yyyy" ng-model="contract.dueDate" is-open="status.opened" />' +
                '<span class="input-group-btn">'+
                  '<button type="button" class="btn btn-default" ng-click="status.opened = true;"><i class="glyphicon glyphicon-calendar"></i></button>'+
                '</span>'+
              '</div><p class="help-block">Auto set based on Deal due period.</p>'+
          '</div></div>',
        size: 'sm',
        backdrop : true,
        resolve : {
          contract : function() {
            return $scope.deal.contracts[indx];
          },
          deal : function() {
            return $scope.deal;
          }
        },
        controller: function($scope , contract, deal){
          $scope.contract = contract;
          var dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + deal.duePeriod);
          if ($scope.contract.dueDate == null) {
            $scope.contract.dueDate = dueDate;
          }
          $scope.deal = deal;
        },
      }).result.then(function () {

      }, (function(indx, status) {
        return function () {
          console.log(indx);
          console.log($scope.deal.contracts[indx].dueDate);

          $http({method : 'PATCH' , url : '/api/clientRelationships/contract/' + $scope.deal.contracts[indx].pk + '/' , data : {status : status , dueDate : $scope.deal.contracts[indx].dueDate.toISOString().substring(0, 10) }}).
          then(function(response) {
            $http({method : 'GET' , url : '/api/clientRelationships/downloadInvoice/?saveOnly=1&contract=' + response.data.pk}).
            then(function(response) {
              Flash.create('success' , 'Saved')
            }, function(err) {
              Flash.create('danger' , 'Error occured')
            })
          })



        }
      })(indx, status));



    }else if (status == 'dueElapsed') {

      var sacCode = 998311;
      var c = $scope.deal.contracts[indx];
      for (var i = 0; i < c.data.length; i++) {
        if (c.data[i].taxCode == sacCode) {
          return;
        }
      }

      var fineAmount = $scope.deal.contracts[indx].value * $scope.deal.duePenalty*(1/100)

      $http({method : 'GET' , url : '/api/clientRelationships/productMeta/?code='+ sacCode}).
      then((function(indx) {
        return function(response) {
          var quoteInEditor = $scope.deal.contracts[indx]
          var productMeta = response.data[0];
          var subTotal = fineAmount*(1+productMeta.taxRate/100)
          quoteInEditor.data.push({currency : $scope.deal.currency , type : 'onetime' , tax: productMeta.taxRate, desc : 'Late payment processing charges' , rate : fineAmount , quantity : 1, taxCode : productMeta.code , totalTax : fineAmount*(productMeta.taxRate/100), subtotal : subTotal })

          quoteInEditor.value += subTotal
          var url = '/api/clientRelationships/contract/' + quoteInEditor.pk + '/'
          var method = 'PATCH'
          var dataToSend = {deal : $scope.deal.pk , data : JSON.stringify(quoteInEditor.data) , value : quoteInEditor.value};
          $http({method : method , url : url , data : dataToSend}).
          then(function(response) {
            $http({method : 'GET' , url : '/api/clientRelationships/downloadInvoice/?saveOnly=1&contract=' + response.data.pk}).
            then(function(response) {
              Flash.create('success' , 'Saved')
            }, function(err) {
              Flash.create('error' , 'Error occured')
            })
          })
        }
      })(indx))


    }else {

      $http({method : 'PATCH' , url : '/api/clientRelationships/contract/' + $scope.deal.contracts[indx].pk + '/' , data : {status : status}}).
      then(function(response) {

      })

    }


  }

  $scope.sendNotification = function(indx){

    $scope.quote = $scope.deal.contracts[indx];

    $aside.open({
      templateUrl : '/static/ngTemplates/app.clientRelationships.quote.notification.html',
      placement: 'right',
      size: 'lg',
      backdrop : false,
      resolve: {
        quote : function() {
          return $scope.quote;
        },
        deal : function() {
          return $scope.deal;
        },
      },
      controller : 'businessManagement.clientRelationships.relationships.quote.notification'
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

        $timeout(function() {
          // $scope.sendNotification()
        }, 1000)
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

app.controller("businessManagement.clientRelationships.relationships", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {

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

  // $timeout(function() {
  //   $scope.addTab({"title":"Manage : DWR project","cancel":true,"app":"manageRelation","data":{"pk":9},"active":true})
  // }, 1000)


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
