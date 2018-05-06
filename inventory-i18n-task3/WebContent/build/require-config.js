require.config({
    baseUrl : 'lib',
    paths:{

        sales_itemList: '../html-parts/sales/sales-itemList',
        sales_plan: '../html-parts/sales/sales-plan',
        sales_customers: '../html-parts/sales/sales-customers',
        sales_contracts: '../html-parts/sales/sales-contracts',
        sales_contractDetail: '../html-parts/sales/sales-contractDetail',
        sales_contractForm: '../html-parts/sales/sales-contractForm',
        sales_createOrder: '../html-parts/sales/sales-createOrder',
        sales_orderList: '../html-parts/sales/sales-orderList',
        sales_orderDetail: '../html-parts/sales/sales-orderDetail',
        sales_orderArrange: '../html-parts/sales/sales-orderArrange',


        purchase_analysis: "../html-parts/purchase/purchase-analysis",
        purchase_createOrder: "../html-parts/purchase/purchase-createOrder",
        purchase_plan: "../html-parts/purchase/purchase-plan",
        purchase_realTimePurchase: "../html-parts/purchase/purchase-realTimePurchase",
        purchase_orderList: "../html-parts/purchase/purchase-orderList",
        purchase_orderDetail: "../html-parts/purchase/purchase-orderDetail",
        purchase_itemForm: "../html-parts/purchase/purchase-itemForm",
        purchase_addStock: "../html-parts/purchase/purchase-addStock",


        warehouse_warehouseRecordList: "../html-parts/warehouse/warehouse-warehouseRecordList",
        warehouse_warehouseEntryCreate: "../html-parts/warehouse/warehouse-warehouseEntryCreate",
        warehouse_warehouseEntryDetail: "../html-parts/warehouse/warehouse-warehouseEntryDetail",
        warehouse_inventoryInspection: "../html-parts/warehouse/warehouse-inventoryInspection",
        warehouse_stockDetail: "../html-parts/warehouse/warehouse-stockDetail",


        userTask: '../html-parts/userTask/userTask',

        report: '../html-parts/statistic/statistic-report',
        report_detail: '../html-parts/statistic/statistic-purchaseDetail',

    },
    shim:{
        'bootstrap':{
            deps:['jquery'],
            exports:'bootstrap'
        },
        'purl':{
            deps:['jquery'],
            exports:'purl'
        },
        'lazyload':{
            deps:['jquery'],
            exports:'lazyload'
        },
        'angular':{
            exports: "angular"
        },
        'angular_route':{
            deps: ["angular"]
        }
    }
});
