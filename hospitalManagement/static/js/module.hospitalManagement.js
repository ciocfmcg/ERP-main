app.config(function($stateProvider){

  $stateProvider
  .state('hospitalManagement', {
    url: "/hospitalManagement",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/hospitalManagement.html',
       },
       "menu@hospitalManagement": {
          templateUrl: '/static/ngTemplates/hospitalManagement.menu.html',
          controller : 'hospitalManagement.menu'
        },
        "@hospitalManagement": {
          templateUrl: '/static/ngTemplates/hospitalManagement.dash.html',
          controller : 'hospitalManagement'
        }
    }
  })

});
app.controller('hospitalManagement' , function($scope , $users , Flash){
  // main businessManagement tab default page controller
  $scope.name = 'vikas'
  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.labels2 = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data2 = [300, 500, 100];
});

app.controller('hospitalManagement.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'hospitalManagement')
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
