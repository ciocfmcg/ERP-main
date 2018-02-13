app.config(function($stateProvider) {
  $stateProvider.state('projectManagement.LMS.learn', {
    url: "/learn",
    templateUrl: '/static/ngTemplates/app.LMS.learn.html',
    controller: 'projectManagement.LMS.learn'
  });
});

app.controller("projectManagement.LMS.learn", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal , $sce) {

  $scope.mode == 'search';

  $scope.form = {mode : 'search' , searchTxt : '' , videos : false}

  $scope.comments = [{msg:"hii,how are you,i am fine",date:"2nd march",time:"2.00 pm",sentByMe:false},{msg:"hello,how are you",date:"3nd march",time:"6.00 pm",sentByMe:false},{msg:"In computer programming, a comment is a programmer-readable explanation or annotation in the source code of a computer program. They are added with the purpose of making the source code easier for humans to understand, and are generally ignored by compilers and interpreters.",date:"5th march",time:"4.00 pm",sentByMe:false},{msg:"yups,how are you",date:"1st march",time:"8.00 pm",sentByMe:false}]



  $scope.msgText='';

  $scope.send = function() {
    $scope.comments.push({msg : $scope.msgText})
    $scope.msgText = '';
  }

  $scope.addCourse = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.uploadcourse.html',
      size: 'xl',
      backdrop: true,
      resolve : {course : function() {

        if (idx == undefined || idx == null) {
          return {};
        } else {
          return $scope.data[$scope.couseInView];
        }
      }
      },

      controller: function($scope, $uibModalInstance , course) {


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


        console.log(course);
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
      },
    }).result.then(function() {
      // console.log($scope.videoForm);

    }, function() {
      $scope.fetchChannels();
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
          if($scope.form.mode = 'explore'){
            return $scope.data[$scope.couseInView].pk
          }else{
            return undefined;
          }
        }
      },

      controller: function($scope, $uibModalInstance , video , channelID) {

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
              if (f.attachment != emptyFile) {
                fd.append('attachment', f.attachment)
              }
              if (f.thumbnail !=emptyFile){
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
      },
    }).result.then(function() {
      // console.log($scope.videoForm);

    }, function() {
      $scope.fetchChannels();
    });
  }

  $scope.openCourse = function(indx) {
    $scope.couseInView = indx;
    $scope.form.mode = 'explore';
  }


  $scope.fetchChannels = function() {
    $http({
      method: 'GET',
      url: '/api/LMS/channel/'
    }).
    then(function(response) {
      console.log('******************');
      console.log(response.data);
      $scope.data=response.data;

      for (var i = 0; i < $scope.data.length; i++) {
        $scope.data[i] = $sce.trustAsHtml($scope.data[i]);
      }

      // $scope.form = response.data;
    })
  }
  $scope.fetchVideos = function() {
  $http({
    method: 'GET',
    url: '/api/LMS/video/'
  }).
  then(function(response) {
    console.log('******************');
    console.log(response.data);
    $scope.videos=response.data
    // $scope.form = response.data;
  })
}


  $scope.fetchChannels();
  $scope.fetchVideos();


  // $scope.data = {form : [] , couseInView : {}}
  //
  //
  // $scope.data.courses = [
  //   {name : 'React' , img : '/static/images/reactjs.png' , description : 'Some desc text' , rating : 4 , videos : [{
  //       image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/026/thumb/react.png",
  //       name: "React",
  //       details: "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update",
  //       file:"emptyFile",
  //     }
  //
  //   ],views:'400k views',day:'4 days ago'},
  //   {name : 'React' , img : '/static/images/css3.png' , description : 'Some desc text' , rating : 4 , videos : [{
  //       image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/026/thumb/react.png",
  //       name: "Angular JS",
  //       details: "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update",
  //       file:"emptyFile"
  //     }
  //
  //   ],views:'400k views',day:'4 days ago'},
  //   {name : 'NodeJS' , img : '/static/images/reactjs.png' , description : 'Some desc text' , rating : 4 , videos : [{
  //       image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/026/thumb/react.png",
  //       name: "NodeJS",
  //       details: "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update",
  //       file:"emptyFile"
  //     }
  //
  //   ],views:'400k views',day:'4 days ago'},
  //   {name : 'Angular JS' , img : '/static/images/python.png' , description : 'Some desc text' , rating : 4 , videos : [{
  //       image: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/026/thumb/react.png",
  //       name: "React",
  //       details: "React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update",
  //       file:"emptyFile"
  //     }
  //
  //   ],views:'400k views',day:'4 days ago'}
  // ]

  $scope.openVideo = function(indx) {
    $scope.videoInView = indx;
    $scope.form.mode = 'video';
  }

  // $scope.data = {videos : [] , videoInView : {}}


  // $scope.data.videos = [
  //   {name : 'prabhakar' ,views:'400k views',day:'4 days ago',video:"/static/videos/big_buck_bunny.ogv",description : 'Some desc text' },
  //   {name : 'React' ,views:'500k views',day:'7 days ago',video:"/static/videos/big_buck_bunny.ogv",description : 'Some desc text'},
  //   {name : 'NodeJS' ,views:'600k views',day:'2 days ago',video:"/static/videos/big_buck_bunny.ogv",description : 'Some desc text'},
  //   {name : 'Angular JS' ,views:'900k views',day:'1 days ago',video:"/static/videos/big_buck_bunny.ogv",description : 'Some desc text'}
  // ]


  $scope.back = function() {
    $scope.form.mode = 'search';
  }


});
