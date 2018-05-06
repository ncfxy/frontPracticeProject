require.config({
    baseUrl : 'lib',
    paths:{
        app: '..',
        jquery: ['https://cdn.bootcss.com/jquery/2.2.4/jquery.min','jquery-2.2.4.min'],
        bootstrap:['https://cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min','bootstrap.min'],
        alasql: ['https://cdn.bootcss.com/alasql/0.2.6/alasql.min','alasql','alasql.min'],
        purl: 'purl',
        angular: ['https://cdn.bootcss.com/angular.js/1.4.8/angular.min','angular','angular.min'],
        angular_route: ['https://cdn.bootcss.com/angular.js/1.4.8/angular-route.min','angular-route', 'angular-route.min'],
        chart: ['https://cdn.bootcss.com/Chart.js/2.5.0/Chart.min','Chart.min'],

        print_helper: '../js/print-helper',
        db: '../js/db',
        common: '../js/common',
        index: '../js/index',

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

        all: '../build/all'

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

var salesScript = ['sales_itemList','sales_plan',
                    'sales_customers','sales_contracts','sales_contractDetail',
                    'sales_contractForm','sales_createOrder','sales_orderList',
                    'sales_orderDetail','sales_orderArrange'];

var purchaseScript = ['purchase_analysis','purchase_createOrder','purchase_plan',
                    'purchase_realTimePurchase','purchase_orderList','purchase_orderDetail',
                    'purchase_itemForm','purchase_addStock'];

var reportScript = ['report','report_detail'];

var warehouseScript = ['warehouse_warehouseRecordList','warehouse_warehouseEntryCreate',
                    'warehouse_warehouseEntryDetail','warehouse_inventoryInspection',
                    'warehouse_stockDetail'];