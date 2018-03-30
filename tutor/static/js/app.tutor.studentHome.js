app.config(function($stateProvider){

  $stateProvider
  .state('studentHome', {
    url: "/studentHome",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.studentHome.html',
          controller : 'home.tutor.studentHome',
       }
    }
  })

});

app.controller("home.tutor.studentHome", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal , $timeout) {
  console.log($state.params);
  if ($(location).attr('href').indexOf("mode=success")) {
    Flash.create('success' , 'Payment successfull')
    $state.go('studentHome');
  }

  $scope.form = {minutes1 : 0 , minutes2 : 0 , hours1 : 0, hours2 : 0}
  $scope.me = $users.get('mySelf');

  $scope.getProfile = function() {
    $http({method : 'GET' , url : '/api/tutors/Tutor24User/' }).
    then(function(response) {
      $scope.profile = response.data;
      $scope.profile.balance = response.data.tutorObj.balance;
      if ($scope.profile.balance == null || $scope.profile.balance == undefined) {
        return;
      }
      // $scope.profile.balance = 145;
      var minutes = $scope.profile.balance%60;
      var hours = parseInt($scope.profile.balance/60);

      console.log(minutes);
      console.log(hours);

      $scope.form.minutes1 = parseInt(minutes/10);
      $scope.form.minutes2 = minutes%10;

      $scope.form.hours1 = parseInt(hours/10);
      $scope.form.hours2 = hours%10;

      console.log($scope.form);

    })
  }

  $scope.getProfile();

  $http({method : 'GET' , url : '/api/tutors/tutors24Session/?mode=onlyComplete&limit=3&student='+ $scope.me.pk}).
  then(function(response) {
    $scope.recentSession = response.data.results;
  })

  $scope.getTimeDiff = function(a,b){
    var milisecondsDiff = new Date(b) - new Date(a)
    return Math.floor(milisecondsDiff/(1000*60*60)).toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + (Math.floor(milisecondsDiff/(1000*60))%60).toLocaleString(undefined, {minimumIntegerDigits: 2})  + ":" + (Math.floor(milisecondsDiff/1000)%60).toLocaleString(undefined, {minimumIntegerDigits: 2}) ;
  }


  $scope.startSession = function() {

    $scope.getProfile();

    if ($scope.profile.tutorObj.standard == null ||$scope.profile.tutorObj.standard == undefined || $scope.profile.tutorObj.standard.length == 0) {
      Flash.create('danger' , 'Your profile is not complete please complete the profile in Account page')
      return;
    }

    if ($scope.profile.balance < 10) {
      Flash.create('danger' , 'Balance low , Please add time into your account.')
      return;
    }


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addSession.form.html',
      size: 'md',
      backdrop : false,
      controller: function($scope , $uibModalInstance, $users ){

        $scope.tutorsOnline = [];

        $scope.me = $users.get('mySelf');

        $scope.form = {subject : null , topic : null , question : undefined}
        $scope.validity = {subject : false , topic : false , question : false}
        $scope.showErrors = false;
        $scope.subjects = [];
        $scope.topics = [];

        $scope.cancel = function() {
          $uibModalInstance.dismiss();
        }

        $http({method : 'GET' , url : '/api/LMS/subject/'}).
        then(function(response) {
          $scope.subjects = response.data;
        });

        $scope.$watch('form.subject' , function(newValue , oldValue) {
          console.log(newValue);
          if (newValue != null) {
            $http({method : 'GET' , url : '/api/LMS/topic/?subject=' + newValue }).
            then(function(response) {
              $scope.topics = response.data;
            });
          }
        }, true)
        $scope.status = 'idle';

        $scope.wait = function wait(ms){
           var start = new Date().getTime();
           var end = start;
           while(end < start + ms) {
             end = new Date().getTime();
          }
        }

        $scope.dismiss = function() {
          $uibModalInstance.dismiss();
        }

        $scope.sendTutoringRequest = function(sessionID) {

          var toSend= {
            student: $scope.me.pk,
            initialQuestion : $scope.form.question,
            subject : $scope.form.subject,
            topic : $scope.form.topic,
          }

          $http({method : 'POST' , url : '/api/tutors/tutors24Session/' , data : toSend}).
          then(function(response) {

            console.log("success");

            $scope.sessionID = response.data.pk;

            connection.session.publish('service.tutor.online' , [{type : 'newSessionRequest', sessionID : response.data.pk , subject: 1 , topic : 2 , id : $scope.me.username}], {}, {acknowledge: true});


            $timeout(function() {
              $scope.tutorsOnline = tutorsOnline;

              console.log($scope.tutorsOnline.length + " tutors found");

              for (var i = 0; i < $scope.tutorsOnline.length; i++) {
                if ($scope.tutorsOnline[i].checked ) {
                  continue
                }

                connection.session.publish('service.tutoring.call.' + $scope.tutorsOnline[i].tutorID , [{type : 'newSessionRequest', sessionID : $scope.sessionID , id : $scope.me.username}], {}, {acknowledge: true});

                console.log("Waiting start");
                console.log("Waiting end");

                $scope.tutorsOnline[i].checked = true;
              }


            }, 10000)

            $timeout(function() {
              $scope.status = 'noluck';
            },20000);


          })


        }

        $scope.tryAgain = function(){
          $scope.status = 'idle';
        };

        $scope.start = function() {

          console.log($scope.form);
          $scope.showErrors = true;
          if ($scope.form.subject == null) {
            $scope.validity.subject = false;
            return;
          }

          if ($scope.form.topic == null) {
            $scope.validity.topic = false;
            return;
          }

          if ($scope.form.question == undefined || $scope.form.question.length == 0) {
            $scope.validity.question = false;
            return;
          }

          $scope.status = 'starting';


          $scope.sendTutoringRequest(1);

          // $http({method : 'POST' , url : '/api/tutor/session/' , data : toSend}).
          // then(function() {
          //
          // })
        }
      },
    })
  }



  $scope.addHours = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addHours.form.html',
      size: 'lg',
      backdrop : true,
      controller: function($scope, $http ){
        $scope.form= {minutes : 30 , promoStatus : null , promo: '' , promoPercent : 0 , rate : 150}
        $scope.paymentParams = [];
        $scope.getDicount = function() {
          return $scope.form.rate * parseInt($scope.form.minutes) * $scope.form.promoPercent /(100*60);
        }

        $scope.getTax = function() {
          var total = $scope.form.rate * $scope.form.minutes/60;
          return parseInt((total- $scope.getDicount())*0.18);
        }

        $scope.getTotal = function() {
          return $scope.form.rate * $scope.form.minutes/60;
        }

        $scope.addPromoCode = function() {
          if ($scope.form.promo == 'FEE') {
            $scope.form.promoStatus = true;
            $scope.form.promoPercent = 50;
          }else{
            $scope.form.promoStatus = false;
            $scope.form.promoPercent = 0;
          }
        }

        $scope.getGrand = function() {
          return parseInt($scope.getTax()*1.18/0.18);
        }


        $scope.add = function(val) {
          if ($scope.form.minutes == undefined || $scope.form.minutes.length == 0) {
            var prev = 0;
          }else{
            var prev = parseInt($scope.form.minutes);
          }

          $scope.form.minutes = prev +val;
        }

        $scope.makePayment = function() {
          var toSend =$scope.form;
          toSend.grandTotal = $scope.getGrand();
          $http({method : 'POST' , url : '/api/ERP/paytmPayment/' , data : toSend }).
          then(function(response) {
            $scope.paymentParams = response.data;

            $timeout(function() {
              $('#paymentSubmit').click();
            }, 500)

          })
        }


      },
    })
  }


});
