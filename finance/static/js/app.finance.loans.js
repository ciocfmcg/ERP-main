app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.finance.loans', {
    url: "/loans",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.finance.loans.html',
          controller : 'businessManagement.finance.loans'
       }
    }
  })

});


app.controller('businessManagement.finance.loans' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

})
