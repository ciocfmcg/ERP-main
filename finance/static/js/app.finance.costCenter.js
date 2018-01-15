app.controller('businessManagement.finance.costCenter' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.finance.costCenter.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/finance/costCenter/',
    searchField: 'name',
    deletable : true,
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'costCenterBrowser') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Browse Cost Center : ' + $scope.data.tableData[i].pk , cancel : true , app : 'costCenterBrowser' , data : {pk : target, index : i} , active : true})
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

app.controller('businessManagement.finance.costCenter.item' , function($scope , $http ){




});

app.controller('businessManagement.finance.costCenter.explore' , function($scope , $http ){

  console.log('loaded');
  console.log($scope.tab);

  $http({method : 'GET' , url : '/api/finance/costCenter/' + $scope.tab.data.pk + '/'}).
  then(function(res) {
      $scope.costCenter = res.data;
      console.log(res.data);
      $http({method : 'GET' , url : '/api/finance/account/' + res.data.account + '/' }).
      then(function(res) {
        $scope.costCenter.accountData = res.data;
      });
  });

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.finance.costCenter.project.html',
    },
  ];

  $scope.config = {
    views : views,
    url : '/api/projects/project/',
    searchField: 'name',
    deletable : false,
    itemsNumPerView : [12,24,48],
  }

  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'more') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Account details : ' + $scope.data.tableData[i].number , cancel : true , app : 'accountBrowser' , data : {pk : target, index : i} , active : true})
        }
      }
    }

  }


});
