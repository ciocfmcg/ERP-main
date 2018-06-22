// app.config(function($stateProvider) {
//
//   $stateProvider
//     .state('hospitalManagement.configure', {
//       url: "/configure",
//       views: {
//         "": {
//           templateUrl: '/static/ngTemplates/app.configure.html',
//           controller: 'hospitalManagement.configure',
//         }
//       }
//     })
// });
//
// app.controller('hospitalManagement.configure', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout, $uibModal) {
// });
app.config(function($stateProvider){

  $stateProvider
  .state('hospitalManagement.configure', {
    url: "/configure",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@hospitalManagement.configure": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@hospitalManagement.configure": {
          templateUrl: '/static/ngTemplates/app.configure.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
 app.controller("workforceManagement.configure", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {
 });
