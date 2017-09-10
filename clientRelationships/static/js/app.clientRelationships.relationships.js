app.controller("businessManagement.clientRelationships.relationships.manage", function($scope, $state, $users, $stateParams, $http, Flash, $sce) {


  $scope.fetchDeal = function() {
    $http({method : 'GET' , url : '/api/clientRelationships/deal/' + $scope.tab.data.pk + '/'}).
    then(function(response) {
      $scope.deal = response.data;
      $scope.deal.requirements = $sce.trustAsHtml(response.data.requirements);
      console.log($scope.deal);
      $http({method : 'GET' , url : '/api/ERP/service/' + response.data.company.pk +'/'}).
      then(function(response) {
        $scope.deal.company = response.data;
      });

    });
  }
  $scope.minInfo = false;
  $scope.fetchDeal();

});

app.controller("businessManagement.clientRelationships.relationships.item", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.expanded = false;

  $scope.toggleExpand = function() {
    $scope.expanded = !$scope.expanded;
  }
  ///api/clientRelationships/deal/?&name__contains=&limit=16&offset=0&created=0&lost=0&won=1
  $scope.fetchDeals = function() {
    $http({method : 'GET' , url : '/api/clientRelationships/dealLite/?result=won&company='+ $scope.data.pk}).
    then(function(response) {
      $scope.data.deals = response.data;
    })
  }

  $scope.$watch('data.deals' , function(newValue , oldValue) {
    if (newValue == undefined) {
      $scope.fetchDeals();
    }
  });

});

app.controller("businessManagement.clientRelationships.relationships", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.clientRelationships.relationships.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/clientRelationships/relationships/',
    searchField: 'name',
    itemsNumPerView: [5, 10, 20],
    // getParams : [{key : 'result' , value : 'won'}]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Contact :';
          var appType = 'contactEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'contactExplorer';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
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

  $scope.$on('exploreRelation' , function(evt, input) {
    $scope.addTab({
      "title": "Manage : " + input.name,
      "cancel": true,
      "app": "manageRelation",
      "data": {
        "pk": input.pk,
      },
      "active": true
    })
  })

  $scope.addTab({"title":"Manage : Win in HCL","cancel":true,"app":"manageRelation","data":{"pk":10},"active":true});


});
