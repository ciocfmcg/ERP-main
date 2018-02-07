
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
});
