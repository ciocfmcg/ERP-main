var app = angular.module('app' , ['ui.router', 'ui.bootstrap' ,'flash' ,'ngSanitize', 'ngAnimate', 'anim-in-out' ,'ui.bootstrap.datetimepicker']);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide, $locationProvider){

  $urlRouterProvider.otherwise('/');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  $locationProvider.html5Mode(true);

});

app.run([ '$rootScope', '$state', '$stateParams' , function ($rootScope,   $state,   $stateParams ) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
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

});

app.controller('controller.ecommerce.details' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window){

  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime'
  console.log($scope.data);
  $scope.breadcrumbList = [];
  $scope.details = {};
  $window.scrollTo(0,0)
  $http({method : 'GET' , url : '/api/ecommerce/listing/'+ $state.params.id +'/'}).
  then(function(response){
    console.log('pppppppppppppppp',response.data);
    $scope.details = response.data
    $scope.details.specifications = JSON.parse($scope.details.specifications);
    $scope.breadcrumbList.push($scope.details.product.name)
  });


  // $timeout(function () {
  //   $http({method : 'GET' , url : '/api/ecommerce/genericProduct/'+ $scope.details.parentType  +'/'}).
  //   then(function(response){
  //     console.log(response.data);
  //     $scope.parent = response.data;
  //   });
  // }, 1000);




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

  $scope.addToCart = function(input){
    console.log(input);
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

app.controller('controller.ecommerce.categories' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window){

  $scope.data = $scope.$parent.data; // contains the pickUpTime , location and dropInTime
  $window.scrollTo(0,0)
  console.log($state.params);
  $scope.category = {}
  $http({method : 'GET' , url : '/api/ecommerce/genericProduct/?name__iexact='+ $state.params.name}).
  then(function(response){
    console.log('category',response.data);
    $scope.category = response.data[0];
  });

  $timeout(function () {
    if ($scope.category.parent) {
      console.log('heree');
      $http({method : 'GET' , url : '/api/ecommerce/listing/?parentType='+ $scope.category.pk }).
      then(function(response){
        $scope.listing = response.data;
      })
    }else {
      console.log('second');
      $http({method : 'GET' , url : '/api/ecommerce/genericProduct/?parent='+ $scope.category.pk}).
      then(function(response){
        console.log('child category',response.data);
        $scope.childCategory = response.data;
      });
    }
    ;
  }, 1000);




});



app.controller('controller.ecommerce.account' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){
// for the dashboard of the account tab
});
app.controller('controller.ecommerce.account.cart' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

  $scope.views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/app.ecommerce.account.cart.list.html' ,
    itemTemplate : '/static/ngTemplates/app.ecommerce.account.cart.item.html',

  },];

});

app.controller('controller.ecommerce.account.cart.item' , function($scope , $http , $state){
  console.log("item loaded");

  $scope.data = $scope.$parent.$parent.data;
  console.log($scope.data);
  $http({method : 'GET' , url : '/api/ecommerce/listing/' + $scope.data.item + '/'}).
  then(function(response){
    index = 0
    l = response.data;
    min = l.providerOptions[index].rate;
    for (var j = 1; j < l.providerOptions.length; j++) {
      if (l.providerOptions[j].rate < min) {
        min = l.providerOptions[j].rate;
        index = j;
      }
    }
    l.bestOffer = l.providerOptions[index];
    for(key in l){
      $scope.data[key] = l[key];
    }
  })

  $scope.view = function(){
    $state.go('details' , {id : $scope.data.pk})
  }


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

  $http({method : 'GET' , url : '/api/ecommerce/offering/' + $state.params.pk + '/'}).
  then(function(response){
    $scope.offering = response.data;
    $scope.getBookingAmount = function(){
      h = Math.ceil(($scope.data.dropInTime-$scope.data.pickUpTime)/3600000);
      if (h<0){
        return 0
      }else {
        return $scope.offering.rate * $scope.data.quantity*h
      }
    }

    $http({method : 'GET' , url : '/api/ecommerce/listing/' + response.data.item + '/'}).
    then(function(response){
      $scope.item = response.data;
    })
  })


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

    if ($scope.data.pickUpTime == null || $scope.data.dropInTime== null) {
      Flash.create('danger' , 'No start date and end date provided');
      return;
    }
    dataToSend = {
      user : getPK($scope.me.url),
      offer : $scope.offering.pk,
      paymentType : 'COD',
      rate : $scope.offering.rate,
      quantity : $scope.data.quantity,
      mobile : $scope.customerProfile.mobile,
      coupon : $scope.data.coupon,
      shipping : $scope.data.shipping,
      start : $scope.data.pickUpTime,
      end : $scope.data.dropInTime,
    }
    for (key in $scope.data.address) {
      if (key == 'pk') {
        continue;
      }
      dataToSend[key] = $scope.data.address[key];
    }
    $http({method : 'POST' , url : '/api/ecommerce/order/' , data : dataToSend}).
    then(function(response){
      $scope.data.stage = 'confirmation';
      $scope.data.order = response.data;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
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
      console.log(response.data);
      return response.data;
    })
  };

  $scope.searchProduct = {
    product : ''
  };

  $scope.search = function () {
    if (typeof $scope.searchProduct.product=='object') {
      console.log($scope.searchProduct.product);
      if ($scope.searchProduct.product.typ=='list') {
        // console.log('proooo');
        $state.go('details' , {id:$scope.searchProduct.product.pk})
      }else {
        // console.log('generic');
        $state.go('categories' , {name:$scope.searchProduct.product.name})
      }
      $scope.searchProduct.product = '';
    }
  }

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

  $http({method : 'GET' , url : '/api/ecommerce/saved/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i].category=='cart'){
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
