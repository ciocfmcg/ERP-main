app.controller("controller.home.profile", function($scope , $state , $users ,  $stateParams , $http , Flash) {

  // $scope.data = $scope.tab.data;

  $scope.me = $users.get("mySelf");

  console.log('aaaaaaaaaaaaaaaaaaaaaa', $scope.pk);
  $http({
    method: 'GET',
    url: '/api/HR/payroll/?user=' + $scope.userPK
  }).
  then(function(response) {
    $scope.payroll = response.data;
    console.log($scope.payroll);
  })
  console.log('((((((((((((((()))))))))))))))', $scope.userPK);
  $http({
    method: 'GET',
    url: '/api/HR/designation/?user=' + $scope.userPK
  }).
  then(function(response) {
    console.log(response.data, '&&&&&&&&&&&&&&&&&&&&&&&7');
    $scope.designation = response.data[0];
    console.log($scope.designation);

    if (typeof $scope.designation.division == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/divisions/' + $scope.designation.division + '/'
      }).
      then(function(response) {
        $scope.designation.division = response.data;
      })
    }

    if (typeof $scope.designation.unit == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/unit/' + $scope.designation.unit + '/'
      }).
      then(function(response) {
        $scope.designation.unit = response.data;
      })

    }




  })

  $http({
    method: 'GET',
    url: '/api/HR/profileAdminMode/?user=' + $scope.userPK
  }).
  then(function(response) {
    console.log(response.data, '&&&&&&&&&&&&&&&&&&&&&&&7');
    $scope.data = response.data[0];
    console.log($scope.data);
  })


});
