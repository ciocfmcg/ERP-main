app.controller('businessManagement.ecommerce.configure.offerBanner', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.form = {
    image: emptyFile,
    imagePortrait: emptyFile
  };

  if (angular.isUndefined($scope.data.pk)) {
    $scope.mode = 'new';
    $scope.data = {
      title: '',
      subtitle: '',
      level: 1,
      state: '',
      params: ''
    };
    $scope.url = '/api/ecommerce/offerBanner/';
    $scope.method = 'POST';
  } else {
    $scope.mdoe = 'edit';
    $scope.url = '/api/ecommerce/offerBanner/' + $scope.data.pk + '/?mode=configure';
    $scope.method = 'PATCH';
  }

  $scope.submit = function() {
    var fd = new FormData();
    fd.append('title', $scope.data.title);
    fd.append('subtitle', $scope.data.subtitle);
    fd.append('level', $scope.data.level);
    fd.append('state', $scope.data.state);
    fd.append('params', $scope.data.params);
    if ($scope.mode == 'new') {
      if ($scope.form.image == emptyFile) {
        Flash.create('danger', 'No image selected');
        return;
      } else {
        fd.append('image', $scope.form.image);
        fd.append('imagePortrait', $scope.form.imagePortrait);
      }
    } else {
      fd.append('active', $scope.data.active);
      if ($scope.form.image != emptyFile) {
        fd.append('image', $scope.form.image);
      }

      if ($scope.form.imagePortrait != emptyFile) {
        fd.append('imagePortrait', $scope.form.imagePortrait);
      }
    }
    $http({
      method: $scope.method,
      url: $scope.url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      if ($scope.mode == 'new') {
        $scope.data = {
          title: '',
          subtitle: '',
          image: emptyFile,
          imagePortraitL: emptyFile,
          level: 1,
          state: '',
          params: ''
        };
      }
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }



});


app.controller('businessManagement.ecommerce.configure', function($scope, $uibModal, $http, $aside, $state, Flash, $users, $filter, $permissions , $rootScope) {



  $scope.data = {
    tableFieldData: [],
    tableproductData: [],
    tablePromocodeData: [],
  };

  var fieldViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.field.item.html',
  }, ];

  var productViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.product.item.html',
  }, ];

  var promocodeViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.vendor.configure.promocode.item.html',
  }, ];



  $scope.fieldConfig = {
    views: fieldViews,
    url: '/api/ecommerce/field/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }

  $scope.genericProductConfig = {
    views: productViews,
    url: '/api/ecommerce/genericProduct/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }

  $scope.promocodesConfig = {
    views: promocodeViews,
    url: '/api/ecommerce/promocode/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [12, 24, 48],
  }


  $scope.offerBannersConfig = {
    views: [{
      name: 'table',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/tableDefault.html'
    }, ],
    url: '/api/ecommerce/offerBanner/',
    deletable: true,
    searchField: 'name',
    canCreate: true,
    editorTemplate: '/static/ngTemplates/app.ecommerce.vendor.form.offerBanner.html',
  }


  $scope.editorTemplateField = '/static/ngTemplates/app.ecommerce.vendor.form.field.html';

  $scope.editorTemplateGenericProduct = '/static/ngTemplates/app.ecommerce.vendor.form.genericProduct.html';

  $scope.tableActionFields = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableFieldData);

    for (var i = 0; i < $scope.data.tableFieldData.length; i++) {
      if ($scope.data.tableFieldData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          console.log('editing');
          var title = 'Edit Field : '
          var appType = 'editField'
        } else {
          var title = 'Field Explore : '
          var appType = 'fieldExplore'
        }
        // i clicked this $scope.data.tableFieldData[i]
        $scope.addTab({
          title: title + $scope.data.tableFieldData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            field: $scope.data.tableFieldData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.tableProductAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableproductData);

    for (var i = 0; i < $scope.data.tableproductData.length; i++) {
      if ($scope.data.tableproductData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          console.log('editing');
          var title = 'Edit Product : '
          var appType = 'editproduct'
        } else {
          var title = 'Product Explore : '
          var appType = 'productExplore'
        }
        // i clicked this $scope.data.tableproductData[i]
        $scope.addTab({
          title: title + $scope.data.tableproductData[i].pk,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            field: $scope.data.tableproductData[i]
          },
          active: true
        })
      }
    }

  }

  $scope.tablePromocodeAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tablePromocodeData);

    for (var i = 0; i < $scope.data.tablePromocodeData.length; i++) {
      if ($scope.data.tablePromocodeData[i].pk == parseInt(target)) {
        if (action == 'editPromocode') {
          console.log('editPromocode');
          $rootScope.$broadcast('promoUpdate', {data:$scope.data.tablePromocodeData[i]});
        }
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





});

app.controller('businessManagement.ecommerce.configure.promocode.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions,$rootScope) {
  $scope.promoForm = {name:'',discount:1,validTimes:1,endDate:new Date()}
  $scope.mode = 'new'
  $scope.msg = 'Create'

  $scope.$on('promoUpdate', function(event, input) {
    console.log("recieved");
    console.log(input.data);
    $scope.msg = 'Update'
    $scope.promoForm = input.data
    $scope.mode = 'edit'

  });

  $scope.savePromocode = function(){
    console.log('7777777777777777777',$scope.promoForm);
    if ($scope.promoForm.name.length ==0 || $scope.promoForm.discount.length == 0 || $scope.promoForm.validTimes.length == 0) {
      Flash.create('warning', 'Please Fill All The Fields')
      return;
    }

    var method = 'POST'
    var url = '/api/ecommerce/promocode/'
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url = url + $scope.promoForm.pk + '/'
    }
    var f = $scope.promoForm
    dataToSend = {
      name : f.name,
      discount : f.discount,
      validTimes : f.validTimes,
      endDate : f.endDate
    }
    $http({method : method , url : url, data : dataToSend }).
    then(function(response) {
      Flash.create('success', $scope.msg + 'd');
      $rootScope.$broadcast('forceRefetch', {});
      $scope.promoForm = {name:'',discount:1,validTimes:1,endDate:new Date()}
    })

  }

})


app.controller('businessManagement.ecommerce.configure.form', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {

  $scope.me = $users.get('mySelf');
  $scope.curr = $scope.me.profile.currency;
  console.log($scope.me);
  if ($scope.curr == 'INR') {
    $scope.currSymbol = 'inr';
  } else if ($scope.curr == 'USD') {
    $scope.currSymbol = 'usd';
  } else if ($scope.curr == 'GBP') {
    $scope.currSymbol = 'gbp';
  } else if ($scope.curr == 'EUR') {
    $scope.currSymbol = 'eur';
  } else {
    $scope.currSymbol = 'aud';
  }

  $scope.resetForm = function() {
    $scope.form = {
      mode: 'field',
      fieldType: 'char',
      parent: '',
      name: '',
      choiceLabel: '',
      unit: '',
      helpText: '',
      default: '',
      fields: [],
      minCost: 0,
      visual: emptyFile
    }
    $scope.editing = false
  }

  $scope.resetForm();
  $scope.ChoiceValues = []

  if ($scope.tab == undefined) {
    $scope.mode = 'new';
    $scope.resetForm();
  } else {
    $scope.mode = 'edit';
    console.log('ssssssssssssssssss');
    console.log($scope.tab.data.field);
    $scope.form = $scope.tab.data.field;
    if ('fields' in $scope.tab.data.field) {
      $scope.form.mode = 'genericProduct'
    } else {

      $scope.form.mode = 'field'
    }
    if ($scope.form.fieldType == 'choice') {
      $scope.ChoiceValues = JSON.parse($scope.form.data)
    }
    console.log('ffffffffff', $scope.ChoiceValues);
    $scope.editing = true

  }


  $scope.getFieldsSuggestions = function(query) {
    console.log(query);
    return $http.get('/api/ecommerce/field/?name__contains=' + query)
  }

  $scope.parentSearch = function(query) {
    console.log(query);
    return $http.get('/api/ecommerce/genericProduct/?name__contains=' + query).
    then(function(response) {
      console.log('**********************', response);
      return response.data;
    })
  }

  // $scope.parentFields = []
  //
  //
  // $scope.$watch('form.parent' , function(newValue, oldValue){
  //   if (newValue != null && typeof newValue =='object') {
  //     if (newValue.data.fields) {
  //       for (var i = 0; i < newValue.data.fields.length; i++) {
  //         parentFields.push(newValue.data.fields[i].pk)
  //       }
  //     }
  //   }
  // }, true);


  $scope.addChoice = function() {
    console.log($scope.form.choiceLabel);
    $scope.ChoiceValues.push($scope.form.choiceLabel)
    $scope.form.choiceLabel = ''
    console.log($scope.ChoiceValues);
  }
  $scope.removeChoice = function(idx) {
    $scope.ChoiceValues.splice(idx, 1)
  }

  $scope.submit = function() {
    d = $scope.form;
    console.log(d);
    console.log($scope.editing);
    if (d.name == '' || d.name.length == 0) {
      Flash.create('warning', 'Name Should Not Be Blank')
      return;
    }
    if ($scope.form.mode == 'field') {
      dataToSend = {
        fieldType: d.fieldType,
        name: d.name,
        unit: d.unit,
        helpText: d.helpText,
        default: d.default,
        choiceLabel: d.choiceLabel
      };
      if (d.fieldType == 'choice') {
        if ($scope.ChoiceValues.length == 0) {
          Flash.create('warning', 'Please Add Some Choices')
          return;
        }
        dataToSend.data = JSON.stringify($scope.ChoiceValues);
      }

      url = '/api/ecommerce/field/';
      console.log(dataToSend);
    } else if ($scope.form.mode == 'genericProduct') {
      fs = [];
      console.log(d.fields);
      if (d.fields.length == 0) {
        Flash.create('warning', 'No fields selected')
        return;
      }
      for (var i = 0; i < d.fields.length; i++) {
        fs.push(d.fields[i].pk);
      }

      var fd = new FormData();
      fd.append('name', d.name);
      fd.append('fields', fs);
      fd.append('minCost', d.minCost);
      if (d.parent != null && d.parent.pk != undefined) {
        fd.append('parent', d.parent.pk);
      }
      if (d.visual != null && typeof d.visual != 'string') {
        fd.append('visual', d.visual);
      }

      url = '/api/ecommerce/genericProduct/';
      console.log(fd);
    }

    if ($scope.editing) {
      url += $scope.form.pk + '/';
      method = 'PATCH';
    } else {
      method = 'POST';
    }
    if ($scope.form.mode != 'genericProduct') {
      $http({
        method: method,
        url: url,
        data: dataToSend
      }).
      then(function(response) {
        if (!$scope.editing) {
          $scope.form = {
            mode: $scope.form.mode,
            fieldType: 'char',
            parent: '',
            name: '',
            choiceLabel: '',
            unit: '',
            helpText: '',
            default: '',
            fields: [],
            minCost: 0,
            visual: emptyFile
          };
        }
        Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      })

    } else {

      // because we need to use formdata for the genericProduct
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
        if (!$scope.editing) {
          $scope.form = {
            mode: $scope.form.mode,
            fieldType: 'char',
            parent: '',
            name: '',
            choiceLabel: '',
            unit: '',
            helpText: '',
            default: '',
            fields: [],
            minCost: 0,
            visual: emptyFile
          }
        }
        Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response) {
        Flash.create('danger', response.status + ' : ' + response.statusText);
      });
    }

  }

});
