app.config(function($stateProvider){

  $stateProvider
  .state('tools.PDFEngine', {
    url: "/PDFEngine",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.PDFEngine.html',
       }
    }
  })

});
