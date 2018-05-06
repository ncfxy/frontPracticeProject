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
    .when("/purchaseOrderList",{
        templateUrl : "html-parts/purchase/purchase-orderList.html"
    })
    .when("/purchaseOrderDetail",{
        templateUrl : "html-parts/purchase/purchase-orderDetail.html"
    })
    .when("/salesOrderList",{
        templateUrl : "html-parts/sales/sales-orderList.html"
    })
    .when("/salesOrderDetail",{
        templateUrl : "html-parts/sales/sales-orderDetail.html"
    })
    .when("/warehouseRecordList",{
        templateUrl : "html-parts/warehouse/warehouse-warehouseRecordList.html"
    })
    .when("/warehouseEntryCreate",{
        templateUrl : "html-parts/warehouse/warehouse-warehouseEntryCreate.html"
    })
    .when("/warehouseEntryDetail",{
        templateUrl : "html-parts/warehouse/warehouse-warehouseEntryDetail.html"
    })
    .when("/inventoryInspection",{
        templateUrl : "html-parts/warehouse/warehouse-inventoryInspection.html"
    })
    .when("/stockDetail",{
        templateUrl : "html-parts/warehouse/warehouse-stockDetail.html"
    })

    ;
});


dealWithHeader(mainApp);

