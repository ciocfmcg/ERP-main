app.config(function($stateProvider){

  $stateProvider
  .state('previousSessions', {
    url: "/previousSessions",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.previousSession.html',
          controller : 'home.tutor.previousSession',
       }
    }
  })


  console.log("Configured");
});

app.controller("home.tutor.previousSession.details", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside, $timeout, $uibModal) {
  console.log('$$$$$$$$$$$$$$$$$$$$$$4',$scope.data);
  $scope.getTimeDiff = function(a,b){
    var milisecondsDiff = new Date(b) - new Date(a)
    return Math.floor(milisecondsDiff/(1000*60*60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff/(1000*60))%60).toLocaleString(undefined, {minimumIntegerDigits: 2})  + ":" + (Math.floor(milisecondsDiff/1000)%60).toLocaleString(undefined, {minimumIntegerDigits: 2}) ;
  }
});

app.controller("home.tutor.exploreSession", function($scope , $state , $users ,  $stateParams , $http , Flash) {

  $scope.sessionDetails = $scope.tab.data;
console.log($scope.sessionDetails);
  $http.get('/api/tutors/tutors24Message/?session='+$scope.sessionDetails.pk).
  then(function(response) {
    console.log('*******************************', response.data);
    $scope.sessionDetails.message = response.data
  })


});

app.controller("home.tutor.previousSession", function($scope , $state , $users ,  $stateParams , $http , Flash) {

  $scope.me = $users.get('mySelf');

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.tutor.previousSession.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/tutors/tutors24Session/',
    searchField: 'initialQuestion',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    getParams : [{key : 'mode' , value : 'onlyComplete'}, {key : 'student' , value : $scope.me.pk}]
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        var title = 'Session Details : ';
        var appType = 'sessiontExplorer';
        console.log("sampleee");
        console.log($scope.data.tableData[i]);
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          // data: {
          //   pk: target,
          //   index: i,
          //   contract : $scope.data.tableData[i]
          // },
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        console.log('yesssssssssssssssssssssssssssssssssssssssssssssssssssssssssss');
        $scope.tabs[i].active = true;
        alreadyOpen = true;
        $scope.sessionDetails = input.data
      } else {
        console.log('noooooooooooooooooooooooooooooooooooooooo');
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }


});
