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
            templateUrl : "html-parts/statistic/statistic-report.html"
        })
        .when("/purchaseDetail",{
            templateUrl : "html-parts/statistic/statistic-purchaseDetail.html"
        })
        .when("/salesDetail",{
            templateUrl : "html-parts/statistic/statistic-salesDetail.html"
        })
        .when("/report",{
            templateUrl : "html-parts/statistic/statistic-report.html"
        })
        .when("/purchaseOrderDetail",{
            templateUrl : "html-parts/purchase/purchase-orderDetail.html"
        })
        .when("/warehouseEntryDetail",{
            templateUrl : "html-parts/warehouse/warehouse-warehouseEntryDetail.html"
        })
        .when("/salesOrderDetail",{
            templateUrl : "html-parts/sales/sales-orderDetail.html"
        })

        ;
    });

    dealWithHeader(mainApp);


