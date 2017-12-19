app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.finance.outflow', {
    url: "/outflow",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.finance.outflow.html',
          controller : 'businessManagement.finance.outflow'
       }
    }
  })

});


app.controller('businessManagement.finance.outflow' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

})
