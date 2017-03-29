app.config(function($stateProvider){

  $stateProvider
  .state('tools', {
    url: "/tools",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/tools.html',
       },
       "menu@tools": {
          templateUrl: '/static/ngTemplates/tools.menu.html',
          controller : 'tools.menu'
        },
        "@tools": {
          templateUrl: '/static/ngTemplates/tools.dash.html',
          controller : 'tools'
        }
    }
  })

});

app.controller('tools' , function($scope , $users , Flash){
  // main businessManagement tab default page controller
});

app.controller('tools.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 11 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'tools')
      a.dispName = parts[parts.length -1];
      console.log(a);
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
