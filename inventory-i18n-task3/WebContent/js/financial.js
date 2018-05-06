"use strict";

var mainApp = angular.module("mainApp", ["ngRoute"]);

mainApp.run(function($rootScope){
    $rootScope.user = JSON.parse(localStorage.getItem('user') || '{}');

    $rootScope.goToDataHref = function(event){
        window.location = $(event.currentTarget).attr('data-href');
    }
});

registerService(mainApp);

// 配置路由映射
mainApp.config(function($routeProvider) {
    $routeProvider
    .when("/",{
        templateUrl : "html-parts/userTask/userTask.html"
    })
    .when("/salesOrderDetail",{
        templateUrl : "html-parts/sales/sales-orderDetail.html"
    })
    .when("/purchaseOrderDetail",{
        templateUrl : "html-parts/purchase/purchase-orderDetail.html"
    })

    ;
});

dealWithHeader(mainApp);

