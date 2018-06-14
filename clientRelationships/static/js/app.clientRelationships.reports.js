app.controller("businessManagement.clientRelationships.reports", function($scope, $state, $users, $stateParams, $http, Flash , $timeout ) {
  var date = new Date();

  $scope.form = {from : new Date(date.getFullYear(), date.getMonth(), 1) , to : date , users : [] , reportType : '' , filter : false}

  $scope.page = 'quick';

  $scope.me = $users.get('mySelf');

  $scope.callData=[]

  // $http({
  //   method: 'GET',
  //   url: '/api/clientRelationships/activity/'
  // }).
  // then(function(response) {
  //   for (i=0;i<response.data.length;i++){
  //     if(response.data[i].typ=='call'){
  //       $scope.callData.push(response.data[i])
  //     }
  //   }
  // })
  $scope.$watch('form.users', function(newValue, oldValue) {
    console.log(newValue);
  });
  $scope.datechange=function(){
    console.log($scope.form);
    $scope.callData=[]
    $http({
      method: 'GET',
      url: '/api/clientRelationships/activity/'
    }).
    then(function(response) {
      for (i=0;i<response.data.length;i++){
        if(response.data[i].typ=='call'){
          // if($scope.form.from!=null&&$scope.form.to!=null&&$scope.form.users!=null){
          //   console.log($scope.form.users,response.data[i].contact);
          //   if($scope.form.from<new Date(response.data[i].created)&&new Date(response.data[i].created)<$scope.form.to&&response.data[i].contact==$scope.form.users){
          //     $scope.callData.push(response.data[i])
          //   }
          // }
          // else
          if($scope.form.from!=null&&$scope.form.to!=null){
            if($scope.form.from<new Date(response.data[i].created)&&new Date(response.data[i].created)<$scope.form.to){
              // $scope.callData.push(response.data[i])
              if($scope.form.users.length>0){
                for(j=0;j<$scope.form.users[i];j++){
                  if(response.data[i].contact==$scope.form.users[i]){
                    console.log(response.data[i],'aaaaaaaaa');
                    $scope.callData.push(response.data[i])
                  }
                }
              }
              else{
                $scope.callData.push(response.data[i])
              }
            }
          }

        }
      }
    })
  }
    $scope.datechange()

});
