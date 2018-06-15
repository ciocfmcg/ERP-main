app.controller("businessManagement.clientRelationships.reports", function($scope, $state, $users, $stateParams, $http, Flash, $timeout,$uibModal) {
  var date = new Date();

  $scope.form = {
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: date,
    users: [],
    reportType: '',
    filter: false
  }

  $scope.page = 'quick';

  $scope.me = $users.get('mySelf');

  $scope.callData = []
  $scope.fd = new Date(date.getFullYear(), date.getMonth(), 1)
  $scope.td = date
  $scope.usr = []

  $scope.fetchdata = function(){
    $http({
      method: 'GET',
      url: '/api/clientRelationships/reportHomeCal/?fdate='+$scope.fd+'&tdate='+$scope.td+'&usr='+$scope.usr+'&typ='+$scope.form.reportType
    }).
    then(function(response) {
      console.log(response.data);
      $scope.callData = response.data
    })
  }

  $scope.$watch('form.from' , function(newValue , oldValue) {
    $scope.fd = new Date($scope.form.from.getFullYear(),$scope.form.from.getMonth(),$scope.form.from.getDate()+1).toJSON().split('T')[0]
    console.log($scope.fd);
    $scope.fetchdata()
  })
  $scope.$watch('form.to' , function(newValue , oldValue) {
    $scope.td = newValue.toJSON().split('T')[0]
    console.log($scope.td);
    $scope.fetchdata()
  })
  $scope.$watch('form.users' , function(newValue , oldValue) {
    $scope.usr = newValue
    console.log(newValue);
    $scope.fetchdata()
  },true)

  $scope.scheduleModal=function(){
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.report.schedule.modal.html',
        size: 'md',
        backdrop: true,
        resolve: {
          data: function() {
            return $scope.me;
          }
        },
        controller: "report.schedule.modal",
      }).result.then(function() {

      }, function() {

      });


  }

});

app.controller("report.schedule.modal", function($scope, $state, $users, $stateParams, $http, Flash , $timeout, data,Flash ) {

$scope.me=data;
console.log($scope.me,'aaaaaaaaa');
$scope.form = { users : []}
var regExp = /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4}[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4})[\W]*$/;
$scope.saveSchedule=function(){
  var f = $scope.form

  var users = []
  for (var i = 0; i <f.users.length; i++) {
    users.push(f.users[i]);
  }

  var mail=f.email
  if(mail.match(regExp)){
    f.email=mail;
    var dataToSend = {
      slot:f.slot,
      users:users,
      email:f.email
    }
    $http({
      method: 'POST',
      url: '/api/clientRelationships/schedule/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
    });
  }
  else{
    Flash.create('danger', 'Enter valid email Ids');
  }

}

})
