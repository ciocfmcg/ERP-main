app.config(function($stateProvider){
  $stateProvider.state('businessManagement.employees.myCircle', {
    url: "/myCircle",
    templateUrl: '/static/ngTemplates/app.employees.myCircle.html',
    controller: 'businessManagement.employees.myCircle'
  });
});
app.controller("businessManagement.employees.myCircle", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
});
