// app.config(function($stateProvider ){
//
//   $stateProvider
//   .state('home', {
//     url: "/home",
//     views: {
//       "": {
//         templateUrl: '/static/ngTemplates/home.html',
//         controller:'controller.home.main'
//       },
//       "@home": {
//         templateUrl: '/static/ngTemplates/app.home.dashboard.html',
//         controller : 'controller.home'
//       }
//     }
//   })
//   .state('home.mail', {
//     url: "/mail",
//     templateUrl: '/static/ngTemplates/app.mail.html',
//     controller: 'controller.mail'
//   })
//   .state('home.social', {
//     url: "/social/:id",
//     templateUrl: '/static/ngTemplates/app.social.html',
//     controller: 'controller.social'
//   })
//   .state('home.blog', {
//     url: "/blog/:id?action",
//     templateUrl: '/static/ngTemplates/app.home.blog.html',
//     controller: 'controller.home.blog'
//   })
//   .state('home.calendar', {
//     url: "/calendar",
//     templateUrl: '/static/ngTemplates/app.home.calendar.html',
//     controller: 'controller.home.calendar'
//   })
//   .state('home.notes', {
//     url: "/notes",
//     templateUrl: '/static/ngTemplates/app.home.notes.html',
//     controller: 'controller.home.notes'
//   })
//   .state('home.profile', {
//     url: "/profile",
//     templateUrl: '/static/ngTemplates/app.home.profile.html',
//     controller: 'controller.home.profile'
//   })
//   .state('home.myWork', {
//     url: "/myWork",
//     templateUrl: '/static/ngTemplates/app.home.myWork.html',
//     controller: 'controller.home.myWork'
//   })
//
//
// });



app.config(function($stateProvider ){

  $stateProvider
  .state('home', {
    url: "/home",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/home.html',
        controller:'controller.home.main'
      },
      "@home": {
        templateUrl: '/static/ngTemplates/app.home.dashboard.html',
        controller : 'controller.home'
      }
    }
  })
  // .state('home.mail', {
  //   url: "/mail",
  //   templateUrl: '/static/ngTemplates/app.mail.html',
  //   controller: 'controller.mail'
  // })
  // .state('home.social', {
  //   url: "/social/:id",
  //   templateUrl: '/static/ngTemplates/app.social.html',
  //   controller: 'controller.social'
  // })
  // .state('home.blog', {
  //   url: "/blog/:id?action",
  //   templateUrl: '/static/ngTemplates/app.home.blog.html',
  //   controller: 'controller.home.blog'
  // })
  // .state('home.calendar', {
  //   url: "/calendar",
  //   templateUrl: '/static/ngTemplates/app.home.calendar.html',
  //   controller: 'controller.home.calendar'
  // })
  // .state('home.notes', {
  //   url: "/notes",
  //   templateUrl: '/static/ngTemplates/app.home.notes.html',
  //   controller: 'controller.home.notes'
  // })
  // .state('home.profile', {
  //   url: "/profile",
  //   templateUrl: '/static/ngTemplates/app.home.profile.html',
  //   controller: 'controller.home.profile'
  // })
  // .state('home.myWork', {
  //   url: "/myWork",
  //   templateUrl: '/static/ngTemplates/app.home.myWork.html',
  //   controller: 'controller.home.myWork'
  // })

  .state('home.manageUsers', {
    url: "/manageUsers",
    templateUrl: '/static/ngTemplates/app.HR.manage.users.html',
    controller: 'admin.manageUsers'
  })
  .state('home.settings', {
    url: "/settings",
    templateUrl: '/static/ngTemplates/app.home.settings.html',
    // controller: 'module.home.settings'
  })

  // .state('home.settings', {
  //   url: "/settings",
  //   views: {
  //      "": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.html',
  //      },
  //      "menu@home.settings": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.menu.html',
  //         controller : 'admin.settings.menu'
  //       },
  //       "@home.settings": {
  //         templateUrl: '/static/ngTemplates/app.ERP.settings.default.html',
  //       }
  //   }
  // })
  // .state('home.settings.modulesAndApplications', {
  //   url: "/modulesAndApplications",
  //   templateUrl: '/static/ngTemplates/app.ERP.settings.modulesAndApps.html',
  //   controller: 'admin.settings.modulesAndApps'
  // })
  // .state('home.settings.configure', {
  //   url: "/configure?app&canConfigure",
  //   templateUrl: '/static/ngTemplates/app.ERP.settings.configure.html',
  //   controller: 'admin.settings.configure'
  // })

  .state('home.support', {
    url: "/support",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.support.html',
        controller: 'businessManagement.support',
      }
    }
  })
  .state('home.customers', {
    url: "/customers",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.customers.html',
        controller: 'businessManagement.customers',
      }
    }
  })


  .state('home.employees', {
    url: "/employees",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@home.employees": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@home.employees": {
          templateUrl: '/static/ngTemplates/app.employees.dash.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
  .state('home.employees.orgChart', {
    url: "/orgChart",
    templateUrl: '/static/ngTemplates/app.employees.orgChart.html',
    controller: 'businessManagement.employees.orgChart'
  })
  .state('home.employees.list', {
    url: "/list",
    templateUrl: '/static/ngTemplates/app.employees.list.html',
    controller: 'businessManagement.employees.list'
  })
  .state('home.employees.myCircle', {
    url: "/myCircle",
    templateUrl: '/static/ngTemplates/app.employees.myCircle.html',
    controller: 'businessManagement.employees.myCircle'
  })
  .state('home.employees.exitManagement', {
    url: "/exitManagement",
    views: {
      "": {
        templateUrl: '/static/ngTemplates/app.employees.exitManagement.html',
        controller: 'businessManagement.exitManagement',
      }
    }
  })
  .state('home.employees.approvals', {
    url: "/approvals",
    templateUrl: '/static/ngTemplates/app.employees.approvals.html',
    controller: 'businessManagement.employees.approvals'
  })






});

app.controller("controller.home.main", function($scope , $state) {
  $scope.modules = $scope.$parent.$parent.modules;
  $scope.dashboardAccess = false;
  $scope.homeMenuAccess = false;
  for (var i = 0; i < $scope.modules.length; i++) {
    if ($scope.modules[i].name == 'home'){
      $scope.dashboardAccess = true;
    }
    if ($scope.modules[i].name.indexOf('home') != -1) {
      $scope.homeMenuAccess = true;
    }
  }
})


app.controller('controller.home.menu' , function($scope ,$state, $http, $permissions){
  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      if (a.module != 1) {
        continue;
      }

      parts = a.name.split('.');
      a.dispName = parts[parts.length-1];

      if (a.name == 'app.dashboard') {
        a.state = 'home';
      }else {
        a.state = a.name.replace('app' , 'home');
      }
      $scope.apps.push(a);
    }
  }



  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };




})
