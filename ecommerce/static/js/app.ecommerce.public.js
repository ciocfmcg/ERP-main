var app = angular.module('app' , ['ui.router', 'ui.bootstrap' ,'flash' ,'ngSanitize', 'ngAnimate', 'anim-in-out' ,'ui.bootstrap.datetimepicker' ,'rzModule']);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide, $locationProvider){

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);
  // $cookies.set("time" : new Date())

});

app.run([ '$rootScope', '$state', '$stateParams' , function ($rootScope,   $state,   $stateParams ) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
    $rootScope.$on("$stateChangeSuccess", function(params) {
      var statePrev
      now = new Date()
      console.log(' state change',params.targetScope.$state.params);
      console.log(' state url',params.targetScope.$state.current.url);


      // $cookies.set("time" : new Date())

    });
  }
]);

app.config(function($stateProvider ){

  $stateProvider
  .state('ecommerce', {
    url: "/",
    templateUrl: '/static/ngTemplates/app.ecommerce.list.html',
    controller: 'controller.ecommerce.list'
  })

  $stateProvider
  .state('details', {
    url: "/details/:id",
    templateUrl: '/static/ngTemplates/app.ecommerce.details.html',
    controller: 'controller.ecommerce.details'
  })

  $stateProvider
  .state('categories', {
    url: "/categories/:name",
    templateUrl: '/static/ngTemplates/app.ecommerce.categories.html',
    controller: 'controller.ecommerce.categories'
  })

  $stateProvider
  .state('checkout', {
    url: "/checkout/:pk",
    templateUrl: '/static/ngTemplates/app.ecommerce.checkout.html',
    controller: 'controller.ecommerce.checkout'
  })

  $stateProvider
  .state('account', {
    url: "/account",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.html',
       },
       "menu@account": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.menu.html',
        },
        "@account": {
          templateUrl: '/static/ngTemplates/app.ecommerce.account.default.html',
        }
    }
  })

  .state('account.cart', {
    url: "/cart",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.cart.html',
    controller: 'controller.ecommerce.account.cart'
  })
  .state('account.orders', {
    url: "/orders",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.orders.html',
    controller: 'controller.ecommerce.account.orders'
  })
  .state('account.settings', {
    url: "/settings",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.settings.html',
    controller: 'controller.ecommerce.account.settings'
  })
  .state('account.support', {
    url: "/support",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.support.html',
    controller: 'controller.ecommerce.account.support'
  })
  .state('account.saved', {
    url: "/saved",
    templateUrl: '/static/ngTemplates/app.ecommerce.account.saved.html',
    controller: 'controller.ecommerce.account.saved'
  })

});

app.controller('controller.ecommerce.details' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window){

  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime'
  console.log($scope.data);
  $scope.breadcrumbList = [];
  $scope.details = {};
  $window.scrollTo(0,0)
  $http({method : 'GET' , url : '/api/ecommerce/listingLite/'+ $state.params.id +'/'}).
  then(function(response){
    $scope.details = response.data
    $scope.details.specifications = JSON.parse($scope.details.specifications);
    var parent = response.data.parentType
      while (parent) {
        $scope.breadcrumbList.push(parent.name)
        parent = parent.parent
      }
  });

  $timeout(function () {
    $scope.breadcrumbList = $scope.breadcrumbList.slice().reverse();
  }, 1000);


  $scope.ratings = { meta : [5,4,3,2,1] , counts : [15,10,1,1,1] , averageRating : 4.5 };
  $scope.form = {rating : 0 , reviewText : '' , reviewHeading: '', reviewEditor : false , ratable : true}
  $scope.reviewsPage = 0;

  $scope.reviews = [{heading:'Quality',text:'Good in terms of quality' ,rating: 4 , user:1 , created: '12/4/12' , verified: true} ,
    {heading:'Quality',text:'Good in terms of quality' ,rating: 4 , user:1 , created: '12/4/12' , verified: true},
    {heading:'Quality',text:'Good in terms of quality' ,rating: 4 , user:1 , created: '12/4/12' , verified: false},
    {heading:'Quality',text:'Good in terms of quality' ,rating: 4 , user:1 , created: '12/4/12' , verified: true},
    {heading:'Quality',text:'Good in terms of quality' ,rating: 4 , user:1 , created: '12/4/12' , verified: false}];

  $scope.reviewsCount = 10;

  $scope.pictureInView = 0;

  $scope.changePicture = function(pic){
    $scope.pictureInView = pic;
  }



  $scope.addToCart = function(inputPk){
    dataToSend = {
      product : inputPk,
      user : getPK($scope.me.url),
      qty : 1,
      typ : 'cart',
    }
    console.log(dataToSend);
    console.log('in cart',$scope.inCart);


  for (var i = 0; i < $scope.inCart.length; i++) {
    if ($scope.inCart[i].product.pk==dataToSend.product) {
        Flash.create('warning' , 'This Product is already in cart');
        console.log('in cart',$scope.inCart);
        return
    }
  }
    $http({method : 'POST' , url : '/api/ecommerce/cart/' , data : dataToSend }).
    then(function(response){
      Flash.create('success', 'Product added in cart');
      $scope.inCart.push(response.data);
      console.log('in cart',$scope.inCart);
    })
  }

  $scope.buy = function(input){
    console.log(input);
    $state.go('checkout' , {pk : input.pk})
  }

  $scope.sendReview = function(mode) {
    if (mode == 'rating') {
      if ($scope.form.rating == 0 || !$scope.form.ratable) {
        return;
      }
    }else {
      if ($scope.form.reviewText == '' || $scope.form.reviewHeading == '') {
        Flash.create('danger' , 'No review to post.')
        return;
      }
      //post request
      $scope.form = {rating : 0 , reviewText : '' , reviewHeading: '', reviewEditor : false , ratable : true}
    }
  }

  $scope.nextReviews = function() {
    if ($scope.reviewsCount > ($scope.reviewsPage+1)*5) {
      $scope.reviewsPage += 1;
      $scope.fetchReviews();
    }
  }
  $scope.prevReviews = function() {
    if ($scope.reviewsPage > 0) {
      $scope.reviewsPage -= 1;
      $scope.fetchReviews();
    }
  }

  $scope.fetchReviews = function() {
    console.log('coming in fetchReviews');
    $scope.reviews = [{heading:'Reasonable Price',text:'This product is very cheap' ,rating: 4 , user:1 , created: '12/4/12' , verified: true} ,
  {heading:'Reasonable Price',text:'This product is very cheap' ,rating: 4 , user:1 , created: '12/4/12' , verified: true},
  {heading:'Reasonable Price',text:'This product is very cheap' ,rating: 4 , user:1 , created: '12/4/12' , verified: false},
  {heading:'Reasonable Price',text:'This product is very cheap' ,rating: 4 , user:1 , created: '12/4/12' , verified: false},
  {heading:'Reasonable Price',text:'This product is very cheap' ,rating: 4 , user:1 , created: '12/4/12' , verified: true}];
  }
  // $http({method : 'GET' , url : '/api/ecommerce/review/?listing=' + $scope.data.pk + '&limit=5&offset=' + $scope.reviewsPage * 5 }).
  // then(function(response) {
  //
  // });

});

app.controller('controller.ecommerce.categories' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window ){

  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime
  $window.scrollTo(0,0)
  console.log($state.params);
  $scope.minValue;
  $scope.maxValue


  $scope.slider = {
    minValue: 200,
    maxValue: 600,
    options: {
      floor: 0,
      ceil: 1000,
      step: 10,
      noSwitching: true,
      translate: function(value) {
        return '₹' + value;
      }
    }
  };

  // $scope.cities = [{name:'Bangalore',selected: false},{name:'mysore',selected: false},{name:'Delhi NCR',selected: false},{name:'Mumbai',selected: false},{name:'Chennai',selected: false}];
  // $scope.brands = [{name:'Dell',selected: false},{name:'hp',selected: false},{name:'Apple',selected: false}];

  $scope.breadcrumbList = [];
  $scope.category = {}
  $http({method : 'GET' , url : '/api/ecommerce/genericProduct/?name__iexact='+ $state.params.name}).
  then(function(response){
    console.log('category',response.data);
    $scope.category = response.data[0];
    var parent = response.data[0].parent
      while (parent) {
        $scope.breadcrumbList.push(parent.name)
        parent = parent.parent
      }

  });

  $scope.choices = {};

  $timeout(function () {
    for (var i = 0; i < $scope.category.fields.length; i++) {
      if ($scope.category.fields[i].data) {
        $scope.category.fields[i].data = JSON.parse($scope.category.fields[i].data)

      }
      if ($scope.category.fields[i].fieldType=='choice') {
        console.log($scope.category.fields[i].data);
        for (var j = 0; j < $scope.category.fields[i].data.length; j++) {
          // console.log($scope.category.fields[i].data[j]);
          $scope.category.fields[i].data[j] = {name:$scope.category.fields[i].data[j],selected:false}
          // $scope.category.fields[i].choices.push()
        }
      }
      $scope.category.fields[i].val = '';
    }

    $http({method : 'GET' , url : '/api/ecommerce/listing/?parent='+ $scope.category.pk + '&recursive=1' }).
       then(function(response){
         $scope.listingSearch = response.data;
       })
    $scope.breadcrumbList = $scope.breadcrumbList.slice().reverse();
  }, 1500);





  $scope.filter = function() {
    console.log('in filerrrrr');

    console.log($scope.choices);
    console.log($scope.category.fields);

    params = {minPrice: $scope.slider.minValue , maxPrice: $scope.slider.maxValue , fields : {}}

    for (var i = 0; i < $scope.category.fields.length; i++) {
      if ($scope.category.fields[i].fieldType == 'choice') {
        var arr = []
        for (var j = 0; j < $scope.category.fields[i].data.length; j++) {
          if ($scope.category.fields[i].data[j].selected) {
            arr.push($scope.category.fields[i].data[j].name)
          }
        }
        if (arr.length>0) {
          var a = $scope.category.fields[i].name
          // params.fields.push({a : arr})
          params.fields[a] = arr
        }
      }else {
        if ($scope.category.fields[i].val) {
          var a = $scope.category.fields[i].name
          // params.fields.push({a : $scope.category.fields[i].val})
          params.fields[a] = $scope.category.fields[i].val
        }
      }
    }

    console.log('paramsss',params);

    // var cities = []
    // for (var i = 0; i < $scope.cities.length; i++) {
    //   if ($scope.cities[i].selected==true) {
    //     cities.push($scope.cities[i].name)
    //   }
    // }
    //
    // if (cities.length>0) {
    //   params.city = cities
    // }
    //
    $http({method : 'GET' , url : '/api/ecommerce/listing/?parent='+ $scope.category.pk + '&recursive=1' , params:params }).
       then(function(response){
         $scope.listingSearch = response.data;
       })
  }


});



app.controller('controller.ecommerce.account' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){
// for the dashboard of the account tab
});

app.controller('controller.ecommerce.account.cart' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.cart.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/cart/',
    searchField: 'Name',
    getParams: [{key : 'user' , value : $scope.me.pk} , {key : 'typ' , value : 'cart'} ],
    deletable: true,
    itemsNumPerView: [8, 16, 32],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'deleteItem') {
          $http({method : 'DELETE' , url : '/api/ecommerce/cart/'+ $scope.data.tableData[i].pk + '/' }).
             then(function(response){
               Flash.create('success', 'Item removed from cart');
             })
          $scope.data.tableData.splice(i,1)
          $scope.calcTotal();
        }else if (action == 'addQty') {
          $scope.data.tableData[i].qty = $scope.data.tableData[i].qty + 1;
          console.log($scope.data.tableData);
          $http({method : 'PATCH' , url : '/api/ecommerce/cart/'+ $scope.data.tableData[i].pk + '/' , data : {qty: $scope.data.tableData[i].qty } }).
             then(function(response){
             })
          $scope.calcTotal();
        }else if (action == 'substractQty') {
          $scope.data.tableData[i].qty = $scope.data.tableData[i].qty - 1;
          console.log($scope.data.tableData);
          $http({method : 'PATCH' , url : '/api/ecommerce/cart/'+ $scope.data.tableData[i].pk + '/' , data : {qty: $scope.data.tableData[i].qty } }).
             then(function(response){
             })
          $scope.calcTotal();
        }else if (action == 'favourite'){
          $http({method : 'PATCH' , url : '/api/ecommerce/cart/'+ $scope.data.tableData[i].pk + '/' , data : {typ: 'favourite' } }).
             then(function(response){
             })
            $scope.data.tableData[i].typ = 'favourite';
          $scope.data.tableData.splice(i,1)
        }
        else if (action == 'unfavourite'){
          $http({method : 'PATCH' , url : '/api/ecommerce/cart/'+ $scope.data.tableData[i].pk + '/' , data : {typ: 'cart' } }).
             then(function(response){
             })
            $scope.data.tableData[i].typ = 'cart';
        }
      }
    }
  }

  $scope.calcTotal = function () {
    $scope.total = 0;
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      $scope.total = $scope.total + ($scope.data.tableData[i].product.product.price * $scope.data.tableData[i].qty)
    }
  }

  $timeout(function () {
    $scope.calcTotal();
    console.log('table data',$scope.data.tableData);
  }, 1000);

  $scope.checkout = function() {
    $state.go('checkout', {pk : 'cart'})
  }

  // $scope.$watch('data.tableData', function(newValue, oldValue) {
  //   console.log('watch',oldValue, newValue );
  // });

});

app.controller('controller.ecommerce.account.saved' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

  console.log('coming in save controller..');

  $scope.data = {
    tableData: [],
  };
  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ecommerce.account.saved.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ecommerce/cart/',
    searchField: 'Name',
    getParams: [{key : 'user' , value : $scope.me.pk} , {key : 'typ' , value : 'favourite'}],
    deletable: true,
    itemsNumPerView: [8, 16, 32],
  }

  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'unfavourite') {
          $http({method : 'PATCH' , url : '/api/ecommerce/cart/'+ $scope.data.tableData[i].pk + '/' , data : {typ: 'cart' } }).
             then(function(response){
             })
            $scope.data.tableData.splice(i,1)
        }
      }
    }

  }



});

app.controller('controller.ecommerce.account.saved.item' , function($scope , $http , $state){
  console.log("saved item loaded");
  console.log('saved',$scope.data);
})

app.controller('controller.ecommerce.account.cart.item' , function($scope , $http , $state){
  console.log("cart item loaded");

  console.log('cart',$scope.data);

  // $scope.data = $scope.$parent.$parent.data;
  // console.log($scope.data);
  // $http({method : 'GET' , url : '/api/ecommerce/listing/' + $scope.data.item + '/'}).
  // then(function(response){
  //   index = 0
  //   l = response.data;
  //   min = l.providerOptions[index].rate;
  //   for (var j = 1; j < l.providerOptions.length; j++) {
  //     if (l.providerOptions[j].rate < min) {
  //       min = l.providerOptions[j].rate;
  //       index = j;
  //     }
  //   }
  //   l.bestOffer = l.providerOptions[index];
  //   for(key in l){
  //     $scope.data[key] = l[key];
  //   }
  // })
  //
  // $scope.view = function(){
  //   $state.go('details' , {id : $scope.data.pk})
  // }
})

app.controller('controller.ecommerce.account.orders' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){
  $scope.views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  $scope.getParams = [{key : 'mode', value : 'consumer'}];

});

app.controller('controller.ecommerce.account.settings' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){
  $scope.form = {address : { street : '' , pincode : '' , city : '' , state : '', mobile :'' }}

  $http({method : 'GET' , url : '/api/ecommerce/profile/'}).
  then(function(response){
    // for(key in response.data[0])
    $scope.customerProfile = response.data[0];
    $scope.form.address = response.data[0].address;
    console.log($scope.customerProfile);
  })


  $scope.saveAddress = function(){
    console.log($scope.form);
    dataToSend = $scope.form.address;
    dataToSend.sendUpdates  = $scope.customerProfile.sendUpdates;
    dataToSend.mobile  = $scope.customerProfile.mobile;
    $http({method : 'PATCH' , url : '/api/ecommerce/profile/' + $scope.customerProfile.pk + '/' , data : dataToSend }).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }

});

app.controller('controller.ecommerce.account.support' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

  $scope.message = {subject : '' , body : ''};
  $scope.sendMessage = function(){
    $http({method : 'POST' , url : '/api/ecommerce/support/' , data : $scope.message}).
    then(function(response){
      $scope.message = {subject : '' , body : ''};
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


});



app.controller('controller.ecommerce.account' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

});


app.controller('controller.ecommerce.checkout' , function($scope , $state, $http , $timeout , $uibModal , $users , Flash){
  $scope.me = $users.get('mySelf');

  console.log('in checkout controllerrrrrr');
  console.log($state.params.pk);

  $scope.data = {quantity : 1 , shipping :'express', stage : 'review' , address : { street : '' , pincode : '' , city : '' , state : '', mobile :'' }};

  $scope.$watch(function(){
    $scope.data.pickUpTime = $scope.$parent.data.pickUpTime;
    $scope.data.dropInTime = $scope.$parent.data.dropInTime;
    $scope.data.location = $scope.$parent.data.location;
  })


  $http({method : 'GET' , url : '/api/ecommerce/profile/'}).
  then(function(response){
    $scope.customerProfile = response.data[0];
    $scope.data.address = response.data[0].address;
  })

  // $http({method : 'GET' , url : '/api/ecommerce/offering/' + $state.params.pk + '/'}).
  // then(function(response){
  //   $scope.offering = response.data;
  //   $scope.getBookingAmount = function(){
  //     h = Math.ceil(($scope.data.dropInTime-$scope.data.pickUpTime)/3600000);
  //     if (h<0){
  //       return 0
  //     }else {
  //       return $scope.offering.rate * $scope.data.quantity*h
  //     }
  //   }
  //
  //   $http({method : 'GET' , url : '/api/ecommerce/listing/' + response.data.item + '/'}).
  //   then(function(response){
  //     $scope.item = response.data;
  //   })
  // })

  if($state.params.pk=='cart') {
    $http({method : 'GET' , url : '  /api/ecommerce/cart/?user='+ $scope.me.pk}).
     then(function(response){
       $scope.cartItems = response.data;
     })
  }else {
    $http({method : 'GET' , url : '/api/ecommerce/listing/' + $state.params.pk + '/'}).
     then(function(response){
       $scope.item = response.data;
     })
  }





  $scope.next = function(){
    if ($scope.data.stage == 'review') {
      $scope.data.stage = 'shippingDetails';
    } else if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'payment';
    }
  }
  $scope.prev = function(){
    if ($scope.data.stage == 'shippingDetails') {
      $scope.data.stage = 'review';
    } else if ($scope.data.stage == 'payment') {
      $scope.data.stage = 'shippingDetails';
    }
  }

  $scope.pay = function(){
    $scope.data.pickUpTime = $scope.$parent.data.pickUpTime;
    $scope.data.dropInTime = $scope.$parent.data.dropInTime;
    $scope.data.location = $scope.$parent.data.location;
    $scope.data.stage = 'processing';

    $timeout(function () {
      $scope.data.stage = 'confirmation';
    }, 2000);


    // if ($scope.data.pickUpTime == null || $scope.data.dropInTime== null) {
    //   Flash.create('danger' , 'No start date and end date provided');
    //   return;
    // }
    // dataToSend = {
    //   user : getPK($scope.me.url),
    //   offer : $scope.offering.pk,
    //   paymentType : 'COD',
    //   rate : $scope.offering.rate,
    //   quantity : $scope.data.quantity,
    //   mobile : $scope.customerProfile.mobile,
    //   coupon : $scope.data.coupon,
    //   shipping : $scope.data.shipping,
    //   start : $scope.data.pickUpTime,
    //   end : $scope.data.dropInTime,
    // }
    // for (key in $scope.data.address) {
    //   if (key == 'pk') {
    //     continue;
    //   }
    //   dataToSend[key] = $scope.data.address[key];
    // }
    // $http({method : 'POST' , url : '/api/ecommerce/order/' , data : dataToSend}).
    // then(function(response){
    //   $scope.data.stage = 'confirmation';
    //   $scope.data.order = response.data;
    //   Flash.create('success', response.status + ' : ' + response.statusText);
    // }, function(response){
    //   Flash.create('danger', response.status + ' : ' + response.statusText);
    // })
  }


})


app.controller('ecommerce.main' , function($scope , $state , $http , $timeout , $uibModal , $users , $interval , Flash){
  $scope.me = $users.get('mySelf')
  $scope.inCart = [];
  $scope.data = {location : null}
  $scope.params = {location : null} // to be used to store different parameter by the users on which the search result will be filtered out


  $scope.genericProductSearch = function(query) {
    return $http.get('/api/ecommerce/searchProduct/?search=' + query + '&limit=10').
    then(function(response){
      return response.data;
    })
  };

  $scope.searchProduct = {
    product : ''
  };

  $scope.search = function () {
    if (typeof $scope.searchProduct.product=='object') {
      if ($scope.searchProduct.product.typ=='list') {
        $state.go('details' , {id:$scope.searchProduct.product.pk})
      }else {
        $state.go('categories' , {name:$scope.searchProduct.product.name})
      }
      $scope.searchProduct.product = '';
    }
  }

  $scope.$watch('searchProduct.product' , function(newValue, oldValue){
    if (newValue != null && typeof newValue =='object') {
      if (newValue.typ=='list') {
        $state.go('details' , {id:newValue.pk})
      }else {
        $state.go('categories' , {name:newValue.name})
      }
      $scope.searchProduct.product = '';
    }
  }, true);

  $scope.slide = {banners : [] , active : 0};

  $http({method : 'GET' , url : '/api/ecommerce/offerBanner/'}).
  then(function(response) {
    // for (var i = 0; i < response.data.length; i++) {
    //   s = response.data[i].params;
    //   s = s.split(':')[1];
    //   s = s.split('}')[0];
    //   response.data[i].params = {id : parseInt(s)}
    // }
    console.log('gggggggggggggggggggggg',response.data);
    $scope.slide.banners = response.data;
  })
  $scope.changeSlide = function(index){
    $scope.slide.active = index;
  }

  $interval(function () {
    $scope.slide.active += 1;
    if ($scope.slide.active == 5) {
      $scope.slide.active = 0;
    }
  }, 5000);

  $scope.feedback = {email : '' , mobile : null , message : ''};







  $http({method : 'GET' , url : '/api/ecommerce/listingLite/'}).
  then(function(response) {
    console.log('******************',response.data);
    $scope.listingProducts = response.data;
  })
  $http({method : 'GET' , url : '/api/ecommerce/genericProduct/'}).
  then(function(response) {
    console.log('******************',response.data);
    $scope.products = response.data;
  })







  $scope.sendFeedback = function() {
    dataToSend = {
      email : $scope.feedback.email,
      mobile : $scope.feedback.mobile,
      message : $scope.feedback.message,
    }

    $http({method : 'POST' , url : '/api/ecommerce/feedback/' , data : dataToSend }).
    then(function(response) {
      Flash.create('success', 'Thank you!');
      $scope.feedback = {email : '' , mobile : null , message : ''};
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.settings = {};
  $http({method : 'GET' , url : '/api/ERP/appSettings/?app=25'}).
  then(function(response) {
    for (var i = 0; i < response.data.length; i++) {
      $scope.settings[response.data[i].name] = response.data[i].value;
    }
    console.log($scope.settings);
  })

  $scope.data.pickUpTime = null;
  $scope.data.dropInTime = null;

  $http({method : 'GET' , url : '/api/ecommerce/cart/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].typ=='cart'){
        $scope.inCart.push(response.data[i])
      }
    }
  })

  $scope.headerUrl = '/static/ngTemplates/app.ecommerce.header.html';
  $scope.footerUrl = '/static/ngTemplates/app.ecommerce.footer.html';

  $scope.$watch('data.location' , function(newValue, oldValue){
    if (newValue != null && typeof newValue =='object') {
      $http({method : 'GET' , url : '/api/ecommerce/locationDetails/?id=' + newValue.place_id}).
      then(function(response){
        $scope.params.location = response.data.result;
        console.log($scope.params.location.geometry.location);
        // lat lon is available in location.geometry.location.lat or lng
      })
    }
  }, true);

  $scope.getLocationSuggeations = function(query){
    return $http.get('/api/ecommerce/suggestLocations/?query=' + query).
    then(function(response){
      return response.data.predictions;
    })
  }

  $scope.refreshResults = function(){
    $state.go('ecommerce' , {} , {reload : true})
    // if (angular.isDefined($scope.$$childHead.fetchListings)) {
    //   $scope.$$childHead.fetchListings()
    // }else {
    //   $scope.$$childTail.fetchListings()
    // }
  }

});

app.controller('controller.ecommerce.list' , function($scope , $state , $http , $users){

  $scope.fetchListings = function(){
    url = '/api/ecommerce/listingLite/?'
    $scope.listings = [];
    parent = $scope.$parent;
    if (parent.data.location != null && typeof parent.data.location!='string') {
      l = parent.data.location;
      pin = parent.params.location.formatted_address.match(/[0-9]{6}/);
      if (pin != null) {
        url += 'geo=' + pin[0].substring(0,3);
      } else {
        return;
      }

    }

    $http({method : "GET" , url : url}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        l = response.data[i];
        index = 0
        if (l.providerOptions.length == 0) {
          continue;
        }
        min = l.providerOptions[index].rate;
        for (var j = 1; j < l.providerOptions.length; j++) {
          if (l.providerOptions[j].rate < min) {
            min = l.providerOptions[j].rate;
            index = j;
          }
        }
        l.bestOffer = l.providerOptions[index];
        $scope.listings.push(l);
      }
    })
  }

  $scope.listings = [];
  $scope.me = $users.get('mySelf');

  $scope.addToCart = function(input){
    dataToSend = {
      category : 'cart',
      user : getPK($scope.me.url),
      item : input.pk,
    }
    $http({method : 'POST' , url : '/api/ecommerce/saved/' , data : dataToSend }).
    then(function(response){
      for (var i = 0; i < $scope.inCart.length; i++) {
        if ($scope.inCart[i].pk == response.data.pk){
          return;
        }
      }
      $scope.inCart.push(response.data);
    })
  }

  $scope.buy = function(input){
    $state.go('checkout' , {pk : input.pk})
  }

  $scope.changePicture = function(parent , pic){
    $scope.listings[$scope.listings.indexOf(parent)].pictureInView = pic;
  }

  // $scope.fetchListings()


});
