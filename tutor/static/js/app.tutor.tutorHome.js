app.config(function($stateProvider){

  $stateProvider
  .state('tutorHome', {
    url: "/tutorHome",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.tutorHome.html',
          controller : 'home.tutor.tutorHome',
       }
    }
  })
});


app.controller("home.tutor.tutorHome", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {

  console.log(connection);
  $scope.me = $users.get('mySelf');

  $scope.online = true;

  $scope.$watch('online' , function(newValue , oldValue) {
    if (newValue) {
      window.postMessage('makeTutorOnline' , '*');
    }else {
      window.postMessage('makeTutorOffiline' , '*');
    }
  })

  $scope.$on('makeTutorOffiline', function(event, input) {
    $scope.online = false;
  });


  $http({method : 'GET' , url : '/api/tutors/tutors24Session/?mode=onlyComplete&limit=3&tutor='+ $scope.me.pk}).
  then(function(response) {
    console.log('resssssssssssssssssss',response.data.results);
    $scope.recentSession = response.data.results;

  })

  $scope.getTimeDiff = function(a,b){
    var milisecondsDiff = new Date(b) - new Date(a)
    return Math.floor(milisecondsDiff/(1000*60*60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff/(1000*60))%60).toLocaleString(undefined, {minimumIntegerDigits: 2})  + ":" + (Math.floor(milisecondsDiff/1000)%60).toLocaleString(undefined, {minimumIntegerDigits: 2}) ;
  }


  // connection.session.subscribe('service.tutor.list' , function(args) {
  //   console.log(args);
  // }).then(
  //   function (sub) {
  //     console.log("subscribed to topic 'tutor list'");
  //   },
  //   function (err) {
  //     console.log("failed to subscribed: " + err);
  //   }
  // );

});
