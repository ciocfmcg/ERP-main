app.controller("businessManagement.clientRelationships.reports", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {
  var date = new Date();

  $scope.form = {
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: date,
    users: [],
    reportType: '',
    filter: false
  }

  $scope.page = 'quick';

  $scope.me = $users.get('mySelf');

  $scope.callData = []
  $scope.fd = new Date(date.getFullYear(), date.getMonth(), 1)
  $scope.td = date
  $scope.usr = []

  $scope.fetchdata = function(){
    $http({
      method: 'GET',
      url: '/api/clientRelationships/reportHomeCal/?fdate='+$scope.fd+'&tdate='+$scope.td+'&usr='+$scope.usr+'&typ='+$scope.form.reportType
    }).
    then(function(response) {
      console.log(response.data);
      $scope.callData = response.data
    })
  }

  $scope.$watch('form.from' , function(newValue , oldValue) {
    $scope.fd = new Date($scope.form.from.getFullYear(),$scope.form.from.getMonth(),$scope.form.from.getDate()+1).toJSON().split('T')[0]
    console.log($scope.fd);
    $scope.fetchdata()
  })
  $scope.$watch('form.to' , function(newValue , oldValue) {
    $scope.td = newValue.toJSON().split('T')[0]
    console.log($scope.td);
    $scope.fetchdata()
  })
  $scope.$watch('form.users' , function(newValue , oldValue) {
    $scope.usr = newValue
    console.log(newValue);
    $scope.fetchdata()
  },true)


});
