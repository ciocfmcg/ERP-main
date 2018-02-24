app.config(function($stateProvider) {
  $stateProvider.state('projectManagement.LMS.learn', {
    url: "/learn",
    templateUrl: '/static/ngTemplates/app.LMS.learn.html',
    controller: 'projectManagement.LMS.learn'
  });
});

app.controller("projectManagement.LMS.course.explore", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal , $sce,$rootScope) {
  $scope.course = $scope.tab.data.course;

  $scope.openVideo = function(id) {

    console.log($scope.$parent);

    $scope.$parent.addTab({
      title: "watch : " + $scope.course.videos[id].title,
      cancel: true,
      app: 'video',
      data: {
        video : $scope.course.videos[id]
      },
      active: true
    })

  }

  $scope.addVideolist = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.addvideolist.html',
      size: 'md',
      backdrop: true,
      resolve : {video : function() {

          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.videos[$scope.videoInView];
          }
        },
        channelID : function() {
          return $scope.course.pk;
        }
      },

      controller: "projectManagement.learn.video.new" ,
    }).result.then(function() {

    }, function() {
      $rootScope.$broadcast('forceRefetch' , {});
    });
  }


  // $scope.editCourse = function() {
  //
  // }

  $scope.editCourse = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.uploadcourse.html',
      size: 'xl',
      backdrop: true,
      resolve : {course : function() {
          return $scope.course;
        },
        channelID : function() {
          return undefined;
        }
      },

      controller: "projectManagement.learn.videos.new" ,
    }).result.then(function() {

    }, function() {
      $rootScope.$broadcast('forceRefetch' , {});
    });
  }


});


app.controller("projectManagement.LMS.videos.explore", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal , $sce) {
  console.log();
  $scope.video = $scope.tab.data.video;

  $scope.me = $users.get('mySelf');


  $scope.editVideo = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.addvideolist.html',
      size: 'md',
      backdrop: true,
      resolve : {video : function() {
            return $scope.video;
        },
        channelID : function() {
          return undefined;
        }
      },

      controller: "projectManagement.learn.video.new" ,
    }).result.then(function() {

    }, function() {
      $rootScope.$broadcast('forceRefetch' , {});
    });
  }
  $scope.like = function () {
    var url = '/api/LMS/feedback/';
    var toSend = {
     typ: 'like',
     video: $scope.video.pk
    }
    $http({
      method: 'POST',
      url: url,
      data: toSend,
    }).then(function(response) {
     $scope.form.pk = response.data.pk;
     // Flash.create('success', 'Saved')
     $scope.video.feedbacks.push(response.data);
    })
  };

  // var dummyDate = new Date();
  //
  // var onlyDate = new Date(dummyDate.getFullYear(), dummyDate.getMonth(), dummyDate.getDate()); // 2013-07-30 23:59:59

  $scope.form = {'comment':'', likes : 0 , comments : 0 , liked : false}

  $scope.$watch('video.feedbacks' , function() {

    var count= 0;
    for(i=0;i<$scope.video.feedbacks.length;i++){
      if ($scope.video.feedbacks[i].typ == 'like') {
        count ++;

        if ($scope.video.feedbacks[i].user == $scope.me.pk) {
          $scope.form.liked = true;
        }

      }
    }
    $scope.form.likes = count;;


    var count= 0;
    for(i=0;i<$scope.video.feedbacks.length;i++){
      if ($scope.video.feedbacks[i].typ == 'comment') {
        count ++;
      }
    }

    $scope.form.comments = count;;

  }, true)


  $scope.send = function () {
    var f = $scope.form;
    var url = '/api/LMS/feedback/';
    var toSend = {
     typ: 'comment',
     video: $scope.video.pk,
     comment : f.comment,
    }
    // var dateParts=toSend.date.split('/');
    // toSend.date=dateParts[2]+'-'+dateParts[1]+'-'+dateParts[0];
    $http({
      method: 'POST',
      url: url,
      data: toSend,
    }).then(function(response) {
     $scope.form.pk = response.data.pk;
     // Flash.create('success', 'Saved')
     $scope.video.feedbacks.push(response.data);
     $scope.form.comment = '';

    })
  };


  $scope.likeCount = function(){

  }

  $scope.commentCount = function(){

  }

//   $scope.comments = [{msg:"hii,how are you,i am fine",date:"2nd march",time:"2.00 pm",sentByMe:false},{msg:"hello,how are you",date:"3nd march",time:"6.00 pm",sentByMe:false},{msg:"In computer programming, a comment is a programmer-readable explanation or annotation in the source code of a computer program. They are added with the purpose of making the source code easier for humans to understand, and are generally ignored by compilers and interpreters.",date:"5th march",time:"4.00 pm",sentByMe:false},{msg:"yups,how are you",date:"1st march",time:"8.00 pm",sentByMe:false}]
//
//
//
  // $scope.msgText='';
  //
  //
  //   $scope.form.push({feedback : $scope.msgText})
  //   $scope.msgText = '';

//
});

app.controller("projectManagement.learn.video.new" , function($scope, $uibModalInstance , video , channelID,$http,Flash) {

  console.log(channelID);

  $scope.cancel = function () {
     $uibModalInstance.dismiss('cancel');
   };
   if (video.pk != undefined) {
     $scope.mode = 'edit';
     console.log('edit',$scope.form);
     $scope.form = video;
   } else {
     $scope.mode = 'new';
   $scope.form={'title':'','attachment':emptyFile,'thumbnail':emptyFile,'views':'','description':'','channel':channelID}
 }
   console.log($scope.form.title);
   $scope.upload = function () {

     // var f = $scope.form;
     var url = '/api/LMS/video/';
     if ($scope.form.pk == undefined) {
       var method = 'POST';
     } else {
       var method = 'PATCH';
       url += $scope.form.pk + '/';
     }

      console.log($scope.form);
      var f = $scope.form;
      if (f.title.length == 0) {
        Flash.create('warning', 'title can not be left blank');
        return;
      }
      var fd = new FormData();
      if (f.attachment != emptyFile && typeof f.attachment != 'string') {
        fd.append('attachment', f.attachment)
      }
      if (f.thumbnail !=emptyFile && typeof f.thumbnail != 'string'){
        fd.append('thumbnail', f.thumbnail)
      }
      fd.append('title', f.title);
      fd.append('description', f.description);
      fd.append('views', f.views);
      if (f.channel != undefined) {
        fd.append('channel',f.channel)
      }
      console.log(f.attachment);
      console.log(f.thumbnail);
      console.log(fd);
      $http({
        method: method,
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).then(function(response) {
        $scope.form.pk = response.data.pk;
        Flash.create('success', 'Saved')
      })
    };
});

app.controller("projectManagement.LMS.learn", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal , $sce, $rootScope) {

  $scope.data = {
    tableData: [],
    videosTableData : []

  };

  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.learn.courses.html',

  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/channel/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    multiselectOptions: multiselectOptions,
  }


  $scope.tableAction = function(target, action, mode) {
    if (action == 'new') {
      $scope.addCourse();
    } else {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'openCourse') {
          var title = 'openCourse :';
          var appType = 'explore';
        }
        // } else if (action == 'details') {
        //   var title = 'Paper Details :';
        //   var appType = 'paperExplorer';
        // }


        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
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
}

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.learn.videos.html',
  }, ];

  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];


  $scope.configVideos = {
    views: views,
    url: '/api/LMS/video/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    multiselectOptions: multiselectOptions,
  }


  $scope.tableActionVideos = function(target, action, mode) {
    if (action == 'new') {
      $scope.addVideolist();
    } else {
    for (var i = 0; i < $scope.data.videosTableData.length; i++) {
      if ($scope.data.videosTableData[i].pk == parseInt(target)) {
        if (action == 'openVideo') {
          var title = 'Watch :';
          var appType = 'video';
        }
        // } else if (action == 'details') {
        //   var title = 'Paper Details :';
        //   var appType = 'paperExplorer';
        // }


        $scope.addTab({
          title: title + $scope.data.videosTableData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            video : $scope.data.videosTableData[i]
          },
          active: true
        })
      }
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

  // $scope.mode == 'search';

  $scope.form = {mode : 'search' , searchTxt : '' , videos : false}



  $scope.addCourse = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.uploadcourse.html',
      size: 'xl',
      backdrop: true,
      resolve : {course : function() {
        return {};
        }
      },
      controller: "projectManagement.learn.videos.new",
    }).result.then(function() {
      // console.log($scope.videoForm);

    }, function() {
      $rootScope.$broadcast('forceRefetch' , {});
    });
  }

  $scope.addVideolist = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.addvideolist.html',
      size: 'md',
      backdrop: true,
      resolve : {video : function() {

          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.videos[$scope.videoInView];
          }
        },
        channelID : function() {
          return undefined;
        }
      },

      controller: "projectManagement.learn.video.new" ,
    }).result.then(function() {

    }, function() {
      $rootScope.$broadcast('forceRefetch' , {});
    });
  }

});


app.controller("projectManagement.learn.videos.new", function($scope, $uibModalInstance , course ,$http,Flash) {

    $scope.tinymceOptions = {
      selector: 'textarea',
      content_css : '/static/css/bootstrap.min.css',
      inline: false,
      plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
      skin: 'lightgray',
      theme : 'modern',
      height : 340,
      toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    };
    $scope.cancel = function () {
       $uibModalInstance.dismiss('cancel');
     };
     if (course.pk != undefined) {
       $scope.mode = 'edit';
       console.log('edit',$scope.form);
       $scope.form = course;
     } else {
       $scope.mode = 'new';
     $scope.form={'title':'','dp':emptyFile,'version':0.1,'description':''}
   }
     console.log($scope.form.title);
     $scope.upload = function () {

       // var f = $scope.form;
       var url = '/api/LMS/channel/';
       if ($scope.form.pk == undefined) {
         var method = 'POST';
       } else {
         var method = 'PATCH';
         url += $scope.form.pk + '/';
       }

        console.log($scope.form);
        var f = $scope.form;
        if (f.title.length == 0) {
          Flash.create('warning', 'title can not be left blank');
          return;
        }
        var fd = new FormData();
        if (f.dp != emptyFile && typeof f.dp != 'string') {
          fd.append('dp', f.dp)
        }
        fd.append('title', f.title);
        fd.append('description', f.description);
        fd.append('version', f.version);
        console.log(f.dp);
        console.log(fd);
        $http({
          method: method,
          url: url,
          data: fd,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).then(function(response) {
          $scope.form.pk = response.data.pk;
          Flash.create('success', 'Saved')
        })
      };
});
