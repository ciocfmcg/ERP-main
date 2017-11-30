app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.evaluation', {
    url: "/evaluation",
    templateUrl: '/static/ngTemplates/app.LMS.evaluation.html',
    controller: 'projectManagement.LMS.evaluation'
  });
});

app.controller("projectManagement.LMS.evaluation", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller("projectManagement.LMS.evaluation.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  


});
