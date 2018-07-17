// app.controller('businessManagement.ecommerce.orders.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){
//   $scope.bookingTime = function() {
//     return Math.ceil((new Date($scope.data.end)- new Date($scope.data.start))/3600000);
//   }
//   $scope.getBookingAmount = function(){
//     h = $scope.bookingTime()
//     if (h<0){
//       return 0
//     }else {
//       return $scope.data.rate * $scope.data.quantity*h
//     }
//   }
//   $scope.$watch('data.offer' , function(newValue , oldValue){
//     if (typeof $scope.data.offer != 'number') {
//       return;
//     }
//     $http({method : 'GET' , url : '/api/ecommerce/offering/' + $scope.data.offer + '/'}).
//     then(function (response) {
//       $scope.data.offer = response.data;
//       $http({method : 'GET' , url : '/api/ecommerce/listing/' + response.data.item + '/' }).
//       then(function (response) {
//         $scope.data.item = response.data;
//       })
//     })
//   });
//   $scope.getStatusClass = function(input) {
//     if (input == 'inProgress') {
//       return 'fa-spin fa-spinner';
//     }else if (input == 'complete') {
//       return 'fa-check';
//     }else if (input == 'canceledByVendor') {
//       return 'fa-ban';
//     }else if (input == 'new') {
//       return 'fa-file'
//     }
//   }
//
// });
//
// app.controller('businessManagement.ecommerce.orders' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){
//
//   $scope.data = {tableData : []}
//
//   views = [{name : 'list' , icon : 'fa-bars' ,
//     template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
//     itemTemplate : '/static/ngTemplates/app.ecommerce.vendor.orders.item.html',
//   },];
//   var getParams = [{key : 'mode' , value : 'provider'}]
//
//   var options = {main : {icon : 'fa-print', text: 'print invoice'} ,
//     others : [
//       {icon : 'fa-check' , text : 'markComplete' },
//       {icon : '' , text : 'cancel' },
//       // {icon : '' , text : 'sendMessage' },
//       // {icon : '' , text : 'printAgreement' },
//     ]
//   };
//
//   $scope.config = {
//     views : views,
//     getParams : getParams,
//     url : '/api/ecommerce/order/',
//     options : options,
//     searchField : 'id',
//     fields : ['user' , 'created' , 'rate' , 'status' , 'paymentType' , 'paid' , 'quantity' , 'start' , 'end']
//   }
//
//   $scope.tabs = [];
//   $scope.searchTabActive = true;
//
//   $scope.closeTab = function(index){
//     $scope.tabs.splice(index , 1)
//   }
//
//   $scope.addTab = function( input ){
//     $scope.searchTabActive = false;
//     alreadyOpen = false;
//     for (var i = 0; i < $scope.tabs.length; i++) {
//       if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
//         $scope.tabs[i].active = true;
//         alreadyOpen = true;
//       }else{
//         $scope.tabs[i].active = false;
//       }
//     }
//     if (!alreadyOpen) {
//       $scope.tabs.push(input)
//     }
//   }
//
//   $scope.tableAction = function(target , action , mode){
//     for (var i = 0; i < $scope.data.tableData.length; i++) {
//       if ($scope.data.tableData[i].id == parseInt(target)){
//         index = i;
//         break;
//       }
//     }
//     // index is the index of the object in the table in the view and target is either the id or Pk of the object
//     if (action == 'printInvoice') {
//       $http.get('/api/ecommerce/printInvoice/?id=' + target ,'', {responseType:'arraybuffer'}).
//       success((function(target){
//         return function(response){
//           var file = new Blob([response], { type: 'application/pdf' });
//           var fileURL = URL.createObjectURL(file);
//           content = $sce.trustAsResourceUrl(fileURL);
//           $scope.addTab({title : 'Print Invocie for order ID : '+ target , cancel : true , app : 'print invoice' , data : {pk : target , content : content} , active : true})
//           }
//         })(target)
//       )
//     } else {
//       if (action == 'complete') {
//         status = 'complete';
//       } else if (action == 'reject') {
//         status = 'canceledByVendor';
//       } else if (action == 'progress') {
//         status = 'inProgress';
//       }
//       $http({method : 'PATCH' , url : '/api/ecommerce/order/'+target+'/?mode=provider', data : {status : status}}).
//       then((function(target){
//         console.log(target);
//         console.log($scope.data.tableData);
//         return function (response) {
//           for (var i = 0; i < $scope.data.tableData.length; i++) {
//             if ($scope.data.tableData[i].id == target) {
//               $scope.data.tableData[i].status = response.data.status;
//             }
//           }
//         }
//       })(target));
//     }
//   }
//
//
//
//
// });









app.controller('businessManagement.ecommerce.orders.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $sce) {

  console.log('KKKKKKKKKKKKKKKK', $scope.tab.data.order);
  $scope.order = $scope.tab.data.order
  $scope.expanded = false;
  // $scope.sts = 'aaa'
  $scope.orderItemCancel = function(idx) {
    console.log(idx, $scope.order.orderQtyMap[idx]);
    $http({
      method: 'PATCH',
      url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[idx].pk + '/',
      data: {
        status: 'cancelled'
      }
    }).
    then((function(idx) {
      return function(response) {
        console.log(response.data);
        $scope.order.orderQtyMap[idx].status = response.data.status
        $scope.order.orderQtyMap[idx].refundAmount = response.data.refundAmount
        $scope.order.orderQtyMap[idx].refundStatus = response.data.refundStatus
        var toSend = {value : response.data.pk};
        $http({method : 'POST' , url : '/api/ecommerce/sendStatus/' , data : toSend}).
        then(function(response) {
        })
        Flash.create('success', 'Item Has Cancelled');
        $scope.saveLog(idx, 'This Item Has Cancelled')
      }
    })(idx))
  }
  $scope.orderApproved = function(pk) {
    console.log(pk);
    $http({
      method: 'PATCH',
      url: '/api/ecommerce/order/' + pk + '/',
      data: {
        approved: true
      }
    }).
    then(function(response) {
      console.log(response.data);
      Flash.create('success', 'Approved');
      $scope.order.approved = response.data.approved
    })
  }
  $scope.saveLog = function(idx, msg) {
    console.log(idx, $scope.order.orderQtyMap[idx], msg);
    var tosend = {
      logTxt: msg,
      qMapPk: $scope.order.orderQtyMap[idx].pk
    }
    $http({
      method: 'POST',
      url: '/api/ecommerce/trackingLog/',
      data: tosend
    }).
    then((function(idx) {
      return function(response) {
        console.log(response.data);
        $scope.order.orderQtyMap[idx].logText = ''
        $scope.order.orderQtyMap[idx].trackingLog.push(response.data)
      }
    })(idx))
  }
  $scope.changeStatus = function(idx, sts) {
    $http({
      method: 'PATCH',
      url: '  /api/ecommerce/orderQtyMap/' + $scope.order.orderQtyMap[idx].pk + '/',
      data: {
        status: sts
      }
    }).
    then((function(idx, sts) {
      return function(response) {
        Flash.create('success', 'Status Changed To ' + sts);
        $scope.order.orderQtyMap[idx].status =   response.data.status
        $scope.saveLog(idx, 'This Item Has ' + sts)
        var toSend = {value : response.data.pk};
        $http({method : 'POST' , url : '/api/ecommerce/sendStatus/' , data : toSend}).
        then(function(response) {
        })
      }
    })(idx, sts))
  }

});

app.controller('businessManagement.ecommerce.orders', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $sce) {

  $scope.data = {
    tableData: []
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.orders.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/order/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'info') {
          var title = 'Order Details : ';
          var appType = 'orderInfo';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            order: $scope.data.tableData[i]
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




});
