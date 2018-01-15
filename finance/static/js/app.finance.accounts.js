app.controller('businessManagement.finance.accounts.form' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller
  $scope.mode = 'new';
  $scope.form = {number : undefined , ifsc : undefined, bankAddress: undefined, personal : false}

  if ($scope.form.personal== false) {
    $scope.form.users = [];
  }else {
    if ($scope.form.users.length > 1) {
      $scope.form.users = null;
    }else {
      $scope.form.users = $scope.form.users[0];

    }
  }

  if ($scope.mode == 'new') {

  }


});

app.controller('businessManagement.finance.accounts' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.finance.accounts.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/finance/account/',
    searchField: 'number',
    deletable : true,
    itemsNumPerView : [12,24,48],
    canCreate : true,
    editorTemplate :'/static/ngTemplates/app.finance.accounts.form.html',
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'accountBrowser') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Account details : ' + $scope.data.tableData[i].number , cancel : true , app : 'accountBrowser' , data : {pk : target, index : i} , active : true})
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

})

var bankIconMap = {
  hdfc : '/static/images/credit/hdfc.jpg',
  citi : '/static/images/credit/citi.png',
  sbi : '/static/images/credit/sbi.png'
}

app.controller('businessManagement.finance.accounts.item' , function($scope , $http ){

  $scope.getBankIcon = function(bankName) {
    return bankIconMap[bankName];
  }


});





app.controller('businessManagement.finance.accounts.explore' , function($scope , $http, $aside, $uibModal ){

  $scope.getBankIcon = function(bankName) {
    return bankIconMap[bankName];
  }
  $scope.account = $scope.data.tableData[$scope.tab.data.index]

  $scope.transactions = {tableData : []};

  var views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.finance.transaction.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-info', text: 'more'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/finance/transaction/' ,
    searchField: 'toAcc',
    fields : ['pk' ,'fromAcc', 'toAcc' , 'amount', 'balance'],
    options : options,
    // deletable : true,
    // itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    // console.log($scope.data.tableData);

    for (var i = 0; i < $scope.transactions.tableData.length; i++) {
      if ($scope.transactions.tableData[i].pk == parseInt(target)){
        var targetObj = $scope.transactions.tableData[i];
        if (action == 'more') {
          $uibModal.open({
            templateUrl: '/static/ngTemplates/app.finance.transactionDetails.html',
            size: 'lg',
            resolve : {
              transaction : function() {
                return targetObj;
              }
            },
            controller: function($scope , transaction){
              $scope.transaction = transaction;
            },
          });
        }
      }
    }
  }

})
