app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.courses', {
    url: "/courses",
    templateUrl: '/static/ngTemplates/app.LMS.courses.html',
    controller: 'projectManagement.LMS.courses'
  });
});

app.controller("projectManagement.LMS.courses", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {


  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.course.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/course/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Course :';
          var appType = 'courseEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'courseExplorer';
        }


        $scope.addTab({
          title: title + $scope.data.tableData[i].title,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            course : $scope.data.tableData[i]
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

  $timeout(function() {
    $scope.addTab({"title":"Details :4","cancel":true,"app":"courseExplorer","data":{"pk":4,"index":3 , course : $scope.data.tableData[3]},"active":true})
  }, 1000)










});

app.controller("projectManagement.LMS.courses.explore", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.course = $scope.tab.data.course;

  $scope.activeTab = 0;

  $scope.tabs = [{
      name: 'File',
      active: true,
      icon: 'file-o'
    },
    {
      name: 'Video',
      active: false,
      icon: 'video-camera'
    },
    {
      name: 'Presentation',
      active: false,
      icon: 'file-powerpoint-o'
    },
    {
      name: 'Quiz',
      active: false,
      icon: 'question-circle-o'
    },
    {
      name: 'Announcement',
      active: false,
      icon: 'bullhorn'
    },
    {
      name: 'Notes',
      active: false,
      icon: 'sticky-note-o'
    },
  ]

  $scope.enrollmentForm = {user : undefined}

  $scope.addEnrollment = function() {
    if ($scope.enrollmentForm.user == undefined || typeof $scope.enrollmentForm.user != 'object') {
      Flash.create('warning' , 'Please select a user first');
      return;
    }


    for (var i = 0; i < $scope.course.enrollments.length; i++) {
      if ($scope.course.enrollments[i].user == $scope.enrollmentForm.user.pk) {
        Flash.create('danger' , 'User already enrolled for this course');
        return;
      }
    }

    var toSend = {user : $scope.enrollmentForm.user.pk , course : $scope.course.pk}

    $http({method : 'POST' , url : '/api/LMS/enrollment/' , data : toSend}).
    then(function(response) {
      Flash.create('success' , 'Added')
      $scope.enrollmentForm.user = undefined;
      $scope.course.enrollments.push(response.data);
    })

  }

  $scope.studyMaterialForm = {attachment : emptyFile}

  $scope.saveFile = function() {
    if ($scope.studyMaterialForm.attachment == emptyFile) {
      Flash.create('warning' , 'No file selected');
      return;
    }

    var fd = new FormData();

    fd.append('attachment' , $scope.studyMaterialForm.attachment)
    fd.append('course' , $scope.course.pk)
    if ($scope.activeTab == 0) {
      fd.append('typ' , 'file')
    }else {
      fd.append('typ' , 'video')
    }

    $http({method : 'POST' , url : '/api/LMS/studyMaterial/' , data : fd , transformRequest: angular.identity, headers: { 'Content-Type': undefined }}).
    then(function(response) {
      $scope.course.studyMaterials.push(response.data);
      Flash.create('success' , 'File added');
    })

  }

  // $scope.open = function () {
  //   console.log('opening pop up');
  //   var modalInstance = $modal.open({
  //     // templateUrl: 'popup.html',
  //   });
  // }



});

app.controller("projectManagement.LMS.courses.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.topicSearch = function(query) {
    return $http.get( '/api/LMS/topic' +'?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.getName = function(topic) {
    if (typeof topic != 'object') {
      return;
    }
    return topic.title + '  ('+ topic.subject.title +')';
  }

  $scope.resetForm = function() {
    $scope.form = {topic : '' , enrollmentStatus : 'open' , description : '' , dp : emptyFile, TAs: [] , instructor : undefined , title : ''};
  }

  $scope.resetForm();

  $scope.save = function() {
    var f = $scope.form;
    var toSend = {
      instructor : f.instructor.pk,
      topic : f.topic.pk,
      description : f.description,
      enrollmentStatus : f.enrollmentStatus,
      TAs : f.TAs,
      title : f.title
    }
    $http({method : 'POST' , url : '/api/LMS/course/' , data : toSend}).
    then(function(response) {
      if ($scope.form.dp == emptyFile) {
        $scope.resetForm();
        Flash.create('success' , 'Created')
      }else {
        var fd = new FormData();
        fd.append('dp' , $scope.form.dp);

        $http({
          method: 'PATCH',
          url: '/api/LMS/course/' + response.data.pk +'/',
          data: fd,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).
        then(function(response) {
          $scope.resetForm();
          Flash.create('success', 'Created')
        })



      }

    })

  }


});
