app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.virtualWorkforce', {
    url: "/virtualWorkforce",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.virtualWorkforce": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.virtualWorkforce": {
          templateUrl: '/static/ngTemplates/app.virtualWorkforce.default.html',
        }
    }
  })
  .state('businessManagement.virtualWorkforce.controlRoom', {
    url: "/controlRoom",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.controlRoom.html',
    controller: 'businessManagement.virtualWorkforce.controlRoom'
  })
  .state('businessManagement.virtualWorkforce.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.configure.html',
    controller: 'businessManagement.virtualWorkforce.configure'
  })
  .state('businessManagement.virtualWorkforce.environments', {
    url: "/environments",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.environments.html',
    controller: 'businessManagement.virtualWorkforce.environments'
  })
  .state('businessManagement.virtualWorkforce.processes', {
    url: "/processes",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.processes.html',
    controller: 'businessManagement.virtualWorkforce.processes'
  })
  .state('businessManagement.virtualWorkforce.queues', {
    url: "/queues",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.queues.html',
    controller: 'businessManagement.virtualWorkforce.queues'
  })
  .state('businessManagement.virtualWorkforce.releases', {
    url: "/releases",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.releases.html',
    controller: 'businessManagement.virtualWorkforce.releases'
  })
  .state('businessManagement.virtualWorkforce.reports', {
    url: "/reports",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.reports.html',
    controller: 'businessManagement.virtualWorkforce.reports'
  })
  .state('businessManagement.virtualWorkforce.schedules', {
    url: "/schedules",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.schedules.html',
    controller: 'businessManagement.virtualWorkforce.schedules'
  })
  .state('businessManagement.virtualWorkforce.robots', {
    url: "/robots",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.robots.html',
    controller: 'businessManagement.virtualWorkforce.robots'
  })


});
