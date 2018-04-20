app.controller("controller.home.myWork", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  // $scope.mode = 'home';

  // $scope.showProfile = function() {
  //   $scope.mode = 'profile';
  // }
  // $scope.showHome = function() {
  //   $scope.mode = 'home';
  // }
  // $scope.page = 1;
  $scope.next = function() {
    console.log("came to next");
    if ($scope.page < $scope.maxPage) {
      $scope.page += 1;
    }
  }

  $scope.prev = function() {
    if ($scope.page > 1) {
      $scope.page -= 1;
    }
  }

  $scope.projects = [];

  $scope.addTableRow = function() {
    $scope.projects.push({
      project: "",
      details: ""
    });
    console.log($scope.projects);
  }
  $scope.deleteTable = function(index) {
    $scope.projects.splice(index, 1);
  };

  $scope.projectSearch = function(query) {
    console.log("called");
    return $http.get('/api/POS/product/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

});
