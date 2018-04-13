app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.warehouse.checkin', {
      url: "/checkin",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.warehouse.checkin.html',
          controller: 'businessManagement.warehouse.checkin',
        }
      }
    })
});

app.controller("controller.warehouse.checkin.info", function($scope, $state, $users, $stateParams, $http, Flash, checkin , $uibModal) {



});
app.controller("businessManagement.warehouse.checkin.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.contract = $scope.tab.data;

  $scope.data = {
    checkinTableData: []
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkin.explore.item.html',
  }, ];

  $scope.configCheckin = {
    views: views,
    url: '/api/warehouse/checkin/',
    searchField: 'description',
    itemsNumPerView: [6, 12, 24],
    getParams: [{
      key: 'contract',
      value: $scope.contract.pk
    }],
    editorTemplate: '/static/ngTemplates/app.warehouse.checkin.form.html',
    canCreate: true,
  }

  $scope.tableActionCheckin = function(target, action, mode) {
    console.log(target);
    console.log(action);

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.warehouse.checkin.view.html',
      size: 'lg',
      backdrop : true,
      resolve : {
        contract : function() {
          return $scope.contract;
        },
        id : function(){
          return target;
        }
      },controller : function($scope ,$timeout, contract , id) {

        $scope.checkinId = id;

        $scope.getRandomColor = function() {
          var letters = '0123456789ABCDEF';
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }

        $scope.initializeCanvas = function() {

          console.log("canvas" + $scope.contractId);
          var canvas = document.getElementById("canvas" + $scope.contractId);

          canvas.removeEventListener('click', function() {

          });

          c = canvas.getContext("2d");
          console.log(c);
          boxSize = 20;
          boxes = Math.floor(600 / boxSize);
          $scope.arr = [];
          $scope.contractarray = [];
          $scope.contractColour = $scope.getRandomColor();
          $scope.selectedCheckinArray = [];
          $scope.selectedCheckinColour = $scope.getRandomColor();
          $scope.checkinArray = [];
          $scope.checkinColour = $scope.getRandomColor();
          $scope.checkinDetails = [{
            color: $scope.contractColour,
            name: 'Available Space'
          }];
          $scope.selectedCheckinArea = [];
          $scope.CheckinArea = [];

          for (var i = 0; i < $scope.checkinData.length; i++) {
            if ($scope.checkinData[i].place != null) {
              console.log('pushing',$scope.checkinId,$scope.checkinData[i].pk);
              $scope.checkinData[i].place = JSON.parse($scope.checkinData[i].place)
              if ($scope.checkinId == $scope.checkinData[i].pk) {
                $scope.selectedCheckinArray.push({
                  'place': $scope.checkinData[i].place,
                  'description': $scope.checkinData[i].description,
                })
              }else {
                $scope.checkinArray.push({
                  'place': $scope.checkinData[i].place,
                  'description': $scope.checkinData[i].description,
                })
              }
            }
          }
          console.log($scope.checkinArray);

          var w = (canvas.width / boxSize);
          var h = (canvas.height / boxSize);
          drawBox();
          // canvas.addEventListener('click', handleClick);
          // canvas.addEventListener('mousemove', handleClick);
          // var value = 0;
          function drawBox() {
            c.beginPath();
            c.fillStyle = "#87CEFA";
            c.lineWidth = 1;
            c.strokeStyle = '#eeeeee';
            for (var row = 0; row < boxes; row++) {
              for (var column = 0; column < boxes; column++) {
                var x = row * boxSize;
                var y = column * boxSize;
                c.rect(x, y, boxSize, boxSize);
                c.fill();
                c.stroke();
              }
            }

          }

          var state = new Array(h);
          for (var y = 0; y < h; ++y) {
            state[y] = new Array(w);
          }

          // canvas.addEventListener('click', handleClick);

          function fill(s, gx, gy) {
            c.fillStyle = s;
            c.fillRect(gx * boxSize, gy * boxSize, boxSize, boxSize);
          }
            console.log('entered');
            $scope.arr = JSON.parse($scope.contract.areas.areas);
            for (var i = 0; i < $scope.arr.length; i++) {
              var gx = $scope.arr[i].row
              var gy = $scope.arr[i].col
              state[gy][gx] = true;
              fill('white', gx, gy);
            }

            if ($scope.contract.occupancy.length > 0) {
              $scope.contractarray = $scope.contract.occupancy
              if (typeof $scope.contractarray == 'string') {
                $scope.contractarray = JSON.parse($scope.contractarray)
              }
            }
            console.log($scope.contractarray);
            for (var i = 0; i < $scope.contractarray.length; i++) {
              var gx = $scope.contractarray[i].row
              var gy = $scope.contractarray[i].col
              state[gy][gx] = true;
              fill($scope.contractColour, gx, gy);
            }
            for (var i = 0; i < $scope.checkinArray.length; i++) {

              console.log($scope.checkinArray[i]);
              $scope.CheckinArea.push({
                color: $scope.checkinColour,
                name: $scope.checkinArray[i].description,
              })
              for (var j = 0; j < $scope.checkinArray[i].place.length; j++) {
                var gx = $scope.checkinArray[i].place[j].row
                var gy = $scope.checkinArray[i].place[j].col
                state[gy][gx] = true;
                fill($scope.checkinColour, gx, gy);
                // console.log(gx,gy,'values');
              }
              console.log('^^^^^^^^^^^^^^^^^^^^^^^^^',$scope.selectedCheckinArea);

            }
            for (var i = 0; i < $scope.selectedCheckinArray.length; i++) {
              $scope.selectedCheckinArea.push({
                color: $scope.selectedCheckinColour,
                name: $scope.selectedCheckinArray[i].description,
              })
              for (var j = 0; j < $scope.selectedCheckinArray[i].place.length; j++) {

                var gx = $scope.selectedCheckinArray[i].place[j].row
                var gy = $scope.selectedCheckinArray[i].place[j].col
                state[gy][gx] = true;
                fill($scope.selectedCheckinColour, gx, gy);
                // console.log(gx,gy,'values');
              }
            }

        }

        $scope.contract = contract
        $scope.contractId = $scope.contract.pk;


        $scope.canvasFun = function(){
          $http.get('/api/warehouse/checkin/?contract=' + $scope.contractId).
          then(function(response) {
            $scope.checkinData = response.data;
            console.log('!!!!!!!!!!!!!!!!!!!', $scope.checkinData);
          })

          $timeout(function() {
            $scope.initializeCanvas();
          }, 1000)
        }

        $scope.canvasFun();



      }
    })


  }

});

app.controller("businessManagement.warehouse.checkin.item", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.open = false;

  $scope.form = {
    value: '',
    typ: true
  }

  $http({
    method: 'GET',
    url: '/api/warehouse/checkout/?parent=' + $scope.data.pk
  }).
  then(function(response) {
    $scope.data.checkouts = response.data;
  })

  $scope.checkout = function() {
    if ($scope.form.typ) {
      var typ = 'qty';
      var qty = $scope.data.qty - parseFloat($scope.form.value);
    } else {
      var typ = 'percent';
      var qty = ($scope.data.qty) * (1 - parseFloat($scope.form.value) / 100)
    }

    var toSend = {
      parent: $scope.data.pk,
      initial: $scope.data.qty,
      final: qty,
      value: $scope.form.value,
      typ: typ
    }
    $http({
      method: 'POST',
      url: '/api/warehouse/checkout/',
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Adjusted');
      $scope.form.value = '';
      $scope.data.qty = response.data.final;

      if ($scope.data.checkouts == undefined) {
        $scope.data.checkouts = [];
      }

      $scope.data.checkouts.push(response.data);
    })

  }

});

app.controller("businessManagement.warehouse.checkin", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: [],
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkin.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/warehouse/contract/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'openCheckin') {
          var title = 'Open Project :';
          var appType = 'checkinExplorer';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          data: $scope.data.tableData[i],
          active: true
        })
      }
    }

  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.checkout.item.html',
  }, ];


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

});

app.controller("businessManagement.warehouse.checkin.form", function($scope, $timeout, $state, $users, $stateParams, $http, Flash) {



  $scope.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  $scope.initializeCanvas = function() {

    console.log("canvas" + $scope.contractId);
    var canvas = document.getElementById("canvas" + $scope.contractId);

    canvas.removeEventListener('click', function() {

    });

    c = canvas.getContext("2d");
    console.log(c);
    boxSize = 20;
    boxes = Math.floor(600 / boxSize);
    $scope.arr = [];
    $scope.contractarray = [];
    $scope.contractColour = $scope.getRandomColor();
    $scope.checkinArray = [];
    $scope.selectingAreas = [];
    $scope.selectingColour = $scope.getRandomColor();
    $scope.checkinDetails = [{
      color: $scope.contractColour,
      name: 'Available Space'
    },{
      color: $scope.selectingColour,
      name: 'Selecting Colour'
    }];
    $scope.selectedCheckinArea = [];
    console.log('(((((((((((((())))))))))))))',$scope.selectingAreas);

    for (var i = 0; i < $scope.checkinData.length; i++) {
      console.log('pushing');
      if ($scope.checkinData[i].place != null) {
        $scope.checkinData[i].place = JSON.parse($scope.checkinData[i].place)
        $scope.checkinArray.push({
          'place': $scope.checkinData[i].place,
          'description': $scope.checkinData[i].description,
        })
      }
    }
    console.log($scope.checkinArray);

    var w = (canvas.width / boxSize);
    var h = (canvas.height / boxSize);
    drawBox();
    // canvas.addEventListener('click', handleClick);
    // canvas.addEventListener('mousemove', handleClick);
    // var value = 0;
    function drawBox() {
      c.beginPath();
      c.fillStyle = "#87CEFA";
      c.lineWidth = 1;
      c.strokeStyle = '#eeeeee';
      for (var row = 0; row < boxes; row++) {
        for (var column = 0; column < boxes; column++) {
          var x = row * boxSize;
          var y = column * boxSize;
          c.rect(x, y, boxSize, boxSize);
          c.fill();
          c.stroke();
        }
      }

    }

    var state = new Array(h);
    for (var y = 0; y < h; ++y) {
      state[y] = new Array(w);
    }

    canvas.addEventListener('click', handleClick);

    function fill(s, gx, gy) {
      c.fillStyle = s;
      c.fillRect(gx * boxSize, gy * boxSize, boxSize, boxSize);
    }
      console.log('entered');
      $scope.arr = JSON.parse($scope.contract.areas.areas);
      for (var i = 0; i < $scope.arr.length; i++) {
        var gx = $scope.arr[i].row
        var gy = $scope.arr[i].col
        state[gy][gx] = true;
        fill('white', gx, gy);
      }

      if ($scope.contract.occupancy.length > 0) {
        $scope.contractarray = $scope.contract.occupancy
        if (typeof $scope.contractarray == 'string') {
          $scope.contractarray = JSON.parse($scope.contractarray)
        }
      }
      console.log($scope.contractarray);
      for (var i = 0; i < $scope.contractarray.length; i++) {
        var gx = $scope.contractarray[i].row
        var gy = $scope.contractarray[i].col
        state[gy][gx] = true;
        fill($scope.contractColour, gx, gy);
      }
      for (var i = 0; i < $scope.checkinArray.length; i++) {
        $scope.selectedCheckinColour = $scope.getRandomColor();
        $scope.selectedCheckinArea.push({
          color: $scope.selectedCheckinColour,
          name: $scope.checkinArray[i].description
        })
        for (var j = 0; j < $scope.checkinArray[i].place.length; j++) {
          var gx = $scope.checkinArray[i].place[j].row
          var gy = $scope.checkinArray[i].place[j].col
          state[gy][gx] = true;
          fill($scope.selectedCheckinColour, gx, gy);
          // console.log(gx,gy,'values');
        }
        console.log($scope.selectedCheckinColour);

      }

      // if ($scope.selectingAreas.length > 0) {
      //   $scope.selectedContractColour = $scope.selectingColour;
      //   $scope.selectedCompaniesArea.push({
      //     color: $scope.selectedContractColour,
      //     company: $scope.contract.company.name
      //   })
      //   for (var i = 0; i < $scope.selectingAreas.length; i++) {
      //     var gx = $scope.selectingAreas[i].row
      //     var gy = $scope.selectingAreas[i].col
      //     state[gy][gx] = true;
      //     fill($scope.selectedContractColour, gx, gy);
      //     // console.log(gx,gy,'values');
      //   }
      // }


    function handleClick(e) {
      console.log('333');
      $scope.clicked = true;
      // get mouse click position
      e.preventDefault()
      var mx = e.offsetX;
      var my = e.offsetY;
      // calculate grid square numbers
      var gx = ~~(mx / boxSize);
      var gy = ~~(my / boxSize);
      // console.log(gx,gy);
      // make sure we're in bounds
      if (gx < 0 || gx >= w || gy < 0 || gy >= h) {
        return;
      }
      state[gy][gx] = true;
      for (var i = 0; i < $scope.contractarray.length; i++) {
        if ($scope.contractarray[i].row == gx && $scope.contractarray[i].col == gy) {
          console.log('data', gx, gy);
          for (var j = 0; j < $scope.checkinArray.length; j++) {
            for (var k = 0; k < $scope.checkinArray[j].place.length; k++) {
              if ($scope.checkinArray[j].place[k].row == gx && $scope.checkinArray[j].place[k].col == gy) {
                console.log('arrays there');
                return
              }
            }

          }
          console.log('0000000000000');
          for (var j = 0; j < $scope.selectingAreas.length; j++) {
            console.log('aaaaaaaaaaaaaaaaaaaaa');
            if ($scope.selectingAreas[j].row == gx && $scope.selectingAreas[j].col == gy) {
              console.log('selecting');
              $scope.selectingAreas.splice(j, 1);
              fill($scope.contractColour, gx, gy);
              $scope.canvasData = canvas;
              $scope.dataURL = $scope.canvasData.toDataURL();
              return
            }
          }
          console.log('not there');
          state[gy][gx] = true;
          fill($scope.selectingColour, gx, gy);
          $scope.selectingAreas.push({
            row: gx,
            col: gy
          });
          $scope.canvasData = canvas;
          $scope.dataURL = $scope.canvasData.toDataURL();

        }

      }
      $scope.canvasData = canvas;
      $scope.dataURL = $scope.canvasData.toDataURL();

    }

  }

  $scope.contract = $scope.$parent.$parent.$parent.contract;
  $scope.contractId = $scope.contract.pk;


  // $http.get('/api/warehouse/checkin/?contract=' + $scope.contractId).
  // then(function(response) {
  //   $scope.checkinData = response.data;
  //   console.log('!!!!!!!!!!!!!!!!!!!', $scope.checkinData);
  // })

  console.log('^^^^^^^^^^^6', $scope.contract);
  $scope.resetForm = function() {
    $scope.checkin = {
      'contract': '',
      'description': '',
      'height': 0,
      'width': 0,
      'length': 0,
      'weight': 0,
      'qty': 0,
      'place':'',
      'awb':''
    }

  }

  $scope.canvasFun = function(){
    $http.get('/api/warehouse/checkin/?contract=' + $scope.contractId).
    then(function(response) {
      $scope.checkinData = response.data;
      console.log('!!!!!!!!!!!!!!!!!!!', $scope.checkinData);
    })

    $timeout(function() {
      $scope.initializeCanvas();
    }, 1000)
  }

  $scope.resetForm();
  $scope.canvasFun();

  $scope.save = function() {
    var f = $scope.checkin;
    // var toSend = {
    //   contract: $scope.contract.pk,
    //   description: f.description,
    //   height: f.height,
    //   width: f.width,
    //   length: f.length,
    //   weight: f.weight,
    //   qty: f.qty
    //
    // }
    var toSend = new FormData();
    toSend.append('contract', $scope.contract.pk);
    toSend.append('description', f.description);
    toSend.append('height', f.height);
    toSend.append('width', f.width);
    toSend.append('length', f.length);
    toSend.append('weight', f.weight);
    toSend.append('qty', f.qty);

    if ($scope.selectingAreas.length > 0) {
      toSend.append('place', JSON.stringify($scope.selectingAreas))
    }
    if (f.awb != emptyFile && f.awb != null) {
      toSend.append('awb', f.awb)
    }

    var url = '/api/warehouse/checkin/';
    var method = 'POST';

    $http({
      method: method,
      url: url,
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.resetForm();
      $scope.canvasFun();
      Flash.create('success', 'Saved');
    })
  }


});
