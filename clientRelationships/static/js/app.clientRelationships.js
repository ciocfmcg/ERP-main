// you need to first configure the states for this app

app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.clientRelationships', {
    url: "/clientRelationships",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.clientRelationships": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.clientRelationships": {
          templateUrl: '/static/ngTemplates/app.clientRelationships.default.html',
          controller : 'businessManagement.clientRelationships.default',
        }
    }
  })
  .state('businessManagement.clientRelationships.contacts', {
    url: "/contacts",
    templateUrl: '/static/ngTemplates/app.clientRelationships.contacts.html',
    controller: 'businessManagement.clientRelationships.contacts'
  })

});




app.controller("businessManagement.clientRelationships.default", function($scope , $state , $users ,  $stateParams , $http , Flash) {


})
