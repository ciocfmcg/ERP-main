app.config(function($stateProvider){

  $stateProvider
  .state('workforceManagement', {
    url: "/workforceManagement",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/workforceManagement.html',
       },
       "menu@workforceManagement": {
          templateUrl: '/static/ngTemplates/workforceManagement.menu.html',
          controller : 'workforceManagement.menu'
        },
        "@workforceManagement": {
          templateUrl: '/static/ngTemplates/workforceManagement.dash.html',
          controller : 'workforceManagement'
        }
    }
  })

});
app.controller('workforceManagement' , function($scope , $users , Flash){
  // main businessManagement tab default page controller
});

app.controller('workforceManagement.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'workforceManagement')
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };
});
