app.config(function($stateProvider){

  $stateProvider
  .state('tools.APIAccounts', {
    url: "/APIAccounts",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.APIAccounts.html',
       }
    }
  })
  
});
