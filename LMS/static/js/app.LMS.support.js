app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.support', {
    url: "/support",
    templateUrl: '/static/ngTemplates/app.LMS.support.html',
    controller: 'projectManagement.LMS.support'
  });
});

app.controller("projectManagement.LMS.support", function($scope, $state, $users, $stateParams, $http, Flash , $timeout, $interval) {

     $scope.names = [
       {name : 'visitor1',messages : [{msg : "hi",sentByMe:false}],email:"visitor1@gmail.com",address:"Siliguri,west bengal",location:"78.108.48.149",time:"4.20 pm",chattime:"17.02",isOnline:true},
       {name : 'visitor2',messages : [{msg : "hi",sentByMe:false}],email:"visitor2@gmail.com",address:"Islampur,west bengal",location:"75.101.42.150",time:"3.10 pm",chattime:"15.02",isOnline:true},
       {name : 'visitor3',messages : [{msg : "hi",sentByMe:false}],email:"visitor3@gmail.com",address:"Raiganj,west bengal",location:"79.105.41.189",time:"2.30 pm",chattime:"17.02",isOnline:false},
       {name : 'visitor4',messages : [{msg : "hi",sentByMe:false}],email:"visitor5@gmail.com",address:"Darejeeling,west bengal",location:"81.106.54.109",time:"1.50 pm",chattime:"17.02",isOnline:true},
       {name : 'visitor5',messages : [{msg : "hi",sentByMe:false}],email:"visitor6@gmail.com",address:"Kolkata,west bengal",location:"78.108.48.149",time:"7.20 am",chattime:"23.02",isOnline:true},
       {name : 'visitor6',messages : [{msg : "",sentByMe:false,videoUrl:'/static/video/f.mp4'}],email:"visitor7@gmail.com",address:"Barasat,west bengal",location:"56.178.65.149",time:"6.20 pm",chattime:"12.02",isOnline:false},
       {name : 'visitor7',messages : [{msg : "",sentByMe:false,img:'/static/images/appStore.png'}],email:"visitor7@gmail.com",address:"islampur,west bengal",location:"48.198.58.129",time:"4.20 pm",chattime:"15.02",isOnline:true},

     ];
     $scope.incomming =[
         {name : 'visitor0',messages : [{msg : "hi",sentByMe:false}],email:"visitor@gmail.com",address:"islampur,west bengal",location:"78.108.48.149",time:"4.20 pm",chattime:"17.02",isOnline:true},
     ];
     $scope.templates=[
       {
         "msg":"Call you later"
       },
       {
         "msg":"Get Back to you"
       }

     ];


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
   $scope.display = function(data) {
   // alert(data);
   $scope.msgText=$scope.templates[data].msg ;

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
       name: "Templates",
       active:"true",
       icon: "envelope-o"
     }
   ]


});
