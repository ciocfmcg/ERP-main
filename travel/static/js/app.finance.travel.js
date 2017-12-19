app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.finance.travel', {
    url: "/travel",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.finance.travel.html',
          controller : 'finance.travel'
       }
    }
  })

});


// ere you will be putting your controller


app.controller('finance.travel' , function($scope , $users , Flash){
  // main businessManagement tab default page controller

  $scope.currencies =[  { money: 'Indian Rupee' },
                        { money: 'US Dollar' },
                        { money: 'Thai Baht' },
                        { money: 'UAE Dirham' },
                        { money: 'Nepalese Rupee' },
                        { money: 'Omani Rial' },
                        { money: 'Singapore Dollar' },
                        { money: 'Euro' },
                        { money: 'British Pound' },
                        { money: 'Qatari Riyal' }

                      ];
  $scope.cities = [ { city:'Agartala(IXA)'},
                    { city:'Ahmedabada(AMD)'},
                    { city:'Amritsar(ATQ)'},
                    { city:'Bagdogra(IXB)'},
                    { city:'Bangkok (BKK)'},
                    { city:'Bangalore (BLR)'}

                  ]


  //
  // $scope.done=function() {
  //   if ( data.model! == '' $$ data.model1! == '' && data.model2 ! == '') {
  //     console.log("loaded");
  //   };
  // };



});
