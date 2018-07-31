// app.config(function($stateProvider) {
//
//   $stateProvider
//     .state('businessManagement.employees', {
//       url: "/employees",
//       views: {
//         "": {
//           templateUrl: '/static/ngTemplates/app.employees.dash.html',
//           controller: 'businessManagement.employees',
//         }
//       }
//     })
// });
// app.controller("businessManagement.employees", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
// });
app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.employees', {
    url: "/employees",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.employees": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.employees": {
          templateUrl: '/static/ngTemplates/app.employees.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
 app.controller("businessManagement.employees", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
 });
