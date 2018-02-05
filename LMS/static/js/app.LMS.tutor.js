app.config(function($stateProvider){
  $stateProvider.state('projectManagement.tutor', {
    url: "/tutor",
    templateUrl: '/static/ngTemplates/app.tutor.html',
    controller: 'projectMan    <!-- </div> -->agement.tutor'
  });
});


app.controller("projectManagement.tutor", function($scope, $state, $users, $stateParams, $http, Flash , $timeout) {

  $scope.me = $users.get('mySelf');
  $scope.editor = {pencil : false , eraser:false , eraserSize: 1, rect : false , dragging : false , rectStartX : undefined, rectStartY : undefined,rectEndX : undefined, rectEndY : undefined , eraserStartX : undefined, eraserStartY : undefined , eraserEndX : undefined, eraserEndY : undefined , color:'#000000'}
  $scope.canvas = new fabric.Canvas('canvas',{width:1280, height: 720});
  // console.log($scope.canvas);
  // $scope.canvas.setDimension({width: 1280, height: 720}, {backstoreOnly: true});
  fabric.Object.prototype.selectable = false;
  $scope.canvas.selection = true;
  $scope.canvas.isDrawingMode = false;
  $scope.fontName = 'Times New Roman';
  $scope.bookInView = -1;
  $scope.pageInView = -1;
  $scope.notebooks = [];
  var flag1 = true;
  var flag2 = true;
  var flag3 = true;
  var enterpressed = false;
  var enter;
////////////////bullet point



/////////////////////////////////

  $scope.$watch('fontName', function(newValue , oldValue) {
    console.log(newValue);
    if(flag1 == false){
      $scope.changefont(newValue);
    }
  });







  //var temp = false;
  $scope.$watch('bookInView' , function(newValue , oldValue){
    if (newValue != -1) {
      if ($scope.notebooks[newValue].pages.length == 0) {
        dataToSend =  {
          source : 'blank',
          parent : $scope.notebooks[newValue].pk,
          title : 'untitled',
          user : $scope.me.pk,
        }
        $http({ method : 'POST' , url : '/api/PIM/page/' , data : dataToSend }).
        then(function(response){
          $scope.pageInView = 0;
          $scope.data = response.data;
        })
      } else {
        $scope.pageInView = 0;
        $scope.getPage();
      }
    }
  });

  $http({ method : 'GET' , url : '/api/PIM/notebook/'}).
  then(function(response){
    $scope.notebooks = response.data;
    if (response.data.length != 0) {
      $scope.bookInView = 0;
    } else{
      dataToSend = {
        user : $scope.me.pk,
        title : 'untitled',
      }
      $http({ method : 'POST' , url : '/api/PIM/notebook/' , data : dataToSend }).
      then(function(response){
        $scope.notebooks.push(response.data);
        $scope.bookInView = 0;
      })
    }
  })

  $scope.getPage = function(){
    $http({ method : 'GET' , url : '/api/PIM/page/' +$scope.notebooks[$scope.bookInView].pages[$scope.pageInView] + '/'}).
    then(function(response){
      $scope.data = response.data;
      $scope.canvas.loadFromJSON($scope.data.source , $scope.canvas.renderAll.bind($scope.canvas) );
    })
  }



  $scope.changeNotebook = function(index){
    $scope.bookInView = index;
  }

  $scope.changePage = function(index){
    $scope.pageInView = index;
    $scope.getPage();
  }

  $scope.save = function(){
    dataToSend = {
      source : JSON.stringify($scope.canvas),
      parent : $scope.notebooks[$scope.bookInView].pk,
      title : $scope.data.title,
      user : $scope.me.pk,
    }
    $http({ method : 'PATCH' , url : '/api/PIM/page/' + $scope.data.pk + '/', data : dataToSend }).
    then(function(response){
      Flash.create('success' , response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    })
  }

  $scope.pencil = function(){
      $scope.canvas.isDrawingMode = !$scope.canvas.isDrawingMode;
      $scope.editor.pencil = !$scope.editor.pencil;
      $scope.canvas.freeDrawingBrush.width = 1;
      $scope.canvas.freeDrawingBrush.color = 'black';
      $scope.showTextOptions = false;
      $scope.showDeleteOption = false;
      $scope.canvas.renderAll();
  }

  $scope.clearAll = function(){
    $scope.canvas.clear().renderAll();
  }

  $scope.addText = function(e){
    // console.log("will add text");
    newText = new fabric.IText('', {
      fontFamily: 'arial black',
      left: e.layerX,
      top: e.layerY ,
      fontSize:14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'normal',
    });
    console.log(newText);
    // newText.onKeyPress = function(evt) {
    //   console.log(evt);
    //   if(evt.keyCode === 13){
    //     console.log("okok");
    //   }
    //   evt.target.value += evt.key;
    //   $scope.canvas.renderAll();
    // }
    $scope.canvas.add(newText);
    $scope.canvas.setActiveObject(newText);
    newText.enterEditing();
    newText.hiddenTextarea.focus();
  }


  $scope.peoples = [

 {messages : "hi"},
  {messages : "hi"},
  {messages : "hi"},
   {messages : "hi"},
   {messages : "hi"},
    {messages : "hi"},
   {messages : "hi"}

   ];
  // var canvasWrapper = document.getElementById('canvas');
  // canvasWrapper.addEventListener("keydown", enterpress, false);
  $scope.msgText = '';
   $scope.sendMessage = function() {
     $scope.peoples.push({messages : $scope.msgText})
     $scope.msgText = '';
   }

  $scope.canvas.on('object:selected',function(e){
    obj = e.target;
    console.log(obj);

    flag1 = false;
      if(obj.get('type') == "i-text"){
      $scope.showTextOptions = true;

    }
    else
      $scope.showTextOptions = false;
    $scope.showDeleteOption = true;
    $scope.canvas.renderAll();


  });
  $scope.canvas.on('selection:cleared',function(e){
    flag1 = true;
    $scope.showTextOptions = false;
    $scope.showDeleteOption = false;
    $scope.canvas.renderAll();
  });

  $scope.canvas.on('mouse:down', function(options) {

    if (!$scope.canvas.isDrawingMode && flag1==true && !$scope.editor.rect){
    //  console.log(options.e);

      $scope.addText(options.e);
      $scope.showTextOptions = true;
      $scope.showDeleteOption = true;
      $scope.canvas.renderAll();
    }else if ($scope.editor.rect) {
      if (options.target == undefined) {
        $scope.editor.rectStartX = options.e.x;
        $scope.editor.rectStartY = options.e.y;
        $scope.editor.dragging = true;
      }
    }
    $scope.canvas.renderAll();
  });


  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    $scope.canvas.setHeight(window.innerHeight*0.75);
    $scope.canvas.setWidth(window.innerWidth*0.88);
    $scope.canvas.renderAll();
  }

  // resize on init
  resizeCanvas();

  $scope.showTextOptions = false;
  $scope.showDeleteOption = false;
  $scope.canvas.on('object:moving', function (e) {
    var obj = e.target;

    console.log(obj);
     // if object is too big ignore
    if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
      return;
    }
    obj.setCoords();
    // top-left  corner
    if(obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0){
      obj.top = Math.max(obj.top, obj.top-obj.getBoundingRect().top);
      obj.left = Math.max(obj.left, obj.left-obj.getBoundingRect().left);

    }
    // bot-right corner
    if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width){
      obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top);
      obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left);
    }
    //temp = true;
  });

//add image new

document.getElementById('file').addEventListener("change", function (e) {
  $scope.canvas.isDrawingMode = !$scope.canvas.isDrawingMode;
    $scope.editor.pencil = !$scope.editor.pencil;
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (f) {
    var data = f.target.result;
    fabric.Image.fromURL(data, function (img) {
      var oImg = img.set({left: 0, top: 0, angle: 00,  selectable: true,width:200, height:200*(img.height/img.width)}).scale(0.9);
      $scope.canvas.add(oImg).renderAll();
      var a = $scope.canvas.setActiveObject(oImg);
      var dataURL = $scope.canvas.toDataURL({format: 'png', quality: 0.8});
    });
  };
  reader.readAsDataURL(file);
});




// document.getElementById("erase").onchange = function () {
// 	  $scope.canvas.isDrawingMode= this.checked ? "delete" : "add";
//   console.warn(isDrawingMode);
// };
//text options
$scope.bold = function() {
  if(obj.fontWeight != 'bold'){
      obj.fontWeight = 'bold';
      $scope.canvas.renderAll();

   }
   else {
     obj.fontWeight = 'normal';
     $scope.canvas.renderAll();
   }

 }
$scope.italic = function(){
    if(obj.fontStyle != 'italic'){
      obj.fontStyle = 'italic';
      $scope.canvas.renderAll();
    }
    else {
      obj.fontStyle = 'normal';
      $scope.canvas.renderAll();
    }
  }
  $scope.underline = function(){
    if(obj.textDecoration != 'underline'){
      obj.textDecoration = 'underline';
      $scope.canvas.renderAll();
    }
    else {
      obj.textDecoration = 'normal';
      $scope.canvas.renderAll();
    }
  }
  $scope.rightalign = function(){
    if(obj.textAlign == 'left'){
      obj.textAlign = 'right';
      $scope.canvas.renderAll();
    }
    else if (obj.textAlign == 'center') {
      obj.textAlign = 'right';
      $scope.canvas.renderAll();
    }
  }
  $scope.leftalign = function(){
    if(obj.textAlign == 'right'){
      obj.textAlign = 'left';
      $scope.canvas.renderAll();
    }
    else if (obj.textAlign == 'center') {
      obj.textAlign = 'left';
      $scope.canvas.renderAll();
    }
  }
  $scope.centeralign = function(){
    if(obj.textAlign == 'right'){
      obj.textAlign = 'center';
      $scope.canvas.renderAll();
    }
    else if (obj.textAlign == 'left') {
      obj.textAlign = 'center';
      $scope.canvas.renderAll();
    }
  }
  $scope.fontincrease = function(){
    obj.fontSize += 1;
    $scope.canvas.renderAll();
  }
  $scope.fontdecrease = function(){
    obj.fontSize -= 1;
    $scope.canvas.renderAll();
  }

//delete selection

$scope.delete = function() {
if($scope.canvas.getActiveGroup()){
    $scope.canvas.getActiveGroup().forEachObject(function(o){ $scope.canvas.remove(o) });
    $scope.canvas.discardActiveGroup().renderAll();
  } else {
    $scope.canvas.remove($scope.canvas.getActiveObject());
  }
}



//chage  fontFamily
$scope.changefont = function(newValue){
  obj.fontFamily = newValue;
  $scope.canvas.renderAll();
}


//display triangle
$scope.canvas.on({
   'mouse:move' : function(evnt) {
     $scope.editor.rectEndX = evnt.e.x;
     $scope.editor.rectEndY = evnt.e.y;
   }, 'mouse:up' : function(evnt) {
     if ($scope.editor.dragging) {
       if ($scope.editor.rectStartX != undefined && $scope.editor.rectEndX != undefined) {
         var rect=new fabric.Rect({
             left:$scope.editor.rectStartX,
             top:$scope.editor.rectStartY,
             width:$scope.editor.rectEndX - $scope.editor.rectStartX,
             height:$scope.editor.rectEndY - $scope.editor.rectStartY,
             selectable: true,

         });
         $scope.canvas.add(rect);
       }

       $scope.editor.rectStartX = undefined;
       $scope.editor.rectStartY = undefined;
       $scope.editor.rectEndX = undefined;
       $scope.editor.rectEndY = undefined;
     }
     $scope.editor.dragging = false;
   }
 })


document.getElementById('color').addEventListener("change", function (e) {

      $scope.canvas.freeDrawingBrush.color=this.value;

 });





// bullet points

// $scope.bullet = function(obj) {
//     var patt = /\n$/;
//
//     if(patt.test(obj.text)){
//       console.log("ok1");
//       obj.text = obj.text + "\n\u2022 ";
//       console.log(obj.text);
//       $scope.canvas.renderAll();
//     }
//
// }
//
// $scope.check = function() {
//   console.log("ok");
//         if (window.event.keyCode == 13) {
//             console.log("enter presses");
//         }
// }

//change eraser size
$scope.eraserSmall = function(){
  $scope.canvas.isDrawingMode = !$scope.canvas.isDrawingMode;
      $scope.canvas.freeDrawingBrush.width = 3;
      $scope.canvas.freeDrawingBrush.color = 'white';
        $scope.canvas.renderAll();

  }
  $scope.eraserMedium = function(){

    $scope.canvas.isDrawingMode = !$scope.canvas.isDrawingMode;
       $scope.canvas.freeDrawingBrush.width = 10;
        $scope.canvas.freeDrawingBrush.color = 'white';
          $scope.canvas.renderAll();
    }

    $scope.eraserLarge = function(){
      $scope.canvas.isDrawingMode = !$scope.canvas.isDrawingMode;
         $scope.canvas.freeDrawingBrush.width = 25;
          $scope.canvas.freeDrawingBrush.color = 'white';
            $scope.canvas.renderAll();

      }


//change text color
$scope.$watch('editor.color' , function(newVal) {
  $scope.canvas.getActiveObject().setFill(this.value);
  $scope.canvas.renderAll();

})


});
