// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.marketing', {
      url: "/marketing",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.marketing": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.marketing": {
          templateUrl: '/static/ngTemplates/app.marketing.default.html',
          controller: 'businessManagement.marketing.default',
        }
      }
    })
    .state('businessManagement.marketing.contacts', {
      url: "/contacts",
      templateUrl: '/static/ngTemplates/app.marketing.contacts.html',
      controller: 'businessManagement.marketing.contacts'
    })
    .state('businessManagement.marketing.campaign', {
      url: "/campaign",
      templateUrl: '/static/ngTemplates/app.marketing.campaign.html',
      controller: 'businessManagement.marketing.campaign'
    })
    .state('businessManagement.marketing.leads', {
      url: "/leads",
      templateUrl: '/static/ngTemplates/app.marketing.leads.html',
      controller: 'businessManagement.marketing.leads'
    })
    .state('businessManagement.marketing.customers', {
      url: "/customers",
      templateUrl: '/static/ngTemplates/app.marketing.customers.html',
      controller: 'businessManagement.marketing.customers'
    })

});




app.controller("businessManagement.marketing.default", function($scope, $state, $users, $stateParams, $http, Flash) {



})
