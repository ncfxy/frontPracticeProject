"use strict";

var mainApp = angular.module("mainApp", []);

mainApp.run(function($rootScope){

    $rootScope.user = JSON.parse(localStorage.getItem('user') || '{}');

    $rootScope.goToDataHref = function(event){
        window.location = $(event.currentTarget).attr('data-href');
    }

});
dealWithHeader(mainApp);

