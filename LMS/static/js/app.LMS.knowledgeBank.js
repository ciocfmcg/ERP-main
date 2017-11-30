app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.knowledgeBank', {
    url: "/knowledgeBank",
    templateUrl: '/static/ngTemplates/app.LMS.knowledgeBank.html',
    controller: 'projectManagement.LMS.knowledgeBank'
  });
});

app.controller("projectManagement.LMS.knowledgeBank", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller("projectManagement.LMS.knowledgeBank.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.form = {ques : '' , quesParts : [], quesPartTxt : '' , quesPartFile : emptyFile , options : [], optionTxt : 'Is it true that \\(x^n + y^n = z^n\\) '  , textMode : false , textModeOption : false}

  $scope.form.ques = " Is it true that \\(x^n + y^n = z^n\\) if \\(x,y,z\\) and \\(n\\) are positive integers?. Explain.";



  $scope.addQuesPart = function() {
    if ($scope.form.textMode) {
      $scope.form.quesParts.push({mode : 'text' , txt : $scope.form.quesPartTxt});
    }else {
      $scope.form.quesParts.push({mode : 'file' , image : $scope.form.quesPartFile});
    }
  }


  $scope.addOption = function() {
    if ($scope.form.optionTxt == '') {
      return;
    }
    $scope.form.options.push($scope.form.optionTxt);
    $scope.form.optionTxt = '';
  }


});
