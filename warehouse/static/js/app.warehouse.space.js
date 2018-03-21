app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.space', {
    url: "/space",
    templateUrl: '/static/ngTemplates/app.warehouse.space.html',
    controller: 'businessManagement.warehouse.space'
  });
});

app.controller('businessManagement.warehouse.space', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.space.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/warehouse/space/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Space : ';
          var appType = 'spaceEditor';
        } else if (action == 'details') {
          var title = 'Space Details : ';
          var appType = 'spaceExplorer';
        }

        $scope.addTab({
          title: title + $scope.data.tableData[i].code,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        })
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


  // $scope.$on('exploreContact', function(event, input) {
  //   console.log("recieved");
  //   console.log(input);
  //   $scope.addTab({
  //     "title": "Contact Details : " + input.contact.name,
  //     "cancel": true,
  //     "app": "contactExplorer",
  //     "data": {
  //       "pk": input.contact.pk
  //     },
  //     "active": true
  //   })
  // });
  //
  //
  // $scope.$on('editContact', function(event, input) {
  //   console.log("recieved");
  //   console.log(input);
  //   $scope.addTab({
  //     "title": "Contact Edit : " + input.contact.name,
  //     "cancel": true,
  //     "app": "contactEditor",
  //     "data": {
  //       "pk": input.contact.pk,
  //       contact : input.contact
  //     },
  //     "active": true
  //   })
  // });


});

app.controller("businessManagement.warehouse.space.form", function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $timeout) {
  $scope.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  // function getRandomColor() {
  //   var letters = '0123456789ABCDEF';
  //   var color = '#';
  //   for (var i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  //   console.log('clolourrrrrrrrrrrrrrrrrrrrrr',color);
  // }

  if ($scope.tab == undefined) {
    $scope.modeType = 'edit';
  }else{
    console.log($scope.tab);
    if ($scope.tab.app == 'spaceExplorer') {
      $scope.modeType='explore';
    }else{
      $scope.modeType = 'edit';
    }

  }

  console.log($scope.modeType);



  $scope.initializeCanvas = function() {

    var canvas = document.getElementById("canvas" + $scope.id + $scope.modeType ),
    c = canvas.getContext("2d");
    console.log(c);
    boxSize = 40;
    boxes = Math.floor(1200 / boxSize);
    $scope.arr = [];
    $scope.arrays=[ ];
    $scope.companiesArea = [ ];
    if ($scope.form.name.length>0) {
      console.log($scope.form.contractSpace.length);
      for (var i = 0; i < $scope.form.contractSpace.length; i++) {
        console.log('pushing');
        $scope.arrays.push({'array':[ ]})
      }

    }
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
      };

    }

    var state = new Array(h);
    for (var y = 0; y < h; ++y) {
      state[y] = new Array(w);
    }
    if ($scope.modeType == 'edit') {
      canvas.addEventListener('click', handleClick);
    }

    function fill(s, gx, gy) {
      c.fillStyle = s;
      c.fillRect(gx * boxSize, gy * boxSize, boxSize, boxSize);
    }
    if ($scope.mode == 'edit') {
      $scope.arr = JSON.parse($scope.form.areas)
      for (var i = 0; i < $scope.arr.length; i++) {
        var gx=$scope.arr[i].row
        var gy=$scope.arr[i].col
        state[gy][gx] = true;
        fill('white', gx , gy );
      }
      for (var i = 0; i < $scope.form.contractSpace.length; i++) {
        console.log('infoooooooo');
        console.log($scope.arrays[i]);
        console.log($scope.arrays[i].array.occupancy);
        $scope.arrays[i].array = $scope.form.contractSpace[i];
        if (typeof $scope.arrays[i].array.occupancy == 'string'){
          $scope.arrays[i].array.occupancy=JSON.parse($scope.arrays[i].array.occupancy)
        }
      }
      for (var i = 0; i < $scope.arrays.length; i++) {
        $scope.contractColour = $scope.getRandomColor();
        $scope.companiesArea.push({color: $scope.contractColour,company:$scope.arrays[i].array.company.name})
        for (var j = 0; j < $scope.arrays[i].array.occupancy.length; j++) {
          var gx=$scope.arrays[i].array.occupancy[j].row
          var gy=$scope.arrays[i].array.occupancy[j].col
          state[gy][gx] = true;
          fill($scope.contractColour, gx , gy );
          console.log(gx,gy,'values');
        }
        console.log($scope.contractColour);

      }
      console.log($scope.arrays);
      console.log($scope.companiesArea);
    }else {
      for (var i = 0; i < $scope.arr.length; i++) {
        var gx=$scope.arr[i].row
        var gy=$scope.arr[i].col
        state[gy][gx] = true;
        fill('white', gx , gy );
      }

    }

    function handleClick(e) {
      console.log('calling colour');
      $scope.getRandomColor();
      // get mouse click position
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
      for (var i = 0; i < $scope.arrays.length; i++) {
        console.log('inside');
        console.log($scope.arrays[i]);
        for (var j = 0; j < $scope.arrays[i].array.occupancy.length; j++) {
          if($scope.arrays[i].array.occupancy[j].row==gx && $scope.arrays[i].array.occupancy[j].col==gy){
            console.log('arrays there');
            return
          }
        }
      }
      for (var i = 0; i < $scope.arr.length; i++) {
        if($scope.arr[i].row==gx && $scope.arr[i].col==gy){
          console.log('there');
          $scope.arr.splice(i,1);
          console.log($scope.arr);
          fill('#87CEFA', gx, gy);
          return
        }
      }
      state[gy][gx] = true;
      fill('white', gx, gy);
      $scope.arr.push({
        row: gx,
        col: gy
      });
      // $scope.dataurl=canvas.toDataURL();
      // console.log($scope.dataurl);
      console.log($scope.arr);
    }

  }
  // $scope.form={'name':'sai','areas':'','code':''};
  $scope.resetForm = function() {
    $scope.mode = 'new';
    $scope.form = {'name':'','areas':'','code':''}
  }



  if (typeof $scope.tab != 'undefined' && $scope.tab.data.pk != -1) {
    $scope.mode = 'edit';
    $scope.form = $scope.data.tableData[$scope.tab.data.index];
  } else {
    $scope.resetForm();
  }


  if ($scope.mode == 'new') {
    $scope.id = '0';
  }else{
    $scope.id = $scope.form.pk;
  }

  // $scope.initializeCanvas();
  $timeout(function() {
    $scope.initializeCanvas();
  }, 1000)





  $scope.createCode = function() {
    $scope.form.code = '';
    $scope.splitdata=$scope.form.name.split(' ')
    for (i=0;i<$scope.splitdata.length;i++){
      $scope.form.code += $scope.splitdata[i][0];
    }
    return
  };
  $scope.createSpace = function() {
    if ($scope.form.name.length == 0) {
      Flash.create('warning', 'Name can not be empty!');
      return
    }
    // if ($scope.form.areas.length == 0) {
    //   Flash.create('warning', 'Please Select Some area');
    //   return
    // }
    if ($scope.form.code.length == 0) {
      Flash.create('warning', 'Code can not be empty!');
      return
    }
    var url = '/api/warehouse/space/';
    var method = 'POST';
    if ($scope.mode == 'edit') {
      url += $scope.form.pk + '/';
      method = 'PATCH';
    }
    console.log(method);
    var tosend = $scope.form;
    tosend.areas = JSON.stringify($scope.arr)
    console.log(JSON.parse(tosend.areas,'88888888888888888888'));

    console.log(tosend);
    $http({method: method,url: url,data: tosend}).
    then(function(response){
      if ($scope.mode == 'new') {
        $scope.form.pk = response.data.pk;
        $scope.resetForm();
        $scope.initializeCanvas();
        Flash.create('success', 'Created')
      }else {
        Flash.create('success', 'Saved')
      }
    })
  }


});

app.controller("businessManagement.warehouse.space.item", function($scope, $state, $users, $stateParams, $http, Flash) {


});
