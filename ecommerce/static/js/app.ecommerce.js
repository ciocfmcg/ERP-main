app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.ecommerce', {
    url: "/ecommerce",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.ecommerce": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.ecommerce": {
          templateUrl: '/static/ngTemplates/app.POS.default.html',
          controller: 'businessManagement.POS.default',
          // templateUrl: '/static/ngTemplates/app.ecommerce.vendor.default.html',
          // controller: 'businessManagement.ecommerce.default',
        }
    }
  })
  .state('businessManagement.ecommerce.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.configure.html',
    controller: 'businessManagement.ecommerce.configure'
  })
  .state('businessManagement.ecommerce.listings', {
    url: "/listings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.listings.html',
    controller: 'businessManagement.ecommerce.listings'
  })
  .state('businessManagement.ecommerce.orders', {
    url: "/orders",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.orders.html',
    controller: 'businessManagement.ecommerce.orders'
  })
  .state('businessManagement.ecommerce.earnings', {
    url: "/earnings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.earnings.html',
    controller: 'businessManagement.ecommerce.earnings'
  })
  .state('businessManagement.ecommerce.support', {
    url: "/support",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.support.html',
    controller: 'businessManagement.ecommerce.support'
  })
  .state('businessManagement.ecommerce.offerings', {
    url: "/offerings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.offerings.html',
    controller: 'businessManagement.ecommerce.offerings'
  })
  .state('businessManagement.ecommerce.partners', {
    url: "/partners",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.partners.html',
    controller: 'businessManagement.ecommerce.partners'
  })

});
