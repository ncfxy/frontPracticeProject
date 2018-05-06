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
    .when("/itemList",{
        templateUrl : "html-parts/sales/sales-itemList.html"
    })
    .when("/plan",{
        templateUrl : "html-parts/sales/sales-plan.html"
    })
    .when("/contracts",{
        templateUrl : "html-parts/sales/sales-contracts.html"
    })
    .when("/orders",{
        templateUrl : "html-parts/sales/sales-orders.html"
    })
    .when("/itemDetail",{
        templateUrl : "html-parts/sales/sales-itemDetail.html"
    })
    .when("/customers",{
        templateUrl : "html-parts/sales/sales-customers.html"
    })
    .when("/customerForm",{
        templateUrl : "html-parts/sales/sales-customerForm.html"
    })
    .when("/contractDetail",{
        templateUrl : "html-parts/sales/sales-contractDetail.html"
    })
    .when("/contractForm",{
        templateUrl : "html-parts/sales/sales-contractForm.html"
    })
    .when("/createOrder",{
        templateUrl : "html-parts/sales/sales-createOrder.html"
    })
    .when("/orderList",{
        templateUrl : "html-parts/sales/sales-orderList.html"
    })
    .when("/salesOrderDetail",{
        templateUrl : "html-parts/sales/sales-orderDetail.html"
    })
    .when("/orderArrange",{
        templateUrl : "html-parts/sales/sales-orderArrange.html"
    })
    .when("/warehouseEntryDetail",{
        templateUrl : "html-parts/warehouse/warehouse-warehouseEntryDetail.html"
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

