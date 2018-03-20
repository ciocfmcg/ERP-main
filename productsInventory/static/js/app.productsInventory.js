// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.productsInventory', {
      url: "/productsInventory",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.productsInventory.default.html',
          controller: 'businessManagement.productsInventory.default',
        }
      }
    })
});


app.controller("businessManagement.productsInventory.edit", function($scope, $http, Flash , $rootScope) {


  $scope.save = function(increase) {

    if (increase) {
      var final = $scope.data.qty + $scope.data.inStock;
    }else{
      var final =  $scope.data.inStock - $scope.data.qty;
    }


    $http({method : 'PATCH' , url : '/api/POS/product/' + $scope.data.pk + '/' , data : { inStock : final }}).then(function(response) {
      $scope.data.inStock = response.data.inStock;
      $scope.data.qty = 0;
      Flash.create('success' , 'Saved');
      $rootScope.$broadcast('closeEditModalWindow' , {})
      console.log("broadcast : closeEditModalWindow");
      // console.log($scope.$parent);
      // $scope.$parent.$uibModalInstance.dismiss();
    })
  }


});

app.controller("businessManagement.productsInventory.default", function($scope, $http, Flash , $uibModal , $rootScope) {

  // $http({method : 'GET' , url : '/api/POS/product/'})

  $scope.refreshDashboard = function(input) {
    console.log(input);
    if (input.action == 'updated' && input.type == 'productsInventory') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == input.pk) {
          $scope.data.tableData[i].inStock = input.inStock;
        }
      }
    }

  }

  console.log();


  $scope.data = {
    tableData: [],
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
    // itemTemplate: '/static/ngTemplates/app.POS.product.item.html',
  }, ];

  var options = {main : {icon : 'fa-info', text: 'Info'} ,
    others : [{icon : '' , text : 'editMaster' },
      ]
    };

  $scope.config = {
    views: views,
    url: '/api/POS/product/',
    searchField : 'Name or SKU or Description',
    itemsNumPerView: [20, 40, 80],
    fields : ['name' , 'price' , 'serialNo' , 'inStock'],
    options : options,
    filterSearch : true,
    // editable : true,
    editorTemplate :  '/static/ngTemplates/app.productsInventory.product.modal.html',
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);

    if (action == 'new') {
      $scope.openProductForm();
    } else if (action == 'Bulk') {
      $scope.openProductBulkForm();
    } else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'editMaster') {
            $scope.openProductForm(i);
            console.log('editing');
          } else {
            $scope.openProductInfo(i);
          }
        }
      }
    }



  }


  $scope.openProductInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.productinfo.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        product: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.tableData[idx];
          }
        }
      },
      controller: "controller.POS.productinfo.form",
    }).result.then(function() {

    }, function() {
      $rootScope.$broadcast('forceRefetch', {});
    });



  }

  $scope.openProductForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        product: function() {

          console.log($scope.data.tableData[idx]);
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.data.tableData[idx];
          }
        }
      },
      controller: 'controller.POS.productForm.modal',
    }).result.then(function() {

    }, function() {

    });


  }

});
