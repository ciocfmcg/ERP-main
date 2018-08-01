app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement', {
    url: "/businessManagement",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/businessManagement.html',
       },
       "menu@businessManagement": {
          templateUrl: '/static/ngTemplates/businessManagement.menu.html',
          controller : 'businessManagement.menu'
        },
        "@businessManagement": {
          templateUrl: '/static/ngTemplates/businessManagement.dash.html',
          controller : 'businessManagement'
        }
    }
  })

});

app.controller('businessManagement' , function($scope , $users , Flash , $http){
  // main businessManagement tab default page controller

  function getMonday( date ) {
      var day = date.getDay() || 7;
      if( day !== 1 )
          date.setHours(-24 * (day - 1));
      return date;
  }

  $scope.today = new Date();
  $scope.firstDay = new Date($scope.today.getFullYear(), $scope.today.getMonth(), 2);
  $scope.monday = getMonday(new Date());

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40, 50, 30, 44, 55, 66]

  ];

  $scope.graphForm = {graphType : 'week'}

  $scope.$watch('graphForm.graphType' , function(newValue , oldValue) {

    if (newValue == 'day') {
      var toSend = {date : $scope.today};
    }else if (newValue == 'week') {
      var toSend = {from : $scope.monday , to : $scope.today};
    }else {
      var toSend = {from : $scope.firstDay , to : $scope.today};
    }
    $scope.trendData = [[],[]];
  //   $scope.trendData = [
  //   [65, 59, 80, 81, 56, 55, 40],
  //   [28, 48, 40, 19, 86, 27, 90]
  // ];

    $http({method : 'POST' , url : '/api/ecommerce/onlineSalesGraphAPI/' , data : toSend}).
    then(function(response) {
      $scope.stats = response.data;
      console.log($scope.stats,'aaaaaaaaaaa');

      $scope.data2 = [$scope.stats.totalCollections, $scope.stats.totalSales.totalAmount__sum];
      $scope.labels2 = ["Sales", "Collections"];

      console.log($scope.data2,'kkkkkkkkkkkkkkkkkkk')

      $scope.labels = [];
      // $scope.series = ['Series A'];


      for (var i = 0; i < $scope.stats.trend.length; i++) {
        $scope.trendData[0].push($scope.stats.trend[i].sum)
        $scope.labels.push($scope.stats.trend[i].created)
      }


    })

    $http({method : 'POST' , url : '/api/POS/salesGraphAPI/' , data : toSend}).
    then(function(response) {
      $scope.offlinestats = response.data;

      $scope.offlinedata2 = [$scope.offlinestats.totalCollections.amountRecieved__sum, $scope.offlinestats.totalSales.grandTotal__sum];
      $scope.offlinelabels2 = ["Sales", "Collections"];


      for (var i = 0; i < $scope.offlinestats.trend.length; i++) {
        $scope.trendData[1].push($scope.offlinestats.trend[i].sum)
      }


    })

    // $http({method : 'POST' , url : '/api/POS/externalSalesGraphAPI/' , data : toSend}).
    // then(function(response) {
    //
    //   $scope.uniqueDates = [];
    //   $scope.trend = [];
    //   for (var i = 0; i < response.data.trend.length; i++) {
    //     var d = response.data.trend[i];
    //
    //     if ($scope.uniqueDates.indexOf(d.created)  == -1 ) {
    //       $scope.uniqueDates.push(d.created);
    //     }
    //
    //   }
    //
    //   for (var i = 0; i < $scope.uniqueDates.length; i++) {
    //     $scope.trend.push({date : $scope.uniqueDates[i] , amazon : 0 , flipkart : 0 , skinstore : 0})
    //   }
    //
    //   for (var i = 0; i < response.data.trend.length; i++) {
    //     d = response.data.trend[i];
    //
    //     for (var j = 0; j < $scope.trend.length; j++) {
    //       if ($scope.trend[j].date == d.created) {
    //         $scope.trend[j][d.marketPlace] += 1;
    //       }
    //     }
    //   }
    //
    //   $scope.labels = [];
    //   var s1 = [];
    //   var s2 = [];
    //   var s3 = [];
    //   for (var i = 0; i < $scope.trend.length; i++) {
    //     $scope.labels.push($scope.trend[i].date);
    //     s1.push($scope.trend[i].flipkart);
    //     s2.push($scope.trend[i].amazon);
    //     s3.push($scope.trend[i].skinstore);
    //   }
    //   $scope.trendData = [s1, s2, s3];
    //
    //   $scope.stats = {flipkart : 0 , amazon : 0 , skinstore : 0};
    //
    //   for (var i = 0; i < s1.length; i++) {
    //     $scope.stats.flipkart += s1[i];
    //     $scope.stats.amazon += s2[i];
    //     $scope.stats.skinstore += s3[i];
    //   }
    //
    //   $scope.series = ["Flipkart" , "Amazon" , "Skinstore"];
    //
    //
    //
    // })



  })



});

app.controller('businessManagement.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 3 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'businessManagement')
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };
});
