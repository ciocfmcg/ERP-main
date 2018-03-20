app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.warehouse.checkin', {
      url: "/checkin",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.warehouse.checkin.html',
          controller: 'businessManagement.warehouse.checkin',
        }
      }
    })
});

app.controller("controller.warehouse.checkin.info", function($scope, $state, $users, $stateParams, $http, Flash,checkin) {



});
app.controller("businessManagement.warehouse.checkin.explore", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModal) {

  $scope.contract = $scope.tab.data;

  $scope.data = {checkinTableData : []}

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkin.explore.item.html',
  }, ];

  $scope.configCheckin = {
    views: views,
    url: '/api/warehouse/checkin/',
    searchField: 'description',
    itemsNumPerView: [6, 12, 24],
    getParams : [{key : 'contract' , value : $scope.contract.pk}],
    editorTemplate : '/static/ngTemplates/app.warehouse.checkin.form.html',
    canCreate : true
  }

  $scope.tableActionCheckin = function(target, action, mode) {

  }

});

app.controller("businessManagement.warehouse.checkin.item", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.open = false;

  $scope.form = {value : '' ,typ : true}

  $http({method: 'GET' , url : '/api/warehouse/checkout/?parent=' + $scope.data.pk}).
  then(function(response) {
    $scope.data.checkouts = response.data;
  })

  $scope.checkout = function() {
    if ($scope.form.typ) {
      var typ = 'qty';
      var qty = $scope.data.qty - parseFloat($scope.form.value);
    }else {
      var typ = 'percent';
      var qty = ($scope.data.qty)*( 1- parseFloat($scope.form.value)/100 )
    }

    var toSend = {
      parent : $scope.data.pk,
      initial : $scope.data.qty,
      final : qty,
      value : $scope.form.value,
      typ : typ
    }
    $http({method : 'POST' , url : '/api/warehouse/checkout/' , data : toSend}).
    then(function(response) {
      Flash.create('success' , 'Adjusted');
      $scope.form.value = '';
      $scope.data.qty = response.data.final;

      if ($scope.data.checkouts == undefined) {
        $scope.data.checkouts = [];
      }

      $scope.data.checkouts.push(response.data);
    })

  }

});

app.controller("businessManagement.warehouse.checkin", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkin.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/warehouse/contract/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'openCheckin') {
          var title = 'Open Project :';
          var appType = 'checkinExplorer';
        }

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

 var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkout.item.html',
  }, ];


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

app.controller("businessManagement.warehouse.checkin.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.contract = $scope.$parent.$parent.$parent.contract;

  $scope.resetForm = function() {
    $scope.checkin = {
      'contract': '',
      'description': '',
      'height': 0,
      'width': 0,
      'length': 0,
      'weight': 0,
      'qty':0
    }

  }

  $scope.resetForm();

  $scope.save = function() {
    var f = $scope.checkin;

    var toSend = {
      contract:   $scope.contract.pk,
      description: f.description,
      height: f.height,
      width: f.width,
      length: f.length,
      weight: f.weight,
      qty:f.qty

    }

    var url = '/api/warehouse/checkin/';
    var method = 'POST';

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.resetForm();
      Flash.create('success', 'Saved');
    })
  }


});
