
mainApp.controller('userTaskCtrl', ['$scope', '$rootScope', '$searchService', function($scope, $rootScope, $searchService) {



    // 对搜到结果中的送货员id替换为姓名
    $scope.replaceDeliveryName = function(list){
        if(list == undefined || list == null || list.length == 0){
            return;
        }
        for(var i = 0;i < list.length;i++){
            list[i].create_time = list[i].create_time.slice(0,10);
            var deliveryManId = list[i].delivery;
            var sql = "SELECT * FROM users WHERE id = ?";
            var res = alasql(sql, [deliveryManId]);
            if(res.length > 0){
                list[i].deliveryName = res[0].name;
            }
        }
    }

    // 为送货员搜索相关信息
    $scope.searchForDelivery = function(){
        $scope.saleOrderList = [];
        var sql = "SELECT a.id as orderId, b.name as customerName, * FROM sale_orders a \
                JOIN customer b ON a.customer = b.id \
                WHERE (a.state = 'Warehouse Exiting' OR a.state = 'Arranged') \
                AND a.delivery = " + $rootScope.user.id;

        $scope.saleOrderList = alasql(sql);

        $scope.replaceDeliveryName($scope.saleOrderList);

    }

    // 对搜索得到的采购订单进行转化，使之与页面对应
    $scope.dealWithPurchaseOrders = function(orders){
        $scope.purchaseOrderList = [];
        var purchaseOrderList = [];
        for(var i = 0;i < orders.length;i++){
            var tmp = {};
            tmp.orderId = orders[i].id;
            tmp.createTime = new Date(orders[i].create_time).toLocaleString();
            tmp.state = orders[i].state;

            sql = "SELECT * FROM orderoperation JOIN users ON orderoperation.operator = users.id WHERE orderoperation.order_id = ? and orderoperation.operation = ?";
            var res = alasql(sql, [tmp.orderId, 'create'])[0];

            tmp.createPerson = res.name;

            purchaseOrderList.push(tmp);
        }
        return purchaseOrderList;
    }


    // 为财务人员搜索相关信息
    $scope.searchForFinancial = function(){
        $scope.purchaseOrderList = [];
        var sql = "SELECT a.id as orderId, b.name as customerName, * FROM sale_orders a \
                JOIN customer b ON a.customer = b.id \
                WHERE a.state = 'create'";
        $scope.saleOrderList = alasql(sql);

        $scope.replaceDeliveryName($scope.saleOrderList);



        var sql = "SELECT * FROM orders WHERE type = 'purchase' AND state = 'Confirmed Purchase Price'";
        var orders = alasql(sql);

        $scope.purchaseOrderList = $scope.dealWithPurchaseOrders(orders);

    }

    // 得到所有相关出入库操作的和
    $scope.getOperationSumAmount = function(orderId, stockId, operation){
        var sql = "SELECT * FROM warehouse_in_out a \
                    JOIN warehouse_in_out_item b ON a.id = b.in_out_id \
                    JOIN trans c ON b.trans_id = c.id \
                    WHERE a.order_id = ? AND c.stock = ? AND a.type = ? ";
        var res = alasql(sql, [orderId, stockId, operation]);
        var sum = 0;
        for(var i = 0;i < res.length;i++){
            sum += parseInt(res[i].qty);
        }
        return sum;
    }

    // 该订单中货物是否全部入库成功
    $scope.isFinished = function(orderId){
        var finished = true;

        var sql = 'SELECT * FROM orderstock WHERE order_id = ' + orderId;
        var orderDetailList = alasql(sql);
        for(var i = 0;i < orderDetailList.length;i++){
            var row = $searchService.getStockInformation(orderDetailList[i].stock_id);
            row['chooseAmount'] = orderDetailList[i].amount;
            row.receivedAmount = $scope.getOperationSumAmount(orderId, orderDetailList[i].stock_id, "Entry");
            row.finished = (row.receivedAmount >= row.chooseAmount);
            if(!row.finished){
                finished = false;
                break;
            }
        }
        return finished;
    }

    // 添加到localStorage中去
    $scope.addToProcurement = function(event){
        var id = $(event.currentTarget).parents('tr').attr('data-href').split("=")[1];
        console.log(id);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems'));
        if(purchaseItems[id] == undefined){
            purchaseItems[id] = 1;
        }else{
            purchaseItems[id] = purchaseItems[id] + 1;
        }
        $scope.purchaseItems = purchaseItems;

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
        $scope.searchForBuyer();


        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // 从localStorage中减一
    $scope.removeFromProcurement = function(event){
        var id = $(event.currentTarget).parents('tr').attr('data-href').split("=")[1];
        console.log(id);
        var purchaseItems = JSON.parse(localStorage.getItem('purchaseItems'));
        if(purchaseItems[id] == undefined){
            return;
        }else if(purchaseItems[id] > 1){
            purchaseItems[id] = purchaseItems[id] - 1;
        }else if(purchaseItems[id] == 1){
            delete purchaseItems[id];
        }
        $scope.purchaseItems = purchaseItems;

        localStorage.setItem('purchaseItems',JSON.stringify(purchaseItems));
        $scope.searchForBuyer();


        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // 搜索仓库中小于警戒线的商品
    $scope.searchShortageStock = function(){
        var sql = 'SELECT stock.id as stock_id, whouse.name, kind.text, item.code, item.maker, \
            item.detail, item.price, stock.balance, item.unit, stock.warning_line,whouse.id as w_id \
            FROM stock \
            JOIN whouse ON whouse.id = stock.whouse \
            JOIN item ON item.id = stock.item \
            JOIN kind ON kind.id = item.kind \
            WHERE stock.balance < stock.warning_line ';

        // send query
        var stocks = alasql(sql);

        for(var i = 0;i < stocks.length;i++){
            $scope.purchaseItems = JSON.parse(localStorage.getItem('purchaseItems') || '[]');
            var tmp = $scope.purchaseItems[stocks[i].stock_id];
            tmp = (tmp == undefined ? 0 : tmp);
            if(stocks[i].balance + tmp < stocks[i].warning_line){
                stocks[i].backgroundColor = 'red';
            }else{
                stocks[i].backgroundColor = 'white';
            }
        }

        $scope.shortageStocks = stocks;
    }

    // 为采购员搜索相关信息
    $scope.searchForBuyer = function(){
        $scope.waitingPricePurchaseOrderList = [];
        $scope.warehouseEnteringOrder = [];
        $scope.shortageStocks = [];
        var sql = "SELECT * FROM orders WHERE type = 'purchase' AND state = 'create' ";
        var orders = alasql(sql);
        $scope.waitingPricePurchaseOrderList = $scope.dealWithPurchaseOrders(orders);

        sql = "SELECT * FROM orders WHERE type = 'purchase' AND (state = 'Warehouse Entering' OR state = 'Confirmed Purchase Price' OR state = 'Paid') ";
        orders = alasql(sql);
        $scope.warehouseEnteringOrder = $scope.dealWithPurchaseOrders(orders);
        for(var i = 0;i < $scope.warehouseEnteringOrder.length;i++){
            $scope.warehouseEnteringOrder[i].finished = $scope.isFinished($scope.warehouseEnteringOrder[i].orderId);
            $scope.warehouseEnteringOrder[i].backgroundColor = $scope.warehouseEnteringOrder[i].finished?'#5CB85C':'#D9534F';
        }

        $scope.searchShortageStock();


    }

    // 为销售人员搜索相关信息
    $scope.searchForSalesman = function(){
        $scope.waitingArrangeSaleOrderList = [];
        var sql = "SELECT a.id as orderId, b.name as customerName, * FROM sale_orders a \
                JOIN customer b ON a.customer = b.id \
                WHERE a.state = 'Paid' "
        $scope.waitingArrangeSaleOrderList = alasql(sql);

        $scope.replaceDeliveryName($scope.waitingArrangeSaleOrderList);

        $scope.contracts = [];
        var sql = "SELECT a.id as contractId, a.type as contractType, \
                b.name as customerName, c.name as salesmanName,* \
                FROM contract a JOIN customer b ON a.customer = b.id \
                JOIN users c ON a.salesman = c.id \
                WHERE 1 = 1";

        $scope.contracts = alasql(sql);

        for(var i = 0;i < $scope.contracts.length;i++){
            $scope.contracts[i].sign_time = new Date($scope.contracts[i].sign_time).toLocaleString();
            $scope.contracts[i].delivery_time = new Date($scope.contracts[i].delivery_time).toLocaleString();
            $scope.contracts[i].validity_time = new Date($scope.contracts[i].validity_time).toLocaleString();
        }


        $scope.warehouseExitingOrderList = [];
        var sql = "SELECT a.id as orderId, b.name as customerName, * FROM sale_orders a \
                JOIN customer b ON a.customer = b.id \
                WHERE a.state = 'Arranged' OR a.state = 'Warehouse Exiting' OR a.state = 'Delivered'";
        $scope.warehouseExitingOrderList = alasql(sql);
        $scope.replaceDeliveryName($scope.warehouseExitingOrderList);
    }

    // 将已完成入库任务的采购单删除
    $scope.removeUncorrelatedPurchaseOrder = function(orders){
        var newOrders = [];
        for(var i = 0;i < orders.length;i++){
            var orderId = orders[i].id;
            var needOpt = false;
            var sql = "SELECT * FROM orderstock \
                        JOIN stock ON orderstock.stock_id = stock.id \
                        WHERE orderstock.order_id = ? \
                        AND stock.whouse = ?";
            var records = alasql(sql,[orderId, $rootScope.user.belong_warehouse]);
            for(var j = 0;j < records.length;j++){
                var inAmount = $scope.getOperationSumAmount(orderId, records[j].stock_id, 'Entry');
                if(inAmount < records[j].amount){
                    needOpt = true;
                    break;
                }
            }
            if(needOpt){
                newOrders.push(orders[i]);
            }
        }
        return newOrders;
    }

    $scope.removeUncorrelatedSalesOrder = function(orders){
        var newOrders = [];
        for(var i = 0;i < orders.length;i++){
            var orderId = orders[i].orderId;
            var needOpt = false;
            var sql = "SELECT * FROM sale_order_item a \
                        JOIN sale_order_stock b ON a.id = b.sale_order_item_id \
                        JOIN stock c ON b.stock_id = c.id \
                        WHERE a.sale_order_id = ? \
                        AND c.whouse = ?";
            var records = alasql(sql, [orderId, $rootScope.user.belong_warehouse]);
            for(var j = 0;j < records.length;j++){
                var outAmount = -$scope.getOperationSumAmount(orderId, records[j].stock_id, 'Exit');
                if(outAmount < records[j].amount){
                    needOpt = true;
                    break;
                }
            }
            if(needOpt){
                newOrders.push(orders[i]);
            }
        }
        return newOrders;
    }


    // 为库存管理员搜索相关信息
    $scope.searchForWarehouse = function(){
        var sql = "SELECT * FROM orders WHERE type = 'purchase' \
                     AND (state = 'Warehouse Entering' OR state = 'Paid')";
        orders = alasql(sql);
        orders = $scope.removeUncorrelatedPurchaseOrder(orders);
        $scope.warehouseEnteringOrder = $scope.dealWithPurchaseOrders(orders);
        for(var i = 0;i < $scope.warehouseEnteringOrder.length;i++){
            $scope.warehouseEnteringOrder[i].finished = $scope.isFinished($scope.warehouseEnteringOrder[i].orderId);
            $scope.warehouseEnteringOrder[i].backgroundColor = $scope.warehouseEnteringOrder[i].finished?'#5CB85C':'#D9534F';
        }




        $scope.warehouseExitingOrderList = [];
        var sql = "SELECT a.id as orderId, b.name as customerName, * FROM sale_orders a \
                JOIN customer b ON a.customer = b.id \
                WHERE a.state = 'Arranged' OR a.state = 'Warehouse Exiting' ";
        var orders = alasql(sql);
        $scope.warehouseExitingOrderList = $scope.removeUncorrelatedSalesOrder(orders);
        $scope.replaceDeliveryName($scope.warehouseExitingOrderList);


        $scope.searchShortageStock();
        var onlyMyWarehouse = [];
        for(var i = 0;i < $scope.shortageStocks.length;i++){
            if($scope.shortageStocks[i].w_id == $rootScope.user.belong_warehouse){
                onlyMyWarehouse.push($scope.shortageStocks[i]);
            }
        }
        $scope.shortageStocks = onlyMyWarehouse;
    }





    if($rootScope.user.type == 'delivery'){
        $scope.searchForDelivery();
    }else if($rootScope.user.type == 'financial'){
        $scope.searchForFinancial();
    }else if($rootScope.user.type == 'buyer'){
        $scope.searchForBuyer();
    }else if($rootScope.user.type == 'salesman'){
        $scope.searchForSalesman();
    }else if($rootScope.user.type == 'warehouse'){
        $scope.searchForWarehouse();
    }

}]);
