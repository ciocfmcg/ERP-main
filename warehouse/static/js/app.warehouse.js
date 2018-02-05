app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.warehouse', {
    url: "/warehouse",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.warehouse": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.warehouse": {
          templateUrl: '/static/ngTemplates/app.warehouse.default.html',
          // controller : 'businessManagement.warehouse.default',
        }
    }
  })
  // .state('businessManagement.warehouse.expenses', {
  //   url: "/service",
  //   templateUrl: '/static/ngTemplates/app.warehouse.service.html',
  //   controller: 'businessManagement.warehouse.service'
  // })

});


// app.controller('businessManagement.warehouse.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
//   // settings main page controller
//
//
// })
// app.config(function($stateProvider){
//
//   $stateProvider
//   .state('businessManagement.warehouse', {
//     url: "/warehouse",
//     views: {
//        "": {
//           templateUrl: '/static/ngTemplates/genericAppBase.html',
//        },
//        "menu@businessManagement.warehouse": {
//           templateUrl: '/static/ngTemplates/genericMenu.html',
//           controller : 'controller.generic.menu',
//         },
//         "@businessManagement.warehouse": {
//           templateUrl: '/static/ngTemplates/app.warehouse.default.html',
//
//           controller : 'businessManagement.warehouse.default',
//         }
//     }
//   })
//
// });
// app.controller("businessManagement.warehouse.default", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {
//
// });
//
//           // controller : 'businessManagement.warehouse.default',
//         }
//     }
//   })
//   // .state('businessManagement.warehouse.expenses', {
//   //   url: "/service",
//   //   templateUrl: '/static/ngTemplates/app.warehouse.service.html',
//   //   controller: 'businessManagement.warehouse.service'
//   // })
//
// });


// app.controller('businessManagement.warehouse.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
//   // settings main page controller
//
//
// })
