// you need to first configure the stapp.config(function($stateProvider){
app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.support', {
      url: "/support",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.support.html',
          controller: 'businessManagement.support',
        }
      }
    })
});

app.controller("businessManagement.support", function($scope, $state, $users, $stateParams, $http, Flash , $timeout, $interval , $uibModal) {

     $scope.newUsers = [];
     $scope.myUsers =[];

     // $scope.templates=[
     //   {
     //     "msg":"Call you later"
     //   },
     //   {
     //     "msg":"Get Back to you"
     //   }
     //
     // ];

   $scope.chatsInView = [];
   $scope.data = { activeTab:0,}

   $scope.data.xInView = 0;

   $scope.msgText='';

   $scope.setxInView = function(indx) {
     $scope.xInView = indx;
   }

   $scope.closeChatBox = function(index) {
     console.log('dfddcominh in closesssssss');
     $scope.chatsInView.splice(index,1)
   }

   $scope.display = function(data) {
     $scope.msgText=$scope.templates[data].msg ;
   }

   $scope.addToChat = function(indx) {
     console.log('comingggg');
     for (var i = 0; i < $scope.chatsInView.length; i++) {
       if ($scope.myUsers[indx].uid == $scope.chatsInView[i].uid) {
         console.log('already in chat');
         return
       }
     }
     if ($scope.chatsInView.length<4) {
       $scope.chatsInView.push($scope.myUsers[indx])
       console.log('yess');
     }else {
       $scope.chatsInView.push($scope.myUsers[indx])
       $scope.chatsInView.splice(0,1)
       console.log('elseeee');
     }
   }


   // $scope.tabs=[
   //   {
   //     name: "Templates",
   //     active:"true",
   //     icon: "indent"
   //   },
   //   {
   //     name: "Events",
   //     active:"false",
   //     icon: "clock-o"
   //   },
   //   {
   //     name: "Comments",
   //     active:"true",
   //     icon: "envelope-o"
   //   }
   // ]
   //
   // $scope.comments = [{msg:"hii,how are you,i am fine",date:"2nd march",time:"2.00 pm"},{msg:"hello,how are you",date:"3nd march",time:"6.00 pm"},{msg:"In computer programming, a comment is a programmer-readable explanation or annotation in the source code of a computer program. They are added with the purpose of making the source code easier for humans to understand, and are generally ignored by compilers and interpreters.",date:"5th march",time:"4.00 pm"},{msg:"yups,how are you",date:"1st march",time:"8.00 pm"}]

   $scope.assignUser = function (indx) {
     $scope.myUsers.push($scope.newUsers[indx]);
     $scope.newUsers.splice(indx, 1);
   }

});
