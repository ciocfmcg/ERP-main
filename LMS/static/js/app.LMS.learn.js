app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.learn', {
    url: "/learn",
    templateUrl: '/static/ngTemplates/app.LMS.learn.html',
    controller: 'projectManagement.LMS.learn'
  });
});

app.controller("projectManagement.LMS.learn", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {
  $scope.videoplayer=[
    {video:'bus.ogg',id:1,detail:"video1"},
    {video:'big_buck_bunny.ogv',id:2,detail:"video2"},
    {video:'bus.ogg',id:3,detail:"video3"},
    {video:'big_buck_bunny.ogv',id:4,detail:"video4"},
    {video:'bus.ogg',id:5,detail:"video5"},
    {video:'big_buck_bunny.ogv',id:6,detail:"video6"},

  ]


})
