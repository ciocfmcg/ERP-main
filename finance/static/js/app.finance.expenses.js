app.controller('businessManagement.finance.expenses' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller
  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.GIT.groups.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/finance/expenseSheet/',
    searchField: 'title',
    deletable : true,
    editorTemplate : '/static/ngTemplates/app.GIT.form.groups.html',
    canCreate : true,
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

  }


})
