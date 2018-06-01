app.controller("controller.home.myWork", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.items = []

  $scope.selectDate = function(indx) {
    $scope.selectIndex = indx;
  }

  $scope.selectIndex = 2;

  $scope.next = function() {
    $scope.selectIndex < $scope.dates.length - 1 ? $scope.selectIndex++ : $scope.selectIndex = 0;

  }

  $scope.prev = function() {
    $scope.selectIndex > 0 ? $scope.selectIndex-- : $scope.selectIndex = $scope.dates.length - 1;
  }



  $scope.addTableRow = function() {
    $scope.items.push({
      project: '',
      duration: 0,
      comment: ''
    });
    console.log($scope.items);
  }

  $scope.totalTime = function() {

    if ($scope.items == undefined) {
      return 0;
    }


    var total = 0;
    for (var i = 0; i < $scope.items.length; i++) {
      if ($scope.items[i].duration != undefined) {
        total += $scope.items[i].duration;
      }
    }
    return total.toFixed(2);
    console.log('aaaaaa', total);
  }


  $scope.deleteTable = function(index) {
    if ($scope.items[index].pk != undefined) {
      $http({
        method: 'DELETE',
        url: '/api/performance/timeSheetItem/' + $scope.items[index].pk + '/'
      }).
      then((function(index) {
        return function(response) {
          $scope.items.splice(index, 1);
          Flash.create('success', 'Deleted');
        }
      })(index))

    } else {
      $scope.items.splice(index, 1);
    }
  };



  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  var today = new Date();
  var day = 1000 * 3600 * 24;

  $scope.dates = [new Date(today.getTime() - day * 2), new Date(today.getTime() - day), today, new Date(today.getTime() + day), new Date(today.getTime() + 2 * day)];

  console.log($scope.dates);


  $http({
    method: 'GET',
    url: '/api/projects/project/?member'
  }).
  then(function(response) {
    $scope.projects = response.data;
    console.log($scope.projects);
  })


  $scope.addProjects = function(idx) {

    for (var i = 0; i < $scope.items.length; i++) {
      if ($scope.items[i].project.pk == $scope.projects[idx].pk) {
        console.log($scope.items[i].project.pk);
        console.log($scope.projects[idx].pk);
        Flash.create('warning', 'Already added');
        return;
      }
    }

    $scope.items.push({
      project: $scope.projects[idx],
      duration: 0,
      comment: ''
    });

  }

  // function addZero(i) {
  //   if (i < 10) {
  //     i = "0" + i;
  //   }
  //   return i;
  // }

  $scope.checkin = function() {
    var d = new Date();
    console.log(d);
    $scope.checkinTime = d.getTime();
    console.log('aaaaaa', $scope.checkinTime,$scope.timeSheet);
    $http({
      method: 'PATCH',
      url: '/api/performance/timeSheet/'+ $scope.timeSheet.pk + '/',
      data: {
        checkInTime: 'checkin',
      }
    }).
    then(function(response) {
      $scope.btnTyp = response.data;
    })
  }

  $scope.checkout = function() {
    var d = new Date();
    $scope.checkoutTime = d.getTime() - $scope.checkinTime;
    console.log('bbbbbbbbbb', $scope.checkoutTime,$scope.timeSheet);
    $http({
      method: 'PATCH',
      url: '/api/performance/timeSheet/'+ $scope.timeSheet.pk + '/',
      data: {
        checkOutTime: 'checkout',
      }
    }).
    then(function(response) {
      $scope.btnTyp = response.data;
    })
  }

  $scope.$watch('selectIndex', function(newValue, oldValue) {
    var today = new Date()

    var dt = $scope.dates[newValue];
    if (dt > today ) {
      console.log('featureeeeeeee');
      $scope.Checkinshow = false
    }else {
      console.log('past or equallllllllll');
      $scope.Checkinshow = true
    }

    $http({
      method: 'GET',
      url: '/api/performance/timeSheet/?date=' + dt.toJSON().split('T')[0]
    }).
    then(function(response) {
      if (response.data.length == 0) {

        $http({
          method: 'POST',
          url: '/api/performance/timeSheet/',
          data: {
            date: $scope.dates[newValue].toJSON().split('T')[0],
            // status: 'saved'
          }
        }).
        then(function(response) {
          $scope.timeSheet = response.data;
          $scope.items = $scope.timeSheet.items;
          console.log('dddddddddddd',$scope.timeSheet);
          if ($scope.timeSheet.checkIn == null && $scope.timeSheet.checkOut == null) {
            $scope.btnTyp = ''
          }else {
            $scope.btnTyp = $scope.timeSheet
          }
        })

      } else {
        $scope.timeSheet = response.data[0];
        $scope.items = $scope.timeSheet.items;
        console.log('dddddddddddd',$scope.timeSheet);
        if ($scope.timeSheet.checkIn == null && $scope.timeSheet.checkOut == null) {
          $scope.btnTyp = ''
        }else {
          $scope.btnTyp = $scope.timeSheet
        }
      }

    })


  })


  $scope.save = function() {

    for (var i = 0; i < $scope.items.length; i++) {
      var url = '/api/performance/timeSheetItem/'
      var method = 'POST';
      if ($scope.items[i].pk != undefined) {
        url += $scope.items[i].pk + '/'
        method = 'PATCH';
      }

      console.log('aaaaaaaaa', $scope.items[i].project.pk);



      var toSend = {
        project: $scope.items[i].project.pk,
        duration: $scope.items[i].duration,
        comment: $scope.items[i].comment,
        parent: $scope.timeSheet.pk,
      }
      console.log(toSend);

      $http({
        method: method,
        url: url,
        data: toSend
      }).
      then((function(i) {
        return function(response) {
          $scope.items[i].pk = response.data.pk;
          Flash.create('success', 'Saved');
        }
      })(i))

    }

  }
  $scope.Submit = function() {
    $http({
      method: 'PATCH',
      url: '/api/performance/timeSheet/' + $scope.timeSheet.pk + '/',
      data: {
        status: 'submitted'
      }
    }).
    then(function(response) {
      $scope.timeSheet = response.data;
      Flash.create('success', 'Submitted');
    })
  }

});
