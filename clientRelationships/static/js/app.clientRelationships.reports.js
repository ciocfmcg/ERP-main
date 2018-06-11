app.controller("businessManagement.clientRelationships.reports", function($scope, $state, $users, $stateParams, $http, Flash , $timeout ) {

  $scope.form = {from : undefined , end : new Date() , users : [] , reportType : '' , filter : false}

  $scope.page = 'quick';

  $scope.me = $users.get('mySelf');




});
