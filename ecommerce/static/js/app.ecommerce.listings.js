app.controller('businessManagement.ecommerce.listings.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){
  $http({method : 'GET' , url : '/api/ecommerce/insight/?mode=operations&listing='+ $scope.data.pk }).
  then(function(response) {
    $scope.insight = response.data;
  })
});

app.directive('ecommerceListingEditor', function () {
  return {
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.form.listing.html',
    restrict: 'A',
    replace: true,
    scope: {
      configObj:'@',
    },
    controller : 'ecommerce.form.listing',
  };
});

app.controller('ecommerce.form.listing' , function($scope , $state , $stateParams , $http , Flash){
  $scope.data = {mode : 'select' , form : {} };
  $scope.config = JSON.parse($scope.configObj);
  console.log('rrrrrrrrrrrrr',$scope.config);

  if (angular.isDefined($scope.config.pk)) {
    $scope.id = $scope.config.pk;
    $scope.editorMode = 'edit';
    console.log('editinggggggggg');
  }else {
    console.log('newwwwwwwwwwww');
    $scope.editorMode = 'new';
    $scope.data.genericProduct = $scope.config.parent;
    for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
      if ($scope.data.genericProduct.fields[i].fieldType == 'choice') {
        $scope.data.genericProduct.fields[i].data = JSON.parse($scope.data.genericProduct.fields[i].data)
      }
    }
  }

  // $scope.choiceSearch = function(query , field) {
  //   return $http.get('/api/ecommerce/choiceOption/?name__contains=' + query + '&parent=' + field.parentLabel).
  //   then(function(response){
  //     return response.data;
  //   })
  // }

  $scope.removeMedia = function(index) {
    $http({method : 'DELETE' , url : '/api/ecommerce/media/' + $scope.data.form.files[index].pk + '/'}).
    then(function(response){
      $scope.data.form.files.splice(index,1);
    })
  }

  $scope.productSearch = function(val){
    console.log('ssssssssssss',val);
    return $http.get('/api/POS/product/?search=' + val +'&limit=10').
    then(function(response) {
      return response.data.results;
    })
  }
  $scope.buildForm = function(){
    $scope.data.mode = 'create'
    console.log('caaaaaaaa',$scope.data);
    console.log($scope.data.genericProduct.fields);
    fields = $scope.data.genericProduct.fields;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldType == 'boolean'){
        if (fields[i].default == 'true') {
          $scope.data.genericProduct.fields[i].value = true;
        } else {
          $scope.data.genericProduct.fields[i].value = false;
        }
      } else if (fields[i].fieldType == 'float') {
        $scope.data.genericProduct.fields[i].value = parseFloat(fields[i].default);
      } else if (fields[i].fieldType == 'date') {
        $scope.data.genericProduct.fields[i].value = new Date();
      }else if (fields[i].fieldType == 'char') {
        $scope.data.genericProduct.fields[i].value = fields[i].default;
      }else if (fields[i].fieldType == 'choice') {
        $scope.data.genericProduct.fields[i].value = fields[i].default;
      }
      // else if (fields[i].fieldType == 'choice') {
      //   $http({method : 'GET' , url : '/api/ecommerce/choiceLabel/?name=' + fields[i].unit}).
      //   then((function(i){
      //     return function(response){
      //       $scope.data.genericProduct.fields[i].parentLabel = response.data[0].pk;
      //     }
      //   })(i))
      // }
    }
  }



  $scope.resetForm = function(){
    $scope.data.form = {mediaType : '' , files : [] , file : emptyFile , url : '', source : '', product : ''
    }
  }

  $scope.resetForm()

  $scope.submitListing = function(){
    if ($scope.editorMode == 'edit') {
      post = {method : 'PATCH' , url : '/api/ecommerce/listing/' + $scope.id + '/'};
    }else {
      post = {method : 'POST' , url : '/api/ecommerce/listing/'};
    }
    form = $scope.data.form;
    console.log(form);
    dataToSend = {}
    // for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
    //   f = $scope.data.genericProduct.fields[i];
    //   dataToSend[f.name] = f.default;
    // }
    files = [];
    for (var i = 0; i < form.files.length; i++) {
      files.push(form.files[i].pk);
    }
    if (files.length != 0) {
      dataToSend.files = files;
    }
    // for (key in form) {
    //   if (key != 'files' && key !='file') {
    //     if (key == 'product') {
    //       dataToSend[key] = form[key].pk;
    //       continue;
    //     }else if (key == 'source') {
    //       dataToSend[key] = form[key]
    //     }
    //     dataToSend[key] = form[key];
    //   }
    // }
    dataToSend.product = form['product'].pk;
    dataToSend.source = form['source'];
    specs = [];
    for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
      f = $scope.data.genericProduct.fields[i];
      toPush = {};
      toPush['name'] = f.name;
      toPush['value'] = f.value;
      toPush['fieldType'] = f.fieldType;
      toPush['unit'] = f.unit;
      toPush['helpText'] = f.helpText;
      toPush['data'] = f.data;
      console.log(toPush);
      specs.push(toPush);
    }
    dataToSend.specifications = JSON.stringify(specs)
    dataToSend.parentType = $scope.data.genericProduct.pk;
    $http({method : post.method , url : post.url , data : dataToSend}).
    then(function(response){
      console.log('ressssssssssss');
      if ($scope.editorMode == 'new') {
        console.log('11111');
        $scope.buildForm();
        console.log('2222222');
        $scope.resetForm();
        console.log('3333333');
        // $scope.data.form.files = [];
        // $scope.data.form.file = emptyFile;
        // $scope.resetForm();
        // for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
        //   $scope.data.genericProduct.fields[i].default = '';
        // }
      }
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(err){
      Flash.create('danger', err.status + ' : ' + err.statusText);
    })


  }

  $scope.switchMediaMode = function(mode){
    $scope.data.form.mediaType = mode;

  }

  $scope.postMedia = function(){
    var fd = new FormData();
    fd.append( 'mediaType' , $scope.data.form.mediaType);
    fd.append( 'link' , $scope.data.form.url);

    if (['doc' , 'image' , 'video'].indexOf($scope.data.form.mediaType) != -1 && $scope.data.form.file != emptyFile) {
      fd.append( 'attachment' ,$scope.data.form.file);
    }else if ($scope.data.form.url == '') {
      Flash.create('danger' , 'No file to attach');
      return;
    }

    url = '/api/ecommerce/media/';

    $http({method : 'POST' , url : url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.data.form.files.push(response.data);
      $scope.data.form.file = emptyFile;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }

  if ($scope.editorMode == 'edit') {
    $http({method : 'GET' , url :'/api/ecommerce/listing/'+ $scope.id +'/'}).
    then(function (response) {
      for(key in response.data){
        $scope.data.form[key] = response.data[key];
      }
      $scope.data.specifications = JSON.parse(response.data.specifications)
      $http({method : 'GET' , url : '/api/ecommerce/genericProduct/' + response.data.parentType + '/'}).
      then(function(response){
        gp =  response.data;
        specs = $scope.data.specifications;
        for (var i = 0; i < gp.fields.length; i++) {
          for (var j = 0; j < specs.length; j++) {
            if (gp.fields[i].name == specs[j].name) {
              console.log(specs[j].name,specs[j].value);
              gp.fields[i].value = specs[j].value;
              gp.fields[i].data = specs[j].data;
            }
          }
        }

        $scope.data.genericProduct = gp;
      })
    })
  }else {
    $scope.buildForm()
  }


  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 640,
    toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  };

  $scope.$on('removeFiles', function(event, data) {
    console.log('broooooooooooooo',$scope.data,$scope.data.form.files.length);
    for (var i = 0; i < $scope.data.form.files.length; i++) {
      console.log(i);
      $http({method : 'DELETE' , url : '/api/ecommerce/media/' + $scope.data.form.files[i].pk + '/'}).
      then(function(response){
        console.log('deleted');
      })
    }
  })

});

app.controller('businessManagement.ecommerce.listings' , function($scope ,$rootScope, $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.getConfig = function(mode , data){
    toReturn = {};
    toReturn[mode] = data
    return JSON.stringify(toReturn)
  }
  $scope.data = {mode : 'select' , tableData : {} };

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.ecommerce.vendor.listings.item.html',
    },
    {name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
  ];

  $scope.config = {
    views : views,
    url : '/api/ecommerce/listingLite/',
    fields : ['pk','approved' ,  'parentType'],
    searchField: 'title',
    options : options,
    deletable : true,
    itemsNumPerView : [6,12,24],
  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);
    if (action=='edit') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Edit Listing : ' + $scope.data.tableData[i].pk , cancel : true , app : 'editListing' , data : {pk : target} , active : true})
        }
      }
    }
  }

  $scope.genericProductSearch = function(query) {
    return $http.get('/api/ecommerce/genericProduct/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.goBack = function(){
    $rootScope.$broadcast('removeFiles', {});
    // console.log($scope.data);
    $scope.data.mode = 'select';
    $scope.data.genericProduct = ''
  }

});
