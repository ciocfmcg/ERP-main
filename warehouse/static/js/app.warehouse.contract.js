app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.contract', {
    url: "/contract",
    templateUrl: '/static/ngTemplates/app.warehouse.contract.html',
    controller: 'businessManagement.warehouse.contract'
  });
});

app.controller('businessManagement.warehouse.contract', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.evaluation.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/warehouse/contract/',
    searchField: 'ques',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit contract :';
          var appType = 'contractEditor';
        } else if (action == 'details') {
          var title = 'contract Details :';
          var appType = 'contractExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            contract : $scope.data.tableData[i]
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
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});

app.controller("projectManagement.warehouse.evaluation.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.form = {topic : '' , text : '' , subject : ''}
  $scope.questions = []
  $scope.selectedquestions=[]

  if ($scope.tab == undefined || $scope.tab.data == undefined) {
    $scope.mode = 'new';
  }else {
    $scope.mode = 'edit';
    $scope.selectedquestions = $scope.tab.data.contract.questions;
    console.log($scope.selectedquestions );
  }

  $scope.$watch('form.topic' , function(newValue , oldValue){
    if (typeof newValue != 'object') {
      return;
    }
    $scope.fetchQuestions();
  });

  $scope.fetchQuestions = function() {

    if (typeof $scope.form.topic != 'object') {
      return;
    }

    $http({method:'GET',url:'/api/warehouse/question/?topic='+ $scope.form.topic.pk + '&ques__contains=' + $scope.form.text}).
    then(function(response) {
      $scope.questions.length=0
      angular.forEach(response.data,function(obj){
        $scope.questions.push({'ques':obj})
      })
      console.log($scope.questions);
    })
  }

  $scope.subjectSearch = function(query) {
    return $http.get( '/api/warehouse/subject/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.topicSearch = function(query) {
    return $http.get( '/api/warehouse/topic/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.add = function() {
    for (var i = 0; i < $scope.questions.length; i++) {
      console.log($scope.questions[i])
      if ($scope.questions[i].selected){
        $scope.selectedquestions.push({'ques':$scope.questions[i].ques , 'marks': 1,'negativeMarks':0.25,'optional':false})
      }
    }
  };


  $scope.resetForm=function(){
    $scope.selectedquestions=[]
    $scope.questions.length=0
    $scope.form={topic : '' , text : '' , subject : ''}
  }

  $scope.save= function(){
    var toSend=[]
    for (var i = 0; i < $scope.selectedquestions.length; i++) {
      console.log($scope.selectedquestions[i])
      var data = {
        ques : $scope.selectedquestions[i].ques.pk,
        marks : $scope.selectedquestions[i].marks,
        optional : $scope.selectedquestions[i].optional,
        negativeMarks : $scope.selectedquestions[i].negativeMarks,
      }
      toSend.push(data)
    }
    if ($scope.mode=='edit'){
      var method='PATCH';
      var url='/api/warehouse/contract/'+$scope.tab.data.contract.pk+'/';
      $http({method : method , url : url , data :  {questions :toSend}}).
      then(function(response) {
          Flash.create('success', 'Question contract Updated');
          console.log(response.data);
      })
    }else {
      var method='POST';
      var url='/api/warehouse/quescontract/';
      $http({method : method , url : url , data :  {questions :toSend}}).
      then(function(response) {
        Flash.create('success', 'Question contract Created');
        console.log(response.data);
        resetForm();
      })
    }

  };



  $scope.delete=function(indx){
    $scope.selectedquestions.splice(indx,1)
  }

});
