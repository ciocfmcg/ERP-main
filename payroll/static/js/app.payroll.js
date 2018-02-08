
app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement.payroll', {
    url: "/payroll",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@workforceManagement.payroll": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@workforceManagement.payroll": {
          templateUrl: '/static/ngTemplates/app.payroll.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
app.controller("workforceManagement.payroll", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
});
