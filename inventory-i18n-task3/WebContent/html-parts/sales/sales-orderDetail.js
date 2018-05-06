

mainApp.controller('salesOrderDetailCtrl', ['$scope', '$rootScope', '$location', '$searchService', function($scope, $rootScope, $location, $searchService){

    var id = parseInt($location.search()['id']);

    $scope.orderId = id;
    $scope.steps = ['create','Paid','Arranged','Warehouse Exiting','Delivered', 'Finished'];
    $scope.lines = [1,2,3,4,5];
    $scope.gap = 95/($scope.steps.length - 1);

    $scope.updateOrderInfor = function(){
        var sql = "SELECT a.id as orderId, b.name as customerName, \
                     * FROM sale_orders a \
                    JOIN customer b ON a.customer = b.id \
                    WHERE a.id = ?";

        $scope.order = alasql(sql,[$scope.orderId]);
        formatAllDate($scope.order, 'create_time');
        $scope.order = $scope.order[0];

        $scope.deliveryId = $scope.order.delivery;
        deliveryInfo = alasql("SELECT * FROM users WHERE id = ?", [$scope.order.delivery]);
        if(deliveryInfo.length > 0){
            $scope.order.delivery = deliveryInfo[0].name;
        }else{
            $scope.order.delivery = '';
        }

        $scope.nowStep = 0;
        $scope.stepColors = [];
        for(var i = 0;i < $scope.steps.length;i++){
            if($scope.order.state == $scope.steps[i]){
                $scope.nowStep = i;
            }
        }
        for(var i = 0;i < $scope.steps.length;i++){
            if(i <= $scope.nowStep){
                $scope.stepColors.push('#DD0000');
            }else{
                $scope.stepColors.push('#bbb');
            }
        }
    }

    $scope.updateOrderInfor();

    $scope.updateOperations = function(){
        sql = "SELECT * FROM orderoperation \
                JOIN users ON orderoperation.operator = users.id \
                WHERE order_id = ?"
        $scope.operations = alasql(sql, [$scope.orderId]);
        for(var i = 0;i < $scope.operations.length;i++){
            if($scope.operations[i].operation.startsWith("Warehouse Exit")){
                var tmp = $scope.operations[i].operation.split("=")[1];
                tmp = tmp.slice(0,-1);
                $scope.operations[i].href = "#/warehouseEntryDetail?id="+tmp+"&type=Exit";
            }
        }

        formatAllDate($scope.operations, 'operation_time');
    }
    $scope.updateOperations();

    // 获取contractList
    $scope.getContractList = function(){
        var saleOrderContracts = alasql("SELECT * FROM sale_order_contract WHERE sale_order_id = ?",[$scope.orderId]);
        $scope.contractList = [];
        for(var i = 0;i < saleOrderContracts.length;i++){
            var sql = "SELECT a.id as contractId, a.type as contractType, \
                            b.name as customerName, c.name as salesmanName,* \
                            FROM contract a JOIN customer b ON a.customer = b.id \
                            JOIN users c ON a.salesman = c.id \
                            WHERE a.id = ?";
            var contract = alasql(sql, [parseInt(saleOrderContracts[i].contract_id)])[0];
            contract.sign_time = contract.sign_time.slice(0,10);
            contract.delivery_time = contract.delivery_time.slice(0,10);
            contract.validity_time = contract.validity_time.slice(0,10);

            $scope.contractList.push(contract);
        }
    }

    $scope.getContractList();


    // 得到所有相关操作的和
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


    $scope.updateItems = function(){
        var sql = "SELECT item.id as item_id, kind.text, item.code, item.maker, item.detail, item.price, item.unit,* FROM sale_order_item \
                JOIN item ON sale_order_item.item_id = item.id \
                JOIN kind ON item.kind = kind.id \
                WHERE sale_order_item.sale_order_id = ?";

        $scope.totalPrice = 0;
        $scope.items = alasql(sql, [$scope.orderId]);
        for(var i = 0;i < $scope.items.length;i++){
            var sql = "SELECT * FROM sale_order_item \
                        WHERE sale_order_id = ? \
                        AND item_id = ?";
            var res = alasql(sql, [$scope.orderId, $scope.items[i].item_id])[0];
            var sql = "SELECT * FROM sale_order_stock WHERE sale_order_item_id = ?";
            var arrangedStocks = alasql(sql, [res.id]);
            $scope.items[i].arrangedAmount = 0;
            $scope.items[i].exitWarehouseAmount = 0;
            for(var j = 0;j < arrangedStocks.length;j++){
                $scope.items[i].arrangedAmount += parseInt(arrangedStocks[j].amount);
                $scope.items[i].exitWarehouseAmount += -$scope.getOperationSumAmount($scope.orderId, arrangedStocks[j].stock_id, "Exit");
            }

            $scope.totalPrice += $scope.items[i].amount * $scope.items[i].price;
        }
    }

    $scope.updateItems();



    $scope.showArrangeResult = function(){
        var sql = "SELECT sale_order_stock.stock_id, sale_order_stock.amount FROM sale_order_item \
                    JOIN sale_order_stock ON sale_order_item.id = sale_order_stock.sale_order_item_id \
                    WHERE sale_order_item.sale_order_id = ?"
        var stocks = alasql(sql, [$scope.orderId]);
        console.log(stocks);

        var planDisplay = {};
        for(var i = 0;i < stocks.length;i++){
            var row = $searchService.getStockInformation(stocks[i].stock_id);
            if(planDisplay[row.name] == undefined){
                planDisplay[row.name] = {};
                planDisplay[row.name]['data'] = [];
            }
            row.amount = stocks[i].amount;
            row.exitAmount = -$scope.getOperationSumAmount($scope.orderId, stocks[i].stock_id, "Exit");
            row.finished = (row.exitAmount >= row.amount);
            planDisplay[row.name]['data'].push(row);
        }

        $scope.planDisplay = planDisplay;
        if(Object.keys($scope.planDisplay) == 0){
            $scope.hasArrange = false;
        }else{
            $scope.hasArrange = true;
        }


    }

    $scope.showArrangeResult();

    $scope.changeOrderState = function(nextState){
        var sql = 'UPDATE sale_orders SET state = ? WHERE id = ?';
        alasql(sql, [nextState, $scope.orderId]);

        // 添加操作记录
        sql = "INSERT INTO orderoperation VALUES(?,?,?,?,?);";
        alasql(sql,[DB.getNewId('orderoperation'), $scope.orderId, $rootScope.user.id, nextState, new Date().toISOString()]);

        showSuccess("This order is "+nextState+" successfully.");
        $scope.updateOrderInfor();
        $scope.updateOperations();
    }

    $scope.payOrder = function(){
        $scope.changeOrderState("Paid");
    }

    $scope.deliveredOrder = function(){
        $scope.changeOrderState("Delivered");

    }

    $scope.finishOrder = function(){
        $scope.changeOrderState("Finished");
    }


    $scope.printThis = function(event){
        $(event.currentTarget).parents(".panel").find('.panel-body').jqprint();
    }

}]);