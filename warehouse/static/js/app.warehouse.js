app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.warehouse', {
    url: "/warehouse",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.warehouse": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.warehouse": {
          templateUrl: '/static/ngTemplates/app.warehouse.default.html',
          controller : 'businessManagement.warehouse.default',
        }
    }
  })
  // .state('businessManagement.warehouse.expenses', {
  //   url: "/service",
  //   templateUrl: '/static/ngTemplates/app.warehouse.service.html',
  //   controller: 'businessManagement.warehouse.service'
  // })

});


app.controller('businessManagement.warehouse.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller
  console.log('ssssssssssssssssss');
  $scope.serchField = ''
  $scope.$watch('serchField', function(newValue, oldValue) {
    console.log(newValue);
    if (newValue.length==0) {
      var url = '/api/warehouse/dashboardInvoices/'
    }else {
      var url = '/api/warehouse/dashboardInvoices/?cName='+newValue
    }
    $http({method : 'GET' , url : url}).
    then(function(response) {
      console.log(response);
      $scope.invData = response.data
    })
  })

  $scope.changeStatus = function(status , indx) {
    $scope.invData[indx].status = status;

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

})
// app.config(function($stateProvider){
//
//   $stateProvider
//   .state('businessManagement.warehouse', {
//     url: "/warehouse",
//     views: {
//        "": {
//           templateUrl: '/static/ngTemplates/genericAppBase.html',
//        },
//        "menu@businessManagement.warehouse": {
//           templateUrl: '/static/ngTemplates/genericMenu.html',
//           controller : 'controller.generic.menu',
//         },
//         "@businessManagement.warehouse": {
//           templateUrl: '/static/ngTemplates/app.warehouse.default.html',
//
//           controller : 'businessManagement.warehouse.default',
//         }
//     }
//   })
//
// });
// app.controller("businessManagement.warehouse.default", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {
//
// });
//
//           // controller : 'businessManagement.warehouse.default',
//         }
//     }
//   })
//   // .state('businessManagement.warehouse.expenses', {
//   //   url: "/service",
//   //   templateUrl: '/static/ngTemplates/app.warehouse.service.html',
//   //   controller: 'businessManagement.warehouse.service'
//   // })
//
// });


// app.controller('businessManagement.warehouse.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
//   // settings main page controller
//
//
// })
