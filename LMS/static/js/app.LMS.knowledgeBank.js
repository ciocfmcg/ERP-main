app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.knowledgeBank', {
    url: "/knowledgeBank",
    templateUrl: '/static/ngTemplates/app.LMS.knowledgeBank.html',
    controller: 'projectManagement.LMS.knowledgeBank'
  });
});

app.controller("projectManagement.LMS.knowledgeBank", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.question.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/question/',
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
          var title = 'Edit Question :';
          var appType = 'questionEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'questionExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
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

app.controller("projectManagement.LMS.knowledgeBank.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  console.log($scope.tab);

  $scope.subjectSearch = function(query) {
    return $http.get( '/api/LMS/subject/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.topicSearch = function(query) {
    return $http.get( '/api/LMS/topic/?title__contains=' + query +'&&subject='+ $scope.form.subject.pk).
    then(function(response){
      return response.data;
    })
  };

  $scope.bookSearch = function(query) {
    return $http.get( '/api/LMS/book/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.sectionSearch = function(query) {
    return $http.get( '/api/LMS/section/?title__contains=' + query +'&&book='+ $scope.form.book.pk).
    then(function(response){
      return response.data;
    })
  };

  // subject  :'' , topic : ''

  $scope.fetchQuestion = function(pk) {

    $http({method : 'GET' , url : '/api/LMS/question/' + pk + '/'}).
    then(function(response) {
      $scope.form = response.data;
      $scope.form.quesPartTxt = '';
      $scope.form.textMode = false;
      $scope.form.quesPartFile = emptyFile;
      $scope.form.optionTxt = '';
      $scope.form.textModeOption = false;
      $scope.form.optionFile= emptyFile;
      $scope.form.answer= response.data.objectiveAnswer;
      $scope.form.solutionVideoPath = response.data.solutionVideo;
      $scope.form.solutionVideo = emptyFile;

      if (response.data.topic != null ) {
        $scope.form.subject = response.data.topic.subject;
        $scope.form.topic = response.data.topic;
      }
      if (response.data.bookSection != null) {
        $scope.form.book = response.data.bookSection.book;
        $scope.form.section = response.data.bookSection;
      }

      $scope.mode = 'edit';

    })


  }

  $scope.removePart = function(indx) {
    $http({method : 'DELETE' , url : '/api/LMS/qPart/' + $scope.form.quesParts[indx].pk + '/' }).
    then((function(indx) {
      return function(response) {
        $scope.form.quesParts.splice(indx , 1);
      }
    })(indx))
  }

  $scope.removeOption = function(indx) {
    $http({method : 'DELETE' , url : '/api/LMS/qPart/' + $scope.form.optionsParts[indx].pk + '/' }).
    then((function(indx) {
      return function(response) {
        $scope.form.optionsParts.splice(indx , 1);
      }
    })(indx))
  }

  $scope.removeSolution= function(indx) {
    $http({method : 'DELETE' , url : '/api/LMS/qPart/' + $scope.form.solutionParts[indx].pk + '/' }).
    then((function(indx) {
      return function(response) {
        $scope.form.solutionParts.splice(indx , 1);
      }
    })(indx))
  }



  $scope.resetForm = function() {
    if ($scope.form != undefined) {
      var subject = $scope.form.subject;
      var topic = $scope.form.topic;
      var book = $scope.form.book;
      var section = $scope.form.section
    }else{
      var subject = '';
      var topic = '';
      var book = '';
      var section = '';
    }

    $scope.mode = 'new';
    $scope.form = {ques : '' , quesParts : [], quesPartTxt : '' , textMode : false , quesPartFile : emptyFile , optionsParts : [], optionTxt : '' , optionFile : emptyFile   , textModeOption : false , level : 'easy' ,qtype : 'mcq' , typ : '' , solutionParts : [] , answer : '' , solutionVideo : emptyFile , solutionVideoPath : ''}

    $scope.form.subject = subject;
    $scope.form.topic = topic;
    $scope.form.book = book;
    $scope.form.section = section

  }

  $scope.resetForm();

  if (typeof $scope.tab != 'undefined') {
    $scope.fetchQuestion($scope.tab.data.pk);
  }

  // $scope.form.ques = " Is it true that \\(x^n + y^n = z^n\\) if \\(x,y,z\\) and \\(n\\) are positive integers?. Explain.";
  console.log('QQQQQQQQQQ',$scope.form);
  $scope.saveQuestion = function() {

    if ($scope.form.typ.length == 0) {
      Flash.create('warning', 'Please select a Type');
      return;
    }else {
      if ($scope.form.typ == 'book') {
        if ($scope.form.section.length>0 && !$scope.form.section.pk) {
          Flash.create('warning', 'Please select a valid Section');
          return;
        }
      }else {
        if ($scope.form.topic.length > 0 && !$scope.form.topic.pk) {
          Flash.create('warning', 'Please select a valid topic');
          return;
        }
      }
    }

    if ($scope.form.ques.length == 0) {
      Flash.create('warning', 'Please Write Some Question');
      return;
    }

    var f = $scope.form;
    console.log(f);
    var toSend = {
      ques : f.ques,
      typ : f.typ,
      level : f.level,
      qtype : f.qtype,
      objectiveAnswer: f.answer,
      solutionVideoLink: f.solutionVideoLink,
    }
    if ($scope.form.typ == 'book') {
      if ($scope.form.section.pk) {
        console.log('book');
        toSend.bookSection = f.section.pk
      }
    }else {
      if ($scope.form.topic.pk) {
        console.log('bank');
        toSend.topic = f.topic.pk
      }
    }

    var url = '/api/LMS/question/';
    if (!$scope.form.pk) {
      var method = 'POST';
    }else {
      var method = 'PATCH';
      url += f.pk + '/'
    }

    $http({method : method , url : url , data : toSend}).
    then(function(response) {
      if ($scope.form.solutionVideo == emptyFile || $scope.form.solutionVideo == null || typeof $scope.form.solutionVideo == 'string') {
        return;
      }


      $scope.mode = 'edit';
      Flash.create('success' , 'Saved');
      $scope.form.pk = response.data.pk;

      var fd = new FormData();
      fd.append('solutionVideo' , $scope.form.solutionVideo);

      var url = '/api/LMS/question/';
      if (!$scope.form.pk) {
        var method = 'POST';
      }else {
        var method = 'PATCH';
        url += $scope.form.pk + '/'
      }

      $http({
        method: method,
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).
      then(function(response) {
        Flash.create('success' , 'Saved');
        $scope.form.solutionVideoPath = response.data.solutionVideo;
      })









    })
  }

  $scope.addQuesPart = function() {
    var toSend = new FormData();

    if ($scope.form.textMode) {
      toSend.append('txt' , $scope.form.quesPartTxt);
      toSend.append('mode' , 'text');
      if ($scope.form.quesPartTxt == '') {
        return;
      }
    }else {
      toSend.append('image' , $scope.form.quesPartFile);
      toSend.append('mode' , 'image');
    }

    $http({
      method: 'POST',
      url: '/api/LMS/qPart/',
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {

      $http({method : 'PATCH' , url : '/api/LMS/question/' + $scope.form.pk + '/' , data : {qPartToAdd : response.data.pk}}).
      then((function(response) {
        return function(res) {
          Flash.create('success', 'Saved');
          $scope.form.quesParts.push(response.data);
          $scope.form.quesPartTxt = '';
          $scope.form.quesPartFile = emptyFile;
        }
      })(response))
    })

  }


  $scope.addSolution = function() {

    var toSend = new FormData();

    if ($scope.form.textModeSolution) {
      if ($scope.form.solutionTxt == '') {
        return;
      }
      toSend.append('txt' , $scope.form.solutionTxt);
      toSend.append('mode' , 'text');
    }else {
      toSend.append('image' , $scope.form.solutionFile);
      toSend.append('mode' , 'image');
    }

    $http({
      method: 'POST',
      url: '/api/LMS/qPart/',
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {

      $http({method : 'PATCH' , url : '/api/LMS/question/' + $scope.form.pk + '/' , data : {qSolutionToAdd : response.data.pk}}).
      then((function(response) {
        return function(res) {
          Flash.create('success', 'Saved');
          $scope.form.solutionParts.push(response.data);
          $scope.form.solutionTxt = '';
          $scope.form.solutionFile = emptyFile;
        }
      })(response))
    })
  }


  $scope.addOption = function() {

    var toSend = new FormData();

    if ($scope.form.textModeOption) {
      if ($scope.form.optionTxt == '') {
        return;
      }
      toSend.append('txt' , $scope.form.optionTxt);
      toSend.append('mode' , 'text');
    }else {
      toSend.append('image' , $scope.form.optionFile);
      toSend.append('mode' , 'image');
    }

    $http({
      method: 'POST',
      url: '/api/LMS/qPart/',
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {

      $http({method : 'PATCH' , url : '/api/LMS/question/' + $scope.form.pk + '/' , data : {qOptionToAdd : response.data.pk}}).
      then((function(response) {
        return function(res) {
          Flash.create('success', 'Saved');
          $scope.form.optionsParts.push(response.data);
          $scope.form.optionTxt = '';
          $scope.form.emptyFileOption = emptyFile;
        }
      })(response))
    })
  }


});
