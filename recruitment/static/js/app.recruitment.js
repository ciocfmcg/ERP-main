
app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.recruitment', {
    url: "/recruitment",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.recruitment": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.recruitment": {
          templateUrl: '/static/ngTemplates/app.recruitment.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
app.controller("workforceManagement.recruitment", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
  // $scope.catgory = [{'name':'prabhakar','location':'bangalore','mob':87654321},{'name':'sankaet','location':'bangalore','mob':87654321},{'name':'sai','location':'bangalore','mob':87654321}];

});
