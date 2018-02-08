// you need to first configure the states for this app

app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.LMS', {
    url: "/LMS",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@projectManagement.LMS": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@projectManagement.LMS": {
          templateUrl: '/static/ngTemplates/app.LMS.default.html',
          // controller : 'projectManagement.LMS.default',
        }
    }
  })
});
