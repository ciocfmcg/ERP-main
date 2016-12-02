app.controller('businessManagement.finance.expenses' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller
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

  }


})
