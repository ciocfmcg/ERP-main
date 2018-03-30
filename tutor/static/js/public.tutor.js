var app = angular.module('myApp', ['ui.bootstrap']);

app.config(function($httpProvider) {

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});


var emptyFile = new File([""], "");

app.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);

app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
});


app.controller('myCtrl1', function($scope, $rootScope, $timeout, $interval, $uibModal, $http) {

  $scope.attachMessageFile = function() {
    $('#messageFile').click()
  }

  $scope.messageFile = emptyFile;

  $scope.$watch('messageFile' , function(newValue , oldValue) {
    console.log(newValue);
    if(newValue != emptyFile){

      var fd = new FormData();
      fd.append('session' , $scope.roomID );
      fd.append('sender' , $scope.pk );
      fd.append('attachment' , $scope.messageFile );

      $http({method : 'POST' , url : '/api/tutors/tutors24Message/' , data : fd, transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }}).
      then(function(response) {

        $scope.messages.push({
          'sendByMe': true,
          'message': response.data.attachment,
          'created': new Date()
        });

        $scope.connection.session.publish($scope.roomID, ['chatTeacher', new Date(), response.data.attachment], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published");
        });
      })
    };
  })


  $scope.dp = '/static/images/userIcon.png';

  $http({
    method: 'GET',
    url: '/api/HR/users/?mode=mySelf&format=json'
  }).
  then(function(response) {
    $scope.pk = response.data[0].pk;
    $scope.profile = response.data[0].profile;
    $scope.name = response.data[0].first_name + ' ' + response.data[0].last_name;
    if ($scope.profile.displayPicture != null) {
      $scope.dp = $scope.profile.displayPicture;
    }

    $http({method : 'PATCH' , url : '/api/tutors/tutors24Session/' + $scope.roomID + '/' , data : {tutor : response.data[0].pk}})

  })

  $scope.tutorText = ''
  $scope.tutorMsg = [];
  $scope.studMsg = [];
  $scope.messages = [];
  $scope.studentName = 'Vikas Motla';
  $scope.studId = '22134';
  $scope.averageRating = 5;
  $scope.oldTime = 0;

  $scope.data = {
    "objects": []
  };

  $scope.dataVariables = {
    isWindowActive: true,
    newMsg: 0,
    isConnected: false,
    onlineStatus: true,
    sendData: false,
    sendImage: false,
    disconnectModalOpen: false,
    sendHeight : true
  };

  $scope.heightCount = 0;
  $scope.endSessionTime = 0;

  $scope.roomID = window.location.href.split('?session=')[1];
  // $scope.roomID = '123';

  $scope.calculateTime = function() {
    $scope.timeMins = parseInt($scope.inSecs / 60);
    $scope.timeSecs = parseInt($scope.inSecs % 60);
    // console.log($scope.timeMins, $scope.timeSecs);
  }


  $http({
    method: 'GET',
    url: '/api/tutors/tutors24Session/' + $scope.roomID + '/'
  }).
  then(function(response) {
    console.log(response.data);



    $scope.sessionObj = response.data;
    var start = new Date($scope.sessionObj.start);
    var now = new Date();

    $scope.inSecs = (now.getTime() - start.getTime()) / 1000;

    $interval(function() {
      $scope.inSecs += 1;
      $scope.calculateTime();
    }, 1000)

    $http({
      method: 'GET',
      url: '/api/HR/userSearch/' + response.data.student + '/'
    }).
    then(function(response) {
      console.log('reeeeeeeees', response.data);
      $scope.student = response.data;
      if ($scope.student.profile.displayPicture == null) {
        $scope.student.profile.displayPicture = '/static/images/userIcon.png';
      }
    })
  })


  window.onfocus = function() {
    $scope.dataVariables.isWindowActive = true;
    $scope.dataVariables.newMsg = 0;
    document.title = "Tutor Home";
  };

  window.onblur = function() {
    $scope.dataVariables.isWindowActive = false;
  };

  $interval(function() {
    if (!$scope.dataVariables.isWindowActive) {
      console.log($scope.dataVariables.newMsg);
      if ($scope.dataVariables.newMsg >= 1) {
        console.log('new message..');
        document.title = $scope.dataVariables.newMsg + ' New Message';
      }
    }
  }, 1000)



  $scope.handleRemoteContent = function(args) {
    if (args[0] == 'chatStudent') {
      $scope.messageCame(args[1], args[2]);
    } else if (args[0] == 'online') {
      $scope.isOnline(args[1]);
    } else if (args[0] == 'sendAllData') {
      $scope.sendAllData();
    } else if (args[0] == 'increaseHeight') {
      // console.log('incresing canvas height');
      $scope.heightCount = args[1];
      $scope.dataVariables.sendHeight = false;
      $scope.increaseCanvas();
    } else if (args[0] == 'allData') {
      $scope.data = args[1];
      $scope.dataVariables.sendData = false;
      $scope.redraw();
    } else {
      $scope.data['objects'].push(args[0]);
      $scope.dataVariables.sendData = false;
      $scope.redraw();

    }

  }


  $scope.connection = new autobahn.Connection({
    url: 'wss://cioc.in:443/ws',
    realm: 'default'
  });

  $scope.connection.onopen = function(session) {
    $scope.dataVariables.isConnected = true;

    console.log("Connected")

    $scope.connection.session.subscribe($scope.roomID, $scope.handleRemoteContent).then(
      function(sub) {
        console.log("subscribed..", $scope.roomID);

        $scope.connection.session.publish($scope.roomID, ['sendAllData'], {}, {
          acknowledge: true
        }).
        then(function(publication) {
          console.log("Published");
        });


      },
      function(err) {
        console.log("failed to subscribed: " + err);
      }
    );

  }


  $scope.openpopup = function() {

    console.log('open poppppppp');
    // console.log($scope.dataVariables.IsEndSession);
    console.log('Ismodal open..', $scope.dataVariables.disconnectModalOpen);
    $scope.endSessionTime++;

    if ($scope.endSessionTime > 5) {
      $scope.dataVariables.IsEndSession = true;
      console.log('end this session....');
    }

    if ($scope.dataVariables.disconnectModalOpen) {
      return;
    }

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.public.tutor.disconnectModal.html',
      resolve: {
        data: function() {
          return $scope.dataVariables;
        }
      },
      backdrop: 'static',
      controller: function($scope, $rootScope, data, $timeout, $uibModalInstance) {
        $scope.dataVariables = data;

        $rootScope.$on('studentBackOnline', function(evt, data) {
          console.log('coming......');
          console.log(evt, data);
          $uibModalInstance.dismiss();
        });

        $scope.endSession = function() {
          $uibModalInstance.dismiss('end');
        }
      }

    }).result.then(function(succ) {
      console.log(succ);
    }, function(reason) {
      console.log(reason);
      if (reason == 'end') {
        $scope.showFeedbackForm();
      }
    });


    $scope.dataVariables.disconnectModalOpen = true;

  }

  $scope.showFeedbackForm = function() {
    $scope.feedBack = $uibModal.open({
      templateUrl: '/static/ngTemplates/app.public.tutor.feedback.html',
      resolve: {
        roomID: function() {
          return $scope.roomID;
        }
      },
      backdrop: 'static',
      controller: function($scope, roomID, $http) {

      }
    })
  }


  $scope.isOnline = function(newHeartBeatTime) {
    $scope.oldTime = newHeartBeatTime;
  }


  $interval(function() {
    $scope.newTime = new Date().getTime();
    if (($scope.newTime - $scope.oldTime) <= 6000) {
      $scope.dataVariables.onlineStatus = true;
      // $scope.endSessionTime = 0;
      if ($scope.dataVariables.disconnectModalOpen) {
        console.log('close modal.');

        // broadcast
        $rootScope.$broadcast('studentBackOnline', {});

        $scope.dataVariables.disconnectModalOpen = false;
      }

    } else {
      $scope.dataVariables.onlineStatus = false;
      // console.log($scope.OnlineStatus);
      $scope.openpopup();
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



  $scope.messageCame = function(timestamp, msgStud) {
    $scope.dataVariables.newMsg++;
    console.log('message came from student', msgStud);
    $scope.studMsg.push(msgStud);
    $scope.messages.push({
      'sendByMe': false,
      'message': msgStud,
      'created': timestamp
    });
    console.log($scope.studMsg);
  }

  $scope.enterTutorMsg = function() {
    console.log('ff', $scope.tutorText);
    $scope.tutorMsg.push($scope.tutorText);
    $scope.messages.push({
      'sendByMe': true,
      'message': $scope.tutorText,
      'created': new Date()
    });
    console.log($scope.tutorMsg);
    $scope.connection.session.publish($scope.roomID, ['chatTeacher', new Date(), $scope.tutorText], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });

    var toSend= {
      session : $scope.roomID,
      msg : $scope.tutorText,
      sender :$scope.pk,
    }
    $http({method : 'POST' , url : '/api/tutors/tutors24Message/' , data : toSend})

    $scope.tutorText = '';
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

  $scope.sendAllData = function() {
    $scope.connection.session.publish($scope.roomID, ['allData', $scope.data], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
  }

  $scope.sendDimensions = function() {
    console.log($scope.heightCount);
    $scope.connection.session.publish($scope.roomID, ['increaseHeight', $scope.heightCount], {}, {
      acknowledge: true
    }).
    then(function(publication) {
      console.log("Published");
    });
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


  fabric.Object.prototype.selectable = false;

  $scope.increaseCanvas = function() {
    console.log('increaseee....');
    $scope.heightCount = $scope.canvas.height + 150;
    console.log($scope.canvas.height);
    $scope.canvas.setHeight($scope.heightCount);
    if ($scope.dataVariables.sendHeight) {
      $scope.sendDimensions();
    }
  }

  $scope.setPen = function() {
    $scope.canvas.isDrawingMode = true;
    $scope.canvas.freeDrawingBrush.color = $scope.col;
    $scope.canvas.freeDrawingBrush.width = $scope.size;
  }


  $scope.setEraser = function() {
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
    $scope.mode = 'image';
    $scope.dataVariables.sendImage = false;
    $scope.dataVariables.sendData = true;
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
      $scope.dataVariables.sendImage = false;
      for (var i = 0; i < $scope.data.objects.length; i++) {
        if ($scope.data.objects[i].timestamp == options.target.timestamp) {
          $scope.data.objects[i].top = options.target.top;
          $scope.data.objects[i].left = options.target.left;
        }
      }
    } else {
      console.log("ffffffffffff");
    }
  })

  $scope.canvas.on('mouse:down', function(options) {
    $scope.dataVariables.sendImage = true;
    $scope.dataVariables.sendData = true;
    $scope.pointer = $scope.canvas.getPointer(options.e);
    $scope.startx = $scope.pointer.x;
    $scope.starty = $scope.pointer.y;



    console.log($scope.mode);


    if (!options.target) {
      //  $scope.canvas.off('object:moving');
      for (var i = 0; i < $scope.data.objects.length; i++) {
        if ($scope.data.objects[i].type == "image") {
          $scope.data.objects[i].selectable = false;
          $scope.data.objects[i].hoverCursor = 'default';
        }
      }
    }

    if ($scope.mode == "text") {
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

    if ($scope.dataVariables.isConnected) {
      if ($scope.dataVariables.sendData) {
        if (!$scope.dataVariables.sendImage) {
          console.log(' dont send imagre....');
          return;
        }
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
