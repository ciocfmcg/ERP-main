app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.contact', {
    url: "/contact",
    templateUrl: '/static/ngTemplates/app.warehouse.contact.html',
    controller: 'businessManagement.warehouse.contact'
  });
});

app.controller('businessManagement.warehouse.contact', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.name="sai"
  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.warehouse.Contact.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/warehouse/contact/',
    searchField: 'number',
    deletable : true,
    itemsNumPerView : [12,24,48],
    canCreate : true,
    editorTemplate :'/static/ngTemplates/app.warehouse.contact.form.html',
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


});
