app.controller('businessManagement.tools.apiAccounts' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.tools.apiAccounts.item.html',
  },];

  $scope.config = {
    views : views,
    url : '/api/tools/apiAccount/',
    searchField: 'email',
    itemsNumPerView : [12,24,48],
    canCreate : true,
    editorTemplate : '/static/ngTemplates/app.tools.form.apiAccounts.html',
  }

  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'info') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Account summary : ' + $scope.data.tableData[i].email , cancel : true , app : 'apiAccountBrowser' , data : {pk : target, index : i} , active : true})
        }
      }
    }
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
      console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  // $scope.addTab({"title":"Browse Cost Center : 1","cancel":true,"app":"costCenterBrowser","data":{"pk":1,"index":0},"active":true});

})

app.controller('businessManagement.tools.apiAccounts.create' , function($scope , $http, $aside, $uibModal , Flash){

  $scope.form = {email : '' , accountType: 'trial', remaining : 0, active : true};

  $scope.save = function() {

    var dataToSend = {
      email : $scope.form.email,
      accountType : $scope.form.accountType,
      remaining : $scope.form.remaining,
      active : $scope.form.active
    }

    $http({method : 'POST' , url : '/api/tools/apiAccount/' , data : dataToSend}).
    then(function(response) {
      $scope.form = {email : '' , accountType: 'trial', remaining : 0, active : true};
      Flash.create('success' , 'New account created')
    }, function(response) {
      Flash.create('danger' , 'Failed')
    })
  }



});


app.controller('businessManagement.tools.apiAccounts.explore' , function($scope , $http, $aside, $uibModal , Flash){

  $scope.account = $scope.data.tableData[$scope.tab.data.index];
  $scope.data = {tableData : []};

  views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
  ];

  getParams = [{key : 'account' , value :$scope.account.pk}];

  $scope.config = {
    views : views,
    url : '/api/tools/apiAccountLog/',
    itemsNumPerView : [12,24,48],
    searchField: 'refID',
    getParams : getParams,
  }





  $scope.loading = true;
  $scope.$watch('account.active', function(newValue, oldValue) {

    if ($scope.loading) {
      $scope.loading = false;
    }else {
      $http({method : 'PATCH' , url :'/api/tools/apiAccount/' +$scope.account.pk + '/', data: {active: newValue} }).
      then(function(response) {
        if (response.data.active) {
          Flash.create('success' , 'Account activated');
        }else {
          Flash.create('success' , 'Account deactivated');
        }
      }, function(response) {
        Flash.create('danger' , 'Error occured');
      })
    }

  });


  $scope.addUsage = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tools.form.usage.html',
      size: 'sm',
      resolve : {
        account : function() {
          return $scope.account;
        }
      },
      controller: function($scope , account, $http, Flash){

        $scope.form = {usageToAdd : 0 , referenceID : ''};

        $scope.account = account;

        $scope.update = function() {
          var dataToSend = {addUsage:$scope.form.usageToAdd, refID : $scope.form.referenceID};
          console.log(dataToSend);
          $http({method:'PATCH', url : '/api/tools/apiAccount/' +$scope.account.pk + '/', data : dataToSend}).
          then(function(response) {
            $scope.form = {usageToAdd : 0 , referenceID : ''};
            $scope.account.remaining = response.data.remaining;
            Flash.create('success' , 'Usage added');
          }, function(response){
            Flash.create('danger' , 'Error occured');
          });
        }
      },
    });
  }



});
