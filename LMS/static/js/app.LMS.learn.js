app.config(function($stateProvider) {
  $stateProvider.state('projectManagement.LMS.learn', {
    url: "/learn",
    templateUrl: '/static/ngTemplates/app.LMS.learn.html',
    controller: 'projectManagement.LMS.learn'
  });
});

app.controller("projectManagement.LMS.learn", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal) {


  $scope.Reactvideo = [{
      image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/026/thumb/react.png",
      name: "React",
      details: "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update",
    }

  ]
  $scope.Javascriptvideo = [{
      image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/205/thumb/javascriptlang.png",
      name: "Javascipt",
      details: "used in many non-browser environments as well such as node.js or Apach CouchDB. It is a prototype-based, multi-paradigm scripting language that is dynamic, and supports object-oriented, imperative, and functional programming styles",
    }

  ]
  $scope.Reactnativevideo = [{
      image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/969/thumb/reactnativelogo.png",
      name: "React Native",
      details: "React Native lets you build mobile apps using only JavaScript. It uses the same design as React, letting you compose a rich mobile UI from declarative components.",
    }

  ]

  $scope.videoForm =[{title  : '' , file : emptyFile , playList : 0}]

  $scope.openUploadForm = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.upload.html',
      size: 'md',
      backdrop: true,
      resolve : {videoForm : function() {
          return $scope.videoForm;
        }
      },
      controller: function($scope, $uibModalInstance , videoForm) {
          $scope.cancel = function () {
             $uibModalInstance.dismiss('cancel');
           };

          $scope.f = videoForm;
          $scope.upload = function() {
            $scope.f.push({
             title: $scope.f.title,
             file: $scope.f.fileupload,
             playList: $scope.f.duration
           });
         }
      },
    }).result.then(function() {
      // console.log($scope.videoForm);

    }, function() {

    });
  }





  $scope.overall = true;
  $scope.React = true;
  $scope.Javascript = true;
  $scope.ReactNative = true;

  $scope.video = function() {

    $scope.React = !$scope.React;
    $scope.overall = false;

  }

  $scope.video1 = function() {

    $scope.Javascript = !$scope.Javascript;
    $scope.overall = false;
  }
  $scope.video2 = function() {

    $scope.ReactNative = !$scope.ReactNative;
    $scope.overall = false;
  }
  $scope.back = function() {

    $scope.overall = true;
    $scope.React = true;
    $scope.Javascript = true;
    $scope.ReactNative = true;


  }


});
