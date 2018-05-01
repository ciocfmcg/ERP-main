app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.tools', {
    url: "/tools",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.tools": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.tools": {
          templateUrl: '/static/ngTemplates/app.tools.default.html',
          controller : 'businessManagement.tools.default',
        }
    }
  })
  .state('businessManagement.tools.apiAccounts', {
    url: "/apiAccounts",
    templateUrl: '/static/ngTemplates/app.tools.apiAccounts.html',
    controller: 'businessManagement.tools.apiAccounts'
  })
  .state('businessManagement.tools.NLP', {
    url: "/NLP",
    templateUrl: '/static/ngTemplates/app.tools.NLP.html',
    controller: 'businessManagement.tools.NLP'
  })
  .state('businessManagement.tools.fileCache', {
    url: "/fileCache",
    templateUrl: '/static/ngTemplates/app.tools.fileCache.html',
    controller: 'businessManagement.tools.fileCache'
  })
  .state('businessManagement.tools.PDF', {
    url: "/PDF",
    templateUrl: '/static/ngTemplates/app.tools.PDF.html',
    controller: 'businessManagement.tools.PDF'
  })
  .state('businessManagement.tools.archive', {
    url: "/archive",
    templateUrl: '/static/ngTemplates/app.tools.archive.html',
    controller: 'businessManagement.tools.archive'
  })

});




app.controller("businessManagement.tools.default", function($scope , $state , $users ,  $stateParams , $http , Flash) {


})
