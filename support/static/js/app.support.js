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

     $scope.newUsers = [
       {name : 'visitor1',messages : [{msg : "Hello , how are you?",sentByMe:false , created: new Date() } , {msg : "",sentByMe:true,img:'/static/images/appStore.png' , created: new Date()}],email:"visitor1@gmail.com",address:"Siliguri,west bengal",location:"78.108.48.149",time:"4.20 pm",chattime:"17.02",isOnline:true, uid:'24Tutors$123$f'},
       {name : 'visitor2',messages : [{msg : "I need help!",sentByMe:false ,created: new Date()} , {msg : "How can I help you?",sentByMe:true , created: new Date()}],email:"visitor2@gmail.com",address:"Islampur,west bengal",location:"75.101.42.150",time:"3.10 pm",chattime:"15.02",isOnline:true, uid:'monomerce$234$c'},
       {name : 'visitor3',messages : [{msg : "what is my order status",sentByMe:false ,created: new Date()} , {msg : "Give me a minute",sentByMe:true , created: new Date()} , {msg : "Let me check!",sentByMe:true}],email:"visitor3@gmail.com",address:"Raiganj,west bengal",location:"79.105.41.189",time:"2.30 pm",chattime:"17.02",isOnline:false, uid:'rackmint$345$s'},
       {name : 'visitor4',messages : [{msg : "Hey",sentByMe:true , created: new Date()} , {msg : "Hello , How can i help you?",sentByMe:false , created: new Date()}],email:"visitor5@gmail.com",address:"Darejeeling,west bengal",location:"81.106.54.109",time:"1.50 pm",chattime:"17.02",isOnline:true, uid:'24Tutors$456$i'},
       {name : 'visitor5',messages : [{msg : "I need refund",sentByMe:false , created: new Date()} , {msg : "Let me check your order",sentByMe:true , created: new Date()}],email:"visitor6@gmail.com",address:"Kolkata,west bengal",location:"78.108.48.149",time:"7.20 am",chattime:"23.02",isOnline:true, uid:'monomerce$567$f'},
       {name : 'visitor6',messages : [{msg : "",sentByMe:false, videoUrl:'/static/video/f.mp4' , created: new Date()}],email:"visitor7@gmail.com",address:"Barasat,west bengal",location:"56.178.65.149",time:"6.20 pm",chattime:"12.02",isOnline:false, uid:'rackmint$678$c'},
       {name : 'visitor7',messages : [{msg : "",sentByMe:false,img:'/static/images/appStore.png' , created: new Date()}],email:"visitor7@gmail.com",address:"islampur,west bengal",location:"48.198.58.129",time:"4.20 pm",chattime:"15.02",isOnline:true, uid:'24Tutors$789$f'},
     ];
     $scope.myUsers =[
         {name : 'visitor0',messages : [{msg : "hi",sentByMe:false , created: new Date()}],email:"visitor@gmail.com",address:"islampur,west bengal",location:"78.108.48.149",time:"4.20 pm",chattime:"17.02",isOnline:true, uid:'monomerce$000$s'},
     ];
     $scope.templates=[
       {
         "msg":"Call you later"
       },
       {
         "msg":"Get Back to you"
       }

     ];


   $scope.chatsInView = [];
   $scope.data = { activeTab:0,}

   $scope.data.xInView = 0;

   $scope.msgText='';


   $scope.send = function($index) {
     $scope.names[$scope.data.xInView].messages.push({msg : $scope.msgText,sentByMe : true})
     $scope.msgText = '';
   }

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


   $scope.tabs=[
     {
       name: "Templates",
       active:"true",
       icon: "indent"
     },
     {
       name: "Events",
       active:"false",
       icon: "clock-o"
     },
     {
       name: "Comments",
       active:"true",
       icon: "envelope-o"
     }
   ]

   $scope.comments = [{msg:"hii,how are you,i am fine",date:"2nd march",time:"2.00 pm"},{msg:"hello,how are you",date:"3nd march",time:"6.00 pm"},{msg:"In computer programming, a comment is a programmer-readable explanation or annotation in the source code of a computer program. They are added with the purpose of making the source code easier for humans to understand, and are generally ignored by compilers and interpreters.",date:"5th march",time:"4.00 pm"},{msg:"yups,how are you",date:"1st march",time:"8.00 pm"}]

   $scope.assignUser = function (indx) {
     $scope.myUsers.push($scope.newUsers[indx]);
     $scope.newUsers.splice(indx, 1);
   }

});
