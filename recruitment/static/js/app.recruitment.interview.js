app.config(function($stateProvider) {

  $stateProvider
    .state('workforceManagement.recruitment.interview', {
      url: "/jobs",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.recruitment.interview.html',
          controller: 'workforceManagement.recruitment.interview',
        }
      }
    })
});
app.controller("workforceManagement.recruitment.interview", function($scope, $http, $uibModal, $aside, $state, Flash, $users, $filter, $permissions) {
$scope.me = $users.get('mySelf');
$scope.data = {
  tableData: []
};

views = [{
  name: 'list',
  icon: 'fa-th-large',
  template: '/static/ngTemplates/genericTable/genericSearchList.html',
  itemTemplate: '/static/ngTemplates/app.recruitment.interview.item.html',
}, ];

$scope.config = {
  views: views,
  url:'/api/recruitment/interview/',
  getParams: [{
    "key": 'interviewer',
    "value": $scope.me.pk
  }],
  searchField: 'jobtype',
  itemsNumPerView: [16, 32, 48],
}

$scope.tableAction = function(target, action, mode) {
  console.log(target, action, mode);
  console.log("fdg", $scope.data.tableData);

  for (var i = 0; i < $scope.data.tableData.length; i++) {
    if ($scope.data.tableData[i].pk == parseInt(target)) {
     if (action == 'interviewBrowse') {
        var title = 'Browse Interview : ';
        var myapp = 'interviewBrowse';
      }
      $scope.addTab({
        title: title + $scope.data.tableData[i].pk,
        cancel: true,
        app: myapp,
        data: {
          pk: target,
          index: i
        },
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
  console.log($scope.tabs, $scope.tabs.length);
  for (var i = 0; i < $scope.tabs.length; i++) {
    console.log('***********************');
    if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
      $scope.tabs[i].active = true;
      alreadyOpen = true;
    } else {
      $scope.tabs[i].active = false;
    }
  }
  if (!alreadyOpen) {
    console.log(input);
    $scope.tabs.push(input)
    console.log($scope.tabs, $scope.tabs.length);
  }
}

});
app.controller("workforceManagement.recruitment.interview.explore", function($scope, Flash, $state, $users, $stateParams, $http, Flash, $uibModal, $aside) {

  $scope.details = $scope.data.tableData[$scope.tab.data.index]

  $scope.selected=function(){
    var toSend = {
      status :'suitable',
    }
    $http({method : 'PATCH' , url : '/api/recruitment/interview/'+  $scope.details.pk +'/' , data : toSend}).
    then(function(response) {
        Flash.create('success', 'Saved');
        $scope.comments();
    })
  }
  $scope.rejected=function(){
    var toSend = {
      status :'un-suitable',
    }
    $http({method : 'PATCH' , url : '/api/recruitment/interview/'+  $scope.details.pk +'/' , data : toSend}).
    then(function(response) {
        Flash.create('success', 'Saved');
        $scope.comments();
    })
  }

  $scope.recommend=function(){
    var toSend = {
      status :'recommand-other-job',
    }
    $http({method : 'PATCH' , url : '/api/recruitment/interview/'+  $scope.details.pk +'/' , data : toSend}).
    then(function(response) {
        Flash.create('success', 'Saved');
        $scope.comments();
    })
  }
  $scope.comment=[]
  $scope.commented=function(){
    var toSend = {
      comment :$scope.comment.comment,
    }
    $http({method : 'PATCH' , url : '/api/recruitment/interview/'+  $scope.details.pk + '/' , data : toSend}).
    then(function(response) {
        Flash.create('success', 'Saved');
        $scope.comment = response.data
        $scope.comment.comment=''
        $scope.comments();

    })
  }
  $scope.comments=function(){
    $http({
      method: 'GET',
      url: '/api/recruitment/interview/?candidate=' + $scope.details.candidate.pk
    }).then(function(response) {
      $scope.comment = response.data;
    })
  }
  $scope.comments();




});
