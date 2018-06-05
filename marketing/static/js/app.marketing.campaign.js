app.controller("businessManagement.marketing.campaign", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  $scope.me = $users.get('mySelf');


  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.marketing.campaign.item.html',
  }, ];

  $scope.Config = {
    url: '/api/marketing/campaign/',
    views: views,
    itemsNumPerView: [12, 24, 48],
    filterSearch: true,
    searchField: 'Search..',
  };

  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'exploreSale') {
          $scope.addTab({
            title: 'Explore Sale : ' + $scope.data.tableData[i].pk,
            cancel: true,
            app: 'exploreSale',
            data: {
              pk: target,
              index: i
            },
            active: true
          })
        }

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



})
