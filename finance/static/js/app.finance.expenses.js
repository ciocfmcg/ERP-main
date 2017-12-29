app.controller('businessManagement.finance.expenses' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  $scope.loadTags = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };

  $scope.createExpense = function() {

    var dataToSend = {
      title : 'a sample title',
      title : 'a sample title',
    }

    $http({method : 'post' , url : '/api/finance/expenseSheet/' , data : dataToSend}).
    then(function(response) {
      var pk = response.data.pk;
      $scope.users = []
    }, function(error) {

    })

  }


  $scope.users = [];

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.finance.expenseSheet.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/finance/expenseSheet/',
    searchField: 'notes',
    deletable : true,
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'expenseSheetBrowser') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Browse expense sheet : ' + $scope.data.tableData[i].pk , cancel : true , app : 'expenseSheetBrowser' , data : {pk : target, index : i} , active : true})
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

app.controller('businessManagement.finance.expenses.item' , function($scope , $http ){




});




app.controller('businessManagement.finance.expenseSheet.invoiceView' , function($scope , $http, input ){
  console.log(input);

  $scope.invoice = input;


});


app.controller('businessManagement.finance.expenses.explore' , function($scope , $http, $aside ){

  $scope.expense = $scope.data.tableData[$scope.tab.data.index]

  $scope.viewInvoice = function(ind) {
    $aside.open({
      templateUrl : '/static/ngTemplates/app.finance.aside.invoiceView.html',
      position:'right',
      size : 'xl',
      backdrop : true,
      resolve : {
        input : function() {
          return $scope.expense.invoices[ind];
        }
      },
      controller : 'businessManagement.finance.expenseSheet.invoiceView',
    })
  }


})
