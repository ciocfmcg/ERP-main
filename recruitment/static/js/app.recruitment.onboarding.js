app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.recruitment.onboarding', {
      url: "/onboarding",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.recruitment.onboarding.html',
          controller: 'workforceManagement.recruitment.onboarding',
        }
      }
    })
});
app.controller("workforceManagement.recruitment.onboarding", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.recruitment.onboarding.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/recruitment/applyJob/',
    searchField: 'firstname',
    getParams : [{key : 'status' , value : 'Onboarding'},],
    itemsNumPerView: [16, 32, 48],
  }

  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'candidateBrowse') {
          var title = 'Browse Candidate : ';
          var myapp = 'candidateBrowse';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].firstname,
          cancel: true,
          app: myapp,
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

app.controller("workforceManagement.recruitment.onboarding.explore", function($scope, Flash, $state, $users, $stateParams, $http, Flash, $uibModal, $aside) {

  $scope.candidate = $scope.data.tableData[$scope.tab.data.index]
  });
