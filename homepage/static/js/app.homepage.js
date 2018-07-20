console.log("loaded");
var app = angular.module('app', ['ui.router', 'ui.bootstrap']);


app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {

  // $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;




});

// app.run([ '$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {
//     $rootScope.$state = $state;
//     $rootScope.$stateParams = $stateParams;
//     $rootScope.$on("$stateChangeError", console.log.bind(console));
//   }
// ]);

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc



app.directive('typedEffect', typedEffect);

typedEffect.$inject = ['$interval', '$timeout'];

function typedEffect($interval, $timeout) {
  var directive = {
    restrict: 'A',
    scope: {
      text: '<',
      callback: '&'
    },
    link: link
  };

  return directive;

  function link(scope, element, attrs) {
    var i = 0,
      interval,
      text = scope.text || '',
      delay = parseInt(attrs.delay) || 0,
      speed = parseInt(attrs.speed) || 100,
      cursor = attrs.cursor || '|',
      blink = attrs.blink ? attrs.blink === 'true' : true;

    cursor = angular.element('<span>' + cursor + '</span>');

    $timeout(typeText, delay);

    function typeText() {
      typeChar();
      interval = $interval(typeChar, speed);

      function typeChar() {
        if (i <= text.length) {
          element.html(text.substring(0, i)).append(cursor);
          i++;
        } else {
          $interval.cancel(interval);

          if (blink) {
            cursor.addClass('blink');
          } else {
            cursor.remove();
          }

          if (attrs.callback) {
            scope.callback();
          }
        }
      }
    }
  }
}


app.controller('main', function($scope, $state, $http, $timeout, $interval, $uibModal) {

  $scope.crmBannerID = 1;

  $scope.mainBannerImages = ['/static/images/banner-img2.jpg']
  $scope.bannerID = 0;

  $scope.typings = ["Online tutoring", "24x7 online help", "Learn from school", "Learn from college", "Learn from home", "Learn from anywhere ...."]

  $scope.typeIndex = 0;

  $scope.activeTab = 0;

  $scope.changeTab = function(index) {
    $scope.activeTab = index;
  }


  $interval(function() {

    $scope.typeIndex += 1;
    if ($scope.typeIndex == $scope.typings.length) {
      $scope.typeIndex = 0;
    }

  }, 5000)

  $interval(function() {
    $scope.bannerID += 1;
    if ($scope.bannerID == $scope.mainBannerImages.length) {
      $scope.bannerID = 0;
    }
  }, 2000)

  $interval(function() {
    $scope.crmBannerID += 1;
    if ($scope.crmBannerID == 12) {
      $scope.crmBannerID = 1;
    }
  }, 1000)

  $scope.jobs = []

  $http.get('/api/recruitment/jobsList/?status=Active').
  then(function(response) {
    console.log(response.data, 'aaaaaa');
    $scope.jobs = response.data;
  })

  $scope.apply = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.careers.modal.apply.html',
      size: 'lg',
      backdrop: false,
      resolve: {
        data: function() {
          return $scope.jobs[idx];
        }
      },
      controller: "careers.modal.apply",
    }).result.then(function() {

    }, function() {

    });
  }

});
app.controller('homepage.chat', function($scope, $state, $http, $timeout, $interval, $uibModal) {
  $scope.name = "Pradeep";

  $scope.minimized = true;

  $scope.started = false;

  $scope.data = {
    minimized: true,
    started: false,
    msgText: '',
    name: '',
    email: ''
  }


  $scope.messages = [{
    msg: "hii",
    sentByMe: false
  }]
  $scope.msgText = '';
  $scope.send = function() {
    $scope.messages.push({
      msg: $scope.data.msgText,
      sentByMe: true
    })
    $scope.data.msgText = '';
  }
  var validUsers = [{
    'name': 'Pradeep',
    'email': 'abc@gmail.com'
  }, ];
  $scope.authentication = function() {
    if ($scope.data.name.length == 0 || $scope.data.email.length == 0) {
      return;
    }
    $scope.data.started = true;
    $scope.data.minimized = false;
  }



});

app.controller('homepage.career', function($scope, $state, $http, $timeout, $interval) {

  $scope.elements = [{
      role: 'FrontEnd Developer',
      functionalarea: 'Web Application Development',
      experience: '0-1 years',
      roledetails: 'view details',
      notes: 'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'
    },
    {
      role: 'Backend Developer',
      functionalarea: 'Web Application Development',
      experience: '0-1 years',
      roledetails: 'view details',
      notes: 'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'
    },
    {
      role: 'Android Developer',
      functionalarea: 'Web Application Development',
      experience: '0-1 years',
      roledetails: 'view details',
      notes: 'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'
    },
    {
      role: 'Software Developer Intern',
      functionalarea: 'Web Application Development',
      experience: '0-1 years',
      roledetails: 'view details',
      notes: 'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'
    }
  ];

});
app.directive('fileModel', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function() {
        scope.$apply(function() {
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

app.controller('careers.modal.apply', function($scope, $state, $http, $timeout, $uibModal, data, $uibModalInstance, $sce) {
  $scope.job = data;
  console.log($scope.job);
  var emptyFile = new File([""], "");
  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css: '/static/css/bootstrap.min.css',
    inline: false,
    plugins: 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme: 'modern',
    height: 300,
    toolbar: 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function(editor) {
      // editor.addButton();
    },
  };
  if ($scope.job.skill != null && $scope.job.skill.length > 0) {
    $scope.job.skill = $sce.trustAsHtml($scope.job.skill);
  }
  $scope.resetForm = function() {
    $scope.form = {
      'firstname': '',
      'lastname': '',
      'email': '',
      'mobile': '',
      'coverletter': '',
      'resume': emptyFile,
      'aggree': true
    }
  }

  $scope.resetForm();
  $scope.rsD = ''
  $scope.msg = ''
  $scope.save = function() {
    console.log($scope.form, 'aaaaaaaaaaa');
    var f = $scope.form;
    if (f.firstname.length == 0) {
      return
    }
    if (f.email.length == 0) {
      return
    }
    if (f.aggree == false) {
      return
    }
    if (f.mobile.length == 0) {
      return
    }
    $scope.rsD = ''
    if (f.resume == emptyFile) {
      $scope.rsD = 'Please Upload Resume In PDF Formate'
      return
    }
    var r = f.resume.name.split('.')[1]
    console.log(r);
    if (r != 'pdf') {
      $scope.rsD = 'Please Upload Resume In PDF Formate'
      return
    }
    var url = '/api/recruitment/jobsList/';
    var fd = new FormData();
    console.log(f.resume, 'aaaaaaaa');
    // if (f.resume != null && f.resume != emptyFile) {
    //   console.log("aaaaaaaaaa");
    // }
    fd.append('resume', f.resume)
    fd.append('firstname', f.firstname);
    fd.append('email', f.email);
    fd.append('mobile', f.mobile);
    fd.append('job', $scope.job.pk);
    if (f.aggree) {
      fd.append('aggree', f.aggree);
    }
    if (f.coverletter.length>0) {
      fd.append('coverletter', f.coverletter);
    }
    if (f.lastname.length>0) {
      fd.append('lastname', f.lastname);
    }

    console.log(fd, 'aaaaaaaaaaaaaa');
    var method = 'POST';

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
      console.log(response.data);
      if (response.data.res == 'Sucess') {
        $scope.resetForm();
        $scope.msg = 'Applied Sucessfully'
        $timeout(function () {
          $uibModalInstance.dismiss();
        }, 3000);
      }else {
        $scope.msg = 'Errors In The Form'
      }
    })
  }


  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };



})
