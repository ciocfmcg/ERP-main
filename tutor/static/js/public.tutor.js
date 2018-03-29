var app = angular.module('myApp', []);
app.controller('myCtrl1', function($scope, $rootScope, $timeout, $interval) {


  $scope.tutorText = ''
  $scope.TutorMsg = [];
  $scope.StudMsg = [];
  $scope.messages = [];
  $scope.StudentName = 'Vikas Motla';
  $scope.StudId = '22134';
  $scope.AverageRating = 5;
  $scope.OldTime = 0;

  $scope.data = {
    "objects": []
  };

  $scope.dataVariables = {
    isActive: true,
    NewMsg: 0,
    isConnected:false,
    OnlineStatus:false,
    sendData:false
  };

  $scope.HeightCount = 0;

  // $scope.roomID = window.location.href.split('?id=')[1];
  $scope.roomID = '123';


  window.onfocus = function() {
    $scope.dataVariables.isActive = true;
    $scope.dataVariables.NewMsg = 0;
    document.title = "24tutors.com";
  };

  window.onblur = function() {
    $scope.dataVariables.isActive = false;
  };

  $interval(function() {
    if (!$scope.dataVariables.isActive) {
      console.log($scope.dataVariables.NewMsg);
      if ($scope.dataVariables.NewMsg >= 1) {
        console.log('new message..');
        document.title = $scope.dataVariables.NewMsg + ' New Message';
      }
    }
  }, 1000)



  $scope.handleRemoteContent = function(args) {
    console.log('hhhhhhh', args[0]);
    if (args[0] == 'chatStudent') {
      console.log(args[1]);
        $scope.MessageCame(args[1]);
    } else if (args[0] == 'online') {
      // $scope.disconnectModalOpen = true;
      $scope.IsOnline(args[1]);
      console.log('fffffffffffffffdddddddddddd', args[1]);
    }
    else {
      $scope.data['objects'].push(args[0]);
      $scope.dataVariables.sendData = false;
      $scope.redraw();

    }

  }


  $scope.connection = new autobahn.Connection({
    url: 'ws://cioc.in:8080/ws',
    realm: 'default'
  });

  $scope.connection.onopen = function(session) {
    $scope.dataVariables.isConnected = true;

    console.log("Connected")

    $scope.connection.session.subscribe($scope.roomID, $scope.handleRemoteContent).then(
      function(sub) {
        console.log("subscribed..", $scope.roomID);
      },
      function(err) {
        console.log("failed to subscribed: " + err);
      }
    );

  }

  $scope.IsOnline = function(NewHeartBeatTime) {
    $scope.OldTime = NewHeartBeatTime;
  }

  $interval(function() {
    $scope.NewTime = new Date().getTime();
    if (($scope.NewTime - $scope.OldTime) <= 6000) {
        $scope.dataVariables.OnlineStatus = true;
    } else {
        $scope.dataVariables.OnlineStatus = false;
    }
  }, 10000);



  $interval(function() {
    $scope.connection.session.publish($scope.roomID, ['online', new Date().getTime()], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Heart Beat sent...");
    });
  }, 5000);



  $scope.MessageCame = function(msgStud) {
    $scope.dataVariables.NewMsg++;
    console.log('message came from student', msgStud);
    $scope.StudMsg.push(msgStud);
    $scope.messages.push({
      'sendByMe': false,
      'message': msgStud
    });
    console.log($scope.StudMsg);
  }

  $scope.sendData = function() {
    $scope.lastItem = $scope.data['objects'].slice(-1)[0];
    // console.log('lasttt', $scope.lastItem);
    $scope.connection.session.publish($scope.roomID, [$scope.lastItem], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
  }

  $scope.sendDimensions = function() {
    console.log($scope.HeightCount);
    $scope.connection.session.publish($scope.roomID, ['increaseHeight', $scope.HeightCount], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
  }

  $scope.EnterTutorMsg = function() {
    console.log('ff', $scope.tutorText);
    $scope.TutorMsg.push($scope.tutorText);
    $scope.messages.push({
      'sendByMe': true,
      'message': $scope.tutorText
    });
    console.log($scope.TutorMsg);
    $scope.connection.session.publish($scope.roomID, ['chatTeacher', $scope.tutorText], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
    $scope.tutorText = '';
  }


  $scope.connection.open();

  $scope.canvas = new fabric.Canvas('tutorCanvas', {
    selection: false
  });


  var canvash = document.getElementById("canvasContainer").clientHeight;
  var canvasw = document.getElementById("canvasContainer").clientWidth;
  // console.log(canvasw);
  // $scope.canvas.setHeight('80%');
  // console.log('ssssssss',$scope.canvas._offset.height);
  $scope.canvas.setHeight(canvash);
  $scope.canvas.setWidth(canvasw);

  $rootScope.rectangles = [];
  $rootScope.circles = [];
  $rootScope.triangles = [];
  $scope.textData;
  $scope.data = {
    "objects": []
  };


  $scope.isEraser = false;
  $scope.size = 1;
  $scope.EraserSize = 1;
  $scope.col = 'black';
  $scope.mode = null;

  $scope.startx;
  $scope.starty;
  $scope.endx;
  $scope.endy;
  $scope.canvas.isDrawingMode = true;

  $scope.sendImage = true;

  fabric.Object.prototype.selectable = false;

  $scope.increasecanvas = function() {
    $scope.HeightCount = $scope.canvas.height + 150;
    console.log($scope.canvas.height);
    $scope.canvas.setHeight($scope.HeightCount);
    $scope.sendDimensions();
  }

  $scope.SetPen = function() {
    $scope.canvas.isDrawingMode = true;
    $scope.canvas.freeDrawingBrush.color = $scope.col;
    $scope.canvas.freeDrawingBrush.width = $scope.size;
  }


  $scope.SetEraser = function() {
    $scope.mode = "eraser";
    $scope.isShape = false;
    $scope.canvas.isDrawingMode = true;
    $scope.canvas.freeDrawingBrush.width = $scope.EraserSize;
    $scope.canvas.freeDrawingBrush.color = '#ffffff';
    console.log('in eraser..........');
  }

  // $scope.Move = function()
  //  {
  //    fabric.Object.prototype.selectable = true;
  //    $scope.canvas.isDrawingMode = false;
  //    $scope.canvas.selection = true;
  //    $scope.mode = null;
  //  }

  $scope.ClearAll = function() {
    $scope.canvas.isDrawingMode = false;
    $scope.canvas.clear();
    $rootScope.rectangles = [];
    $rootScope.circles = [];
    $rootScope.triangles = [];
    $scope.data = {
      "objects": []
    };
    $scope.sendData();
  }

  $scope.addFile = function() {
    console.log("will add file");
    $('#filePicker').click();
  }



  document.getElementById('filePicker').onchange = function(e) {
    $scope.mode = 'image';
    var reader = new FileReader();
    reader.onload = function(event) {
      var imgObj = new Image();
      imgObj.src = event.target.result;
      // console.log(imgObj.src);
      $scope.addImage(imgObj.src);
    }
    reader.readAsDataURL(e.target.files[0]);
    $scope.canvas.isDrawingMode = false;
  }






  $scope.canvas.on('path:created', function(options) {
    //console.log(options.path.path);
    $scope.temp = {
      timestamp: new Date().getTime(),
      type: options.path.type,
      originX: options.path.originX,
      originY: options.path.originY,
      left: options.path.left,
      top: options.path.top,
      fill: options.path.fill,
      strokeLineCap: options.path.strokeLineCap,
      stroke: options.path.stroke,
      strokeWidth: options.path.strokeWidth,
      pathOffset: options.path.pathOffset,
      path: options.path.path,
      lockMovementX: true,
      lockMovementY: true,
      hasControls: false,
      hasBorders: false,
      selectable: false,
      hoverCursor: 'default',
      objectCaching: false
    };

    //push path into $scope.data
    $scope.data['objects'].push($scope.temp);
    //console.log(options.path);
    // $scope.data['objects'].push(options.path);
  });

  $scope.addImage = function(url) {
    $scope.dataVariables.sendData =true;
    $scope.mode = 'image';
    console.log($scope.mode);
    fabric.Image.fromURL(url, function(Img) {
      Img.scaleToWidth(200);
      Img.scaleToHeight(200);
      // Img.set({hoverCursor: 'grab'});
      $scope.canvas.clear();
      $scope.temp = {
        timestamp: new Date().getTime(),
        type: Img.type,
        originX: Img.originX,
        originY: Img.originY,
        left: Img.left,
        top: Img.top,
        width: Img.width,
        height: Img.height,
        strokeLineCap: Img.strokeLineCap,
        strokeLineJoin: Img.strokeLineJoin,
        strokeMiterLimit: Img.strokeMiterLimit,
        scaleX: Img.scaleX,
        scaleY: Img.scaleY,
        opacity: Img.opacity,
        shadow: Img.shadow,
        visible: Img.visible,
        src: url,
        selectable: true,
        hoverCursor: 'move'
      }
      $scope.data['objects'].push($scope.temp);
      $scope.redraw();
    });
  }


  window.addEventListener("paste", function(e) {
    var clipboardData, url;
    e.stopPropagation();
    e.preventDefault();

    var cbData = e.clipboardData;

    for (var i = 0; i < cbData.items.length; i++) {
      // get the clipboard item
      var cbDataItem = cbData.items[i];
      var type = cbDataItem.type;
      // warning: most browsers don't support image data type
      if (type.indexOf("image") != -1) {
        // grab the imageData (as a blob)
        var imageData = cbDataItem.getAsFile();
        // format the imageData into a URL
        var imageURL = window.URL.createObjectURL(imageData);
        // the imageURL can be used as src for creating fabric image
        $scope.addImage(imageURL)
      }
      // if (type.indexOf("text")!=-1)
      //  {
      //     clipboardData = e.clipboardData || window.clipboardData;
      //     textData = clipboardData.getData('Text');
      //     console.log(textData);
      //     $scope.text = new fabric.Text(textData,
      //        { left: 0,
      //          top: 0,
      //          fontWeight: 'normal',
      //          fontFamily: 'Times New Roman',
      //          fontSize: 20});
      //          $scope.data['objects'].push($scope.text);
      //          redraw();
      //   }
    }
    $scope.canvas.isDrawingMode = false;
  });

  $scope.canvas.on('object:moving', function(options) {
    if (options.target.type == "image") {
      for (var i = 0; i < $scope.data.objects.length; i++) {
        if ($scope.data.objects[i].timestamp == options.target.timestamp) {
          $scope.data.objects[i].top = options.target.top;
          $scope.data.objects[i].left = options.target.left;
        }
      }
      $scope.sendImage = false;
    } else {
      console.log("ffffffffffff");
    }
  })

  // $scope.canvas.on('selection:cleared', function()
  //   {
  //      $scope.canvas.off('object:moving');
  //    });

  $scope.canvas.on('mouse:down', function(options) {
    $scope.dataVariables.sendData = true;
    $scope.sendImage = true;
    $scope.pointer = $scope.canvas.getPointer(options.e);
    $scope.startx = $scope.pointer.x;
    $scope.starty = $scope.pointer.y;

    console.log($scope.mode);

    if ($scope.mode == "image") {
      if (!options.target) {
        //  $scope.canvas.off('object:moving');
        for (var i = 0; i < $scope.data.objects.length; i++) {
          if ($scope.data.objects[i].type == "image") {
            $scope.data.objects[i].selectable = false;
            $scope.data.objects[i].hoverCursor = 'default';
          }
        }
      }
    } else if ($scope.mode == "text") {
      $scope.newText = new fabric.IText('', {
        fontWeight: 'normal',
        fontFamily: 'Times New Roman',
        fontSize: 20,
        objectCaching: false
      });
      $scope.canvas.add($scope.newText);
      $scope.canvas.centerObject($scope.newText);
      $scope.newText.set({
        left: $scope.startx,
        top: $scope.starty
      });
      $scope.canvas.setActiveObject($scope.newText);
      $scope.newText.enterEditing();
      $scope.newText.selectAll();
    }

  });

  $scope.canvas.on('mouse:move', function(options) {
    $scope.pointer = $scope.canvas.getPointer(options.e);
    $scope.endx = $scope.pointer.x;
    $scope.endy = $scope.pointer.y;
  });

  $scope.canvas.on('mouse:up', function() {

    if ($scope.mode == "text") {
      $scope.canvas.on('text:editing:exited', function(e) {
        console.log("text:" + e.target.text);

        $scope.temp = {
          timestamp: new Date().getTime(),
          type: $scope.newText.type,
          originX: $scope.newText.originX,
          originY: $scope.newText.originY,
          left: $scope.newText.left,
          top: $scope.newText.top,
          fill: $scope.newText.fill,
          strokeWidth: $scope.newText.strokeWidth,
          scaleX: $scope.newText.scaleX,
          scaleY: $scope.newText.scaleY,
          opacity: $scope.newText.opacity,
          visible: $scope.newText.visible,
          text: e.target.text,
          fontSize: $scope.newText.fontSize,
          fontWeight: $scope.newText.fontWeight,
          fontFamily: $scope.newText.fontFamily,
          fontStyle: $scope.newText.fontStyle,
          lineHeight: $scope.newText.lineHeight,
          textDecoration: $scope.newText.textDecoration,
          textAlign: $scope.newText.textAlign,
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          hasBorders: false,
          selectable: false,
          hoverCursor: 'default'
        }
        //$scope.canvas.clear();
        // $scope.data['objects'].push($scope.newText);
        $scope.data['objects'].push($scope.temp);
        $scope.redraw();
        $scope.canvas.off('text:editing:exited');
      });

      //redraw();

      fabric.Object.prototype.selectable = true;
      $scope.canvas.isDrawingMode = false;
      $scope.canvas.selection = true;
      return false;
    }

    if ($scope.endy - $scope.starty < 0) {
      // if drag towards top
      var tempy = $scope.starty;
      $scope.starty = $scope.endy;
      $scope.endy = tempy;
    }

    if ($scope.endx - $scope.startx < 0) {
      //  if drag towards left
      var tempx = $scope.startx;
      $scope.startx = $scope.endx;
      $scope.endx = tempx;
    }

    if ($scope.mode == "rect") {
      $scope.temp = {
        timestamp: new Date().getTime(),
        type: $scope.mode,
        left: $scope.startx,
        top: $scope.starty,
        width: $scope.endx - $scope.startx,
        height: $scope.endy - $scope.starty,
        fill: '',
        stroke: $scope.col,
        strokeWidth: 1,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        hoverCursor: 'default'
      };
      $scope.data['objects'].push($scope.temp);
    } else if ($scope.mode == "circle") {
      $scope.temp = {
        type: $scope.mode,
        left: $scope.startx,
        top: $scope.starty,
        radius: ($scope.endx - $scope.startx) / 2,
        fill: '',
        stroke: $scope.col,
        strokeWidth: 1,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        hoverCursor: 'default'
      };
      $scope.data['objects'].push($scope.temp);
    } else if ($scope.mode == "triangle") {
      $scope.temp = {
        type: $scope.mode,
        left: $scope.startx,
        top: $scope.starty,
        originX: 'left',
        originY: 'top',
        width: $scope.endx - $scope.startx,
        height: $scope.endy - $scope.starty,
        fill: '',
        stroke: $scope.col,
        strokeWidth: 1,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        selectable: false,
        hoverCursor: 'default'
      };
      $scope.data['objects'].push($scope.temp);
    }

    $scope.redraw();

  });

  $scope.redraw = function() {
    $rootScope.dataString = JSON.stringify($scope.data);
    console.log("In redraw");
    $scope.canvas.clear();
    //console.log("clear and load data");
    $scope.canvas.loadFromJSON($scope.dataString, $scope.canvas.renderAll.bind($scope.canvas));
    $scope.dataImage = $scope.canvas.toDataURL();
    // console.log($scope.dataImage);
    console.log('length:', $scope.dataImage.length);
    //console.log($scope.dataString);

    // $scope.canvas.item($scope.canvas.size()-1).excludeFromExport = true;


    if ($scope.dataVariables.isConnected) {
      if ($scope.mode=='image') {
        return;
      }
      if ($scope.dataVariables.sendData) {
        $scope.sendData();
      }

    }


  }

});





// app.controller('myCtrl2', function($scope , $rootScope){
//     $scope.can = new fabric.Canvas('canvas2', { selection: false });
//
//     $scope.copy = function ()
//    {
//      $scope.can.loadFromJSON($rootScope.dataString);
//    //  console.log($scope.dataString);
//    }
// });
