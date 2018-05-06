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
    .when("/allStocks",{
        templateUrl : "html-parts/purchase/purchase-analysis.html"
    })
    .when("/plan",{
        templateUrl : "html-parts/purchase/purchase-plan.html"
    })
    .when("/createOrder",{
        templateUrl : "html-parts/purchase/purchase-createOrder.html"
    })
    .when("/suppliers",{
        templateUrl : "html-parts/purchase/purchase-suppliers.html"
    })
    .when("/realTimePurchase",{
        templateUrl : "html-parts/purchase/purchase-realTimePurchase.html"
    })
    .when("/orderList",{
        templateUrl : "html-parts/purchase/purchase-orderList.html"
    })
    .when("/purchaseOrderDetail",{
        templateUrl : "html-parts/purchase/purchase-orderDetail.html"
    })
    .when("/itemsManagement",{
        templateUrl : "html-parts/sales/sales-itemList.html"
    })
    .when("/itemDetail",{
        templateUrl : "html-parts/sales/sales-itemDetail.html"
    })
    .when("/itemForm",{
        templateUrl : "html-parts/purchase/purchase-itemForm.html"
    })
    .when("/warehouseEntryDetail",{
        templateUrl : "html-parts/warehouse/warehouse-warehouseEntryDetail.html"
    })
    .when("/addStock", {
        templateUrl : "html-parts/purchase/purchase-addStock.html"
    })
    .when("/stockDetail", {
        templateUrl : "html-parts/warehouse/warehouse-stockDetail.html"
    })



    .when("/report",{
        templateUrl : "html-parts/statistic/statistic-report.html"
    })
    .when("/purchaseDetail",{
        templateUrl : "html-parts/statistic/statistic-purchaseDetail.html"
    })
    .when("/salesDetail",{
        templateUrl : "html-parts/statistic/statistic-salesDetail.html"
    })
    .when("/salesOrderDetail",{
        templateUrl : "html-parts/sales/sales-orderDetail.html"
    })

    ;
});


dealWithHeader(mainApp);
