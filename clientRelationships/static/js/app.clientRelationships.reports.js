app.controller("businessManagement.clientRelationships.reports", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, $uibModal) {
  var date = new Date();
  $scope.form = {
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: date,
    users: [],
    reportType: 'call',
    filter: false
  }

  $scope.page = 'quick';

  $scope.me = $users.get('mySelf');

  $scope.callData = []
  $scope.fd = new Date(date.getFullYear(), date.getMonth(), 1)
  $scope.td = date
  $scope.usr = []
  $scope.mail = []
  $scope.users = []

  $scope.valConfig = {
    type: 'funnel',
    data: {
      datasets: [{
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          "#16a085",
          "#af6a10",
          "#FFB424",
          "#2980b9",
          "#27ae60",
          "#795F99"
        ],
        hoverBackgroundColor: [
          "#16a085",
          "#af6a10",
          "#FFB424",
          "#2980b9",
          "#27ae60",
          "#795F99"
        ]
      }],
      labels: [
        "Contacting",
        "Demo/POC",
        "Requirements",
        "Proposal",
        "Negotiation",
        "Conclusion"
      ]
    },
    options: {
      responsive: true,
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Sales pipeline'
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  $scope.sendMail = function(){
    $http({
      method: 'GET',
      url: '/api/clientRelationships/schedule/'
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        if($scope.form.reportType==response.data[i].typ){
          console.log(response.data[i].pk,'aaaaaaaaaaaaaaa');
          $http({method : 'POST' , url : '/api/clientRelationships/scheduleReport/?user'+ response.data[i].pk}).
          then(function() {
            Flash.create('success', 'Email sent successfully')
          })
        }
      }
    })
  }
  // $scope.mail=function(){
  //
  //   var cc = []
  //   console.log( $scope.users,'aaaaaaaaa');
  //   for (var i = 0; i < $scope.users.length; i++) {
  //     cc.push($scope.users[i]);
  //   }
  //
  //   var toSend = {
  //     // contact :contact,
  //     cc : cc,
  //     emailbody :'',
  //     emailSubject:''
  //   }
  //   $http({method : 'POST' , url : '/api/clientRelationships/scheduleReport/' }).
  //   then(function() {
  //     Flash.create('success', 'Email sent successfully')
  //   })
  // }
  $scope.countConf = JSON.parse(JSON.stringify($scope.valConfig))

  $scope.dealGraph = false
  $scope.showtyp = 'val'
  $scope.change = function() {
    $scope.dealGraph = !$scope.dealGraph
    console.log('llllllllllllll', $scope.dealGraph);
    if ($scope.dealGraph) {
      $scope.showtyp = 'count'
    } else {
      $scope.showtyp = 'val'
    }
  }

  $scope.fetchdata = function() {
    $http({
      method: 'GET',
      url: '/api/clientRelationships/reportHomeCal/?fdate=' + $scope.fd + '&tdate=' + $scope.td + '&usr=' + $scope.usr + '&typ=' + $scope.form.reportType
    }).
    then(function(response) {
      console.log(response.data);
      $scope.callData = response.data

      if ($scope.form.reportType == 'pipeline' && $scope.callData.length > 0) {
        $scope.valConfig.data.datasets[0].data = $scope.callData[0].sumLi
        $scope.countConf.data.datasets[0].data = $scope.callData[0].countLi
        var valG = document.getElementById("chart-areaVal").getContext("2d");
        var countG = document.getElementById("chart-areaCount").getContext("2d");
        window.myDoughnut1 = new Chart(valG, $scope.valConfig);
        window.myDoughnut2 = new Chart(countG, $scope.countConf);
      }

    })
  }

  $scope.$watch('form.from', function(newValue, oldValue) {
    $scope.fd = new Date($scope.form.from.getFullYear(), $scope.form.from.getMonth(), $scope.form.from.getDate() + 1).toJSON().split('T')[0]
    console.log($scope.fd);
    $scope.fetchdata()
  })
  $scope.$watch('form.to', function(newValue, oldValue) {
    $scope.td = newValue.toJSON().split('T')[0]
    console.log($scope.td);
    $scope.fetchdata()
  })
  $scope.$watch('form.users', function(newValue, oldValue) {
    $scope.usr = newValue
    console.log(newValue);
    $scope.fetchdata()
  }, true)

  $scope.details = function(data) {
    console.log(data);
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.report.details.modal.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        data: function() {
          return data;
        },
      },
      controller: function($scope, $state, $users, data, $stateParams, $http, Flash, $timeout, $uibModal) {
        console.log(data.details);
        $scope.data = data

        $scope.removeDuplicates = function(originalArray, objKey) {
          var trimmedArray = [];
          var values = [];
          var value;
          for (var i = 0; i < originalArray.length; i++) {
            value = originalArray[i][objKey];
            if (values.indexOf(value) === -1) {
              trimmedArray.push(originalArray[i]);
              values.push(value);
            }
          }
          return trimmedArray;
        }

        for (var i = 0; i < $scope.data.details.length; i++) {
          console.log($scope.data.details[i]);
          pkL = []
          $scope.data.details[i].data = $scope.removeDuplicates($scope.data.details[i].data,'pk')
        }
      },
    })
  }

  $scope.scheduleModal = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.report.schedule.modal.html',
      size: 'md',
      backdrop: true,
      resolve: {
        data: function() {
          return $scope.me;
        },
        typ: function() {
          return $scope.form.reportType;
        },
      },
      controller: "report.schedule.modal",
    }).result.then(function() {

    }, function() {

    });


  }

});

app.controller("report.schedule.modal", function($scope, $state, $users, $stateParams, $http, Flash, $timeout, data, Flash, typ) {

  $scope.me = data;
  $scope.reportType = typ;
  $scope.form = {
    users: []
  }
  var regExp = /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4}[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]{2,4})[\W]*$/;

  $http({
    method: 'GET',
    url: '/api/clientRelationships/schedule/'
  }).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      if ($scope.reportType == response.data[i].typ)
        $scope.form = response.data[i]
    }
  })

  $scope.saveSchedule = function() {
    var f = $scope.form

    var users = []
    for (var i = 0; i < f.users.length; i++) {
      users.push(f.users[i]);
    }

    if (f.email == undefined || f.email == '' || f.email.match(regExp)) {
      f.email = f.email;
      var url = '/api/clientRelationships/schedule/'
      if (!$scope.form.pk) {
        method = 'POST';
      } else if ($scope.form.pk) {
        method = 'PATCH'
        url += $scope.form.pk + '/'
      }

      var dataToSend = {
        slot: f.slot,
        users: users,
        email: f.email,
        typ: $scope.reportType
      }
      $http({
        method: method,
        url: url,
        data: dataToSend
      }).
      then(function(response) {
        Flash.create('success', 'Saved');
        $scope.form = response.data
      });
    } else {
      Flash.create('danger', 'Enter valid email Ids');
    }

  }

})
