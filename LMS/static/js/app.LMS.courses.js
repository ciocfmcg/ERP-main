app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.courses', {
    url: "/courses",
    templateUrl: '/static/ngTemplates/app.LMS.courses.html',
    controller: 'projectManagement.LMS.courses'
  });
});

app.controller("projectManagement.LMS.courses", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller("projectManagement.LMS.courses.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  


});
